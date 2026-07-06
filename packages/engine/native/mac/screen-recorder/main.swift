// SPDX-License-Identifier: MIT
import Foundation
import AppKit
import ScreenCaptureKit
import AVFoundation
import CoreGraphics
import VideoToolbox
import ImageIO
import UniformTypeIdentifiers

// ── Logger ──
// All diagnostic output goes to stderr as structured lines.
// stdout is reserved exclusively for JSON protocol messages.

enum LogLevel: String {
  case info = "INFO"
  case warn = "WARN"
  case error = "ERROR"
}

func log(_ level: LogLevel, _ component: String, _ message: String) {
  let ts = String(format: "%.3f", Date().timeIntervalSince1970)
  fputs("[\(ts)] [\(level.rawValue)] [\(component)] \(message)\n", stderr)
}

// ── Config ──

struct CropRect: Decodable {
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

struct RecordingConfig: Decodable {
  let width: Int
  let height: Int
  let fps: Int
  let bitrate: Int
  /// File descriptor the parent (Electron main) opened for binary
  /// recording-output records. The recorder spawn must include a 4th
  /// stdio pipe so this fd is valid in the child.
  let fd: Int32
}

struct CaptureConfig: Decodable {
  /// "recording" (default — original streaming capture flow) or
  /// "snapshot" (one-shot PNG via SCScreenshotManager). Switches the
  /// whole top-level dispatch in main.
  let mode: String?
  /// Required for recording mode (parent dir for screen.mp4 / system.m4a).
  /// Unused in snapshot mode.
  let outputDir: String?
  /// Required for snapshot mode (full filesystem path for the PNG output).
  /// Unused in recording mode.
  let outputPath: String?
  let displayId: UInt32?
  let windowId: UInt32?
  let fps: Int?
  let showsCursor: Bool?
  let captureAudio: Bool?
  let excludePid: Int32?
  let cropRect: CropRect?
  let recording: RecordingConfig?

  var summary: String {
    var parts: [String] = []
    if let m = mode { parts.append("mode=\(m)") }
    if let d = outputDir { parts.append("outputDir=\(d)") }
    if let p = outputPath { parts.append("outputPath=\(p)") }
    if let d = displayId { parts.append("displayId=\(d)") }
    if let w = windowId { parts.append("windowId=\(w)") }
    if let f = fps { parts.append("fps=\(f)") }
    if let a = captureAudio { parts.append("audio=\(a)") }
    if let p = excludePid { parts.append("excludePid=\(p)") }
    if let c = cropRect {
      parts.append("cropRect=\(c.x),\(c.y),\(c.width)x\(c.height)")
    }
    if let s = recording {
      parts.append("recording=\(s.width)x\(s.height)@\(s.fps)fps,\(s.bitrate)bps,fd=\(s.fd)")
    }
    return parts.joined(separator: ", ")
  }
}

// ── SessionClock ──
// Single source of truth for all timing: start reference, pause accounting,
// and wall-clock correlation for cross-process sync.

class SessionClock {
  private(set) var hostStartTime: CMTime?
  private(set) var wallClockStartMs: Double?
  private var pauseDuration: CMTime = .zero
  private var pauseStart: CMTime?
  private(set) var isPaused = false
  private var pauseCount = 0

  var hasStarted: Bool { hostStartTime != nil }

  func reset() {
    hostStartTime = nil
    wallClockStartMs = nil
    log(.info, "clock", "reset for codec fallback")
  }

  /// Called exactly once when the first video frame arrives.
  /// Captures both host-clock PTS and wall-clock ms at the same instant
  /// so the TypeScript cursor tracker can share the same epoch.
  func markFirstFrame(pts: CMTime) {
    hostStartTime = pts
    wallClockStartMs = Date().timeIntervalSince1970 * 1000
    log(.info, "clock", "epoch set: hostPTS=\(pts.seconds)s, wallClockMs=\(wallClockStartMs!)")
  }

  /// Returns the pause-adjusted PTS relative to session start, or nil if
  /// the result would be negative (frame arrived before session epoch).
  func adjustedPTS(_ pts: CMTime) -> CMTime? {
    guard let start = hostStartTime else { return nil }
    let adjusted = CMTimeSubtract(CMTimeSubtract(pts, start), pauseDuration)
    guard adjusted.seconds >= 0 else { return nil }
    return adjusted
  }

  func pause() {
    isPaused = true
    pauseCount += 1
    pauseStart = CMClockGetTime(CMClockGetHostTimeClock())
    log(.info, "clock", "paused (#\(pauseCount)), totalPauseDuration=\(pauseDuration.seconds)s")
  }

  func resume() {
    if let ps = pauseStart {
      let now = CMClockGetTime(CMClockGetHostTimeClock())
      let elapsed = CMTimeSubtract(now, ps)
      if elapsed.seconds > 0 {
        pauseDuration = CMTimeAdd(pauseDuration, elapsed)
      }
      pauseStart = nil
      log(.info, "clock", "resumed, pauseGap=\(elapsed.seconds)s, totalPauseDuration=\(pauseDuration.seconds)s")
    }
    isPaused = false
  }
}

// ── FrameWriter ──
// Uses VTCompressionSession for zero-buffer video encoding + AVAssetWriter for muxing.
// VTCompressionSession with MaxFrameDelayCount=0 encodes synchronously — each frame
// is fully encoded before the call returns. No internal queue, no accumulation, no crash.

class FrameWriter {
  private var writer: AVAssetWriter?
  private var videoInput: AVAssetWriterInput?
  private var compressionSession: VTCompressionSession?
  private var outputURL: URL?

  private(set) var videoFramesWritten = 0
  var droppedFrames = 0
  private var inFlight = 0      // bounded in-flight frame counter
  private let maxInFlight = 3   // max concurrent encodes
  private(set) var lastVideoPTS: CMTime = .zero
  private(set) var hasFailed = false
  var failureMessage: String?

  var actualDuration: Double {
    return lastVideoPTS.seconds
  }

  var writerStatusString: String {
    guard let w = writer else { return "nil" }
    switch w.status {
    case .unknown: return "unknown"
    case .writing: return "writing"
    case .completed: return "completed"
    case .failed: return "failed(\(w.error.map { "\($0)" } ?? "?"))"
    case .cancelled: return "cancelled"
    @unknown default: return "other(\(w.status.rawValue))"
    }
  }

  func setup(url: URL, width: Int, height: Int, fps: Int) throws {
    self.outputURL = url

    let dir = url.deletingLastPathComponent()
    try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    if FileManager.default.fileExists(atPath: url.path) {
      try? FileManager.default.removeItem(at: url)
    }

    // Create VTCompressionSession — direct hardware encoder control
    var session: VTCompressionSession?
    let status = VTCompressionSessionCreate(
      allocator: nil,
      width: Int32(width),
      height: Int32(height),
      codecType: kCMVideoCodecType_H264,
      encoderSpecification: nil,
      imageBufferAttributes: nil,
      compressedDataAllocator: nil,
      outputCallback: nil,
      refcon: nil,
      compressionSessionOut: &session
    )
    guard status == noErr, let session = session else {
      throw NSError(domain: "FrameWriter", code: 1,
        userInfo: [NSLocalizedDescriptionKey: "VTCompressionSession create failed: \(status)"])
    }

    // Small bounded buffer (3 frames) — allows encoder pipelining without
    // the unbounded accumulation that caused -12785 crashes with AVAssetWriter
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_MaxFrameDelayCount, value: 3 as CFNumber)
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_RealTime, value: kCFBooleanTrue)
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_AllowFrameReordering, value: kCFBooleanFalse)
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_ProfileLevel, value: kVTProfileLevel_H264_High_AutoLevel)
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_ExpectedFrameRate, value: fps as CFNumber)
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_MaxKeyFrameInterval, value: 30 as CFNumber)
    // Quality-based — no fixed bitrate cap
    VTSessionSetProperty(session, key: kVTCompressionPropertyKey_Quality, value: 0.7 as CFNumber)

    VTCompressionSessionPrepareToEncodeFrames(session)
    compressionSession = session
    log(.info, "writer", "VTCompressionSession created: \(width)x\(height)@\(fps)fps, quality=0.7, maxInFlight=3")

    // AVAssetWriter for muxing — video input in passthrough mode needs a format hint
    let w = try AVAssetWriter(url: url, fileType: .mp4)

    // Crash resilience: write a movie-fragment (moof) box every second
    // and prepare for streaming. Without this AVAssetWriter only writes
    // the moov atom at finishWriting() time, so any abnormal exit
    // (app crash, force-quit, hot-reload during recording) leaves
    // screen.mp4 with no index → unplayable, the whole session is lost.
    // With fragmentation, the file is playable up to the last completed
    // fragment even if the writer never gets to call finishWriting.
    w.movieFragmentInterval = CMTime(seconds: 1, preferredTimescale: 1000)
    w.shouldOptimizeForNetworkUse = true

    // Create format hint for H.264 passthrough
    var formatDesc: CMFormatDescription?
    let dimensions = CMVideoDimensions(width: Int32(width), height: Int32(height))
    CMVideoFormatDescriptionCreate(
      allocator: nil,
      codecType: kCMVideoCodecType_H264,
      width: dimensions.width,
      height: dimensions.height,
      extensions: nil,
      formatDescriptionOut: &formatDesc
    )

    let vi = AVAssetWriterInput(mediaType: .video, outputSettings: nil, sourceFormatHint: formatDesc)
    vi.expectsMediaDataInRealTime = true
    w.add(vi)
    writer = w
    videoInput = vi

    guard w.startWriting() else {
      let errDetail = w.error.map { "\($0)" } ?? "no error"
      throw NSError(domain: "FrameWriter", code: 2,
        userInfo: [NSLocalizedDescriptionKey: "startWriting failed: \(errDetail)"])
    }
    log(.info, "writer", "AVAssetWriter ready (video-only), status=\(writerStatusString)")
  }

  func startSession() {
    writer?.startSession(atSourceTime: .zero)
    log(.info, "writer", "session started at .zero")
  }

  /// Encode + mux a video frame. Single-frame-in-flight: if the encoder
  /// is still busy with the previous frame, this one is skipped. No blocking,
  /// no queue accumulation, maximum throughput.
  func appendVideo(_ sampleBuffer: CMSampleBuffer, adjustedPTS: CMTime) -> Bool {
    guard let session = compressionSession else { return false }
    guard let w = writer, w.status == .writing else {
      hasFailed = true
      failureMessage = "Writer not in writing state: \(writerStatusString)"
      return false
    }

    // Bounded in-flight: skip if encoder has too many pending frames
    if inFlight >= maxInFlight {
      droppedFrames += 1
      return false
    }

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      droppedFrames += 1
      return false
    }

    guard adjustedPTS > lastVideoPTS || lastVideoPTS == .zero else {
      droppedFrames += 1
      return false
    }

    inFlight += 1
    lastVideoPTS = adjustedPTS

    let encodeStatus = VTCompressionSessionEncodeFrame(
      session,
      imageBuffer: pixelBuffer,
      presentationTimeStamp: adjustedPTS,
      duration: sampleBuffer.duration,
      frameProperties: nil,
      infoFlagsOut: nil
    ) { [self] status, _, sb in
      defer { inFlight -= 1 }

      guard status == noErr, let encoded = sb else {
        droppedFrames += 1
        if status != noErr && videoFramesWritten > 0 {
          hasFailed = true
          failureMessage = "VTCompressionSession encode failed: \(status)"
          log(.error, "writer", failureMessage!)
        }
        return
      }

      guard let vi = videoInput, vi.isReadyForMoreMediaData else {
        droppedFrames += 1
        return
      }

      if vi.append(encoded) {
        videoFramesWritten += 1
      } else {
        droppedFrames += 1
      }
    }

    if encodeStatus != noErr {
      inFlight -= 1
      droppedFrames += 1
      return false
    }

    return true
  }

  func finalize(
    videoQueue: DispatchQueue,
    completion: @escaping () -> Void
  ) {
    log(.info, "writer", "finalizing: videoFrames=\(videoFramesWritten), dropped=\(droppedFrames), duration=\(String(format: "%.2f", actualDuration))s")

    // Flush remaining encoded frames
    if let session = compressionSession {
      VTCompressionSessionCompleteFrames(session, untilPresentationTimeStamp: .invalid)
    }

    videoQueue.sync {}

    guard let w = writer, w.status == .writing else {
      completion()
      return
    }

    videoInput?.markAsFinished()

    w.finishWriting {
      log(.info, "writer", "finishWriting complete, status=\(self.writerStatusString)")
      completion()
    }
  }

  func releaseResources() {
    if let session = compressionSession {
      VTCompressionSessionInvalidate(session)
      compressionSession = nil
    }
    videoInput = nil
    writer = nil
    log(.info, "writer", "resources released")
  }
}

// ── AudioWriter ──
// Separate AVAssetWriter that writes system audio to system.m4a. Keeping
// audio out of screen.mp4 lets the editor mix mic/system independently per
// segment; the video file stays pure video so seek/scrub isn't slowed by
// interleaved audio packets.

class AudioWriter {
  private var writer: AVAssetWriter?
  private var audioInput: AVAssetWriterInput?
  private(set) var audioFramesWritten = 0
  private(set) var lastAudioPTS: CMTime = .zero
  private(set) var outputURL: URL?
  private(set) var started = false

  var writerStatusString: String {
    guard let w = writer else { return "nil" }
    switch w.status {
    case .unknown: return "unknown"
    case .writing: return "writing"
    case .completed: return "completed"
    case .failed: return "failed(\(w.error.map { "\($0)" } ?? "?"))"
    case .cancelled: return "cancelled"
    @unknown default: return "other(\(w.status.rawValue))"
    }
  }

  func setup(url: URL) throws {
    self.outputURL = url

    let dir = url.deletingLastPathComponent()
    try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    if FileManager.default.fileExists(atPath: url.path) {
      try? FileManager.default.removeItem(at: url)
    }

    let w = try AVAssetWriter(url: url, fileType: .m4a)
    // Crash resilience — same reasoning as FrameWriter above. Without
    // periodic moof boxes the system audio file is unplayable when a
    // crash skips finishWriting().
    w.movieFragmentInterval = CMTime(seconds: 1, preferredTimescale: 1000)
    w.shouldOptimizeForNetworkUse = true
    let settings: [String: Any] = [
      AVFormatIDKey: kAudioFormatMPEG4AAC,
      AVSampleRateKey: 48000,
      AVNumberOfChannelsKey: 2,
      AVEncoderBitRateKey: 128000,
    ]
    let ai = AVAssetWriterInput(mediaType: .audio, outputSettings: settings)
    ai.expectsMediaDataInRealTime = true
    if w.canAdd(ai) {
      w.add(ai)
    } else {
      throw NSError(domain: "AudioWriter", code: 1,
        userInfo: [NSLocalizedDescriptionKey: "cannot add audio input"])
    }

    guard w.startWriting() else {
      let errDetail = w.error.map { "\($0)" } ?? "no error"
      throw NSError(domain: "AudioWriter", code: 2,
        userInfo: [NSLocalizedDescriptionKey: "startWriting failed: \(errDetail)"])
    }

    writer = w
    audioInput = ai
    log(.info, "audio-writer", "ready (48kHz stereo AAC) → \(url.lastPathComponent)")
  }

  func startSessionIfNeeded() {
    guard !started else { return }
    writer?.startSession(atSourceTime: .zero)
    started = true
    log(.info, "audio-writer", "session started at .zero")
  }

  func append(_ buffer: CMSampleBuffer, adjustedPTS: CMTime) -> Bool {
    guard let w = writer, w.status == .writing else { return false }
    guard adjustedPTS > lastAudioPTS || lastAudioPTS == .zero else { return false }
    guard let ai = audioInput, ai.isReadyForMoreMediaData else { return false }

    let timing = CMSampleTimingInfo(
      duration: buffer.duration,
      presentationTimeStamp: adjustedPTS,
      decodeTimeStamp: .invalid
    )
    guard let retimed = try? CMSampleBuffer(copying: buffer, withNewTiming: [timing]) else {
      return false
    }

    if ai.append(retimed) {
      audioFramesWritten += 1
      lastAudioPTS = adjustedPTS
      return true
    }
    return false
  }

  func finalize(audioQueue: DispatchQueue, completion: @escaping () -> Void) {
    log(.info, "audio-writer", "finalizing: audioFrames=\(audioFramesWritten), duration=\(String(format: "%.2f", lastAudioPTS.seconds))s")
    audioQueue.sync {}

    guard let w = writer, w.status == .writing else {
      completion()
      return
    }

    audioInput?.markAsFinished()
    w.finishWriting {
      log(.info, "audio-writer", "finishWriting complete, status=\(self.writerStatusString)")
      completion()
    }
  }

  func releaseResources() {
    audioInput = nil
    writer = nil
  }
}

// ── StreamCapture ──
// Owns SCStream configuration and lifecycle, delegates frames via closures.

struct StreamInfo {
  let windowFrame: CGRect?
  let cornerRadius: Double?
  let width: Int
  let height: Int
  let effectiveFps: Int
  let wantsAudio: Bool
}

// Detect the captured window's top-left corner radius (in points) by taking
// a one-shot SCScreenshotManager screenshot of just the window and walking
// its alpha mask down the left edge. The first opaque pixel from the top
// is at y = radius. Returns nil on capture failure or if the corner pixel
// is already opaque (a non-rounded window). The brief window-mode screenshot
// runs before the actual recording stream starts, so any badge it might
// trigger is invisible to the live recording.
@available(macOS 14.0, *)
func detectWindowCornerRadius(window: SCWindow) async -> Double? {
  do {
    let frame = window.frame
    guard frame.width > 0, frame.height > 0 else { return nil }
    let filter = SCContentFilter(desktopIndependentWindow: window)
    let config = SCStreamConfiguration()
    let scale = Int(NSScreen.main?.backingScaleFactor ?? 2)
    config.width = Int(frame.width) * scale
    config.height = Int(frame.height) * scale
    config.showsCursor = false
    config.captureResolution = .best
    let cgImage = try await SCScreenshotManager.captureImage(
      contentFilter: filter, configuration: config)

    let width = cgImage.width
    let height = cgImage.height
    guard width > 0, height > 0 else { return nil }

    let pointsPerPixel = Double(frame.height) / Double(height)
    let scanLimit = min(80, min(width, height))
    let bytesPerPixel = 4
    let bytesPerRow = width * bytesPerPixel
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let context = CGContext(
      data: nil,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: bytesPerRow,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return nil }

    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    guard let buffer = context.data else { return nil }
    let pixels = buffer.bindMemory(to: UInt8.self, capacity: bytesPerRow * height)

    // CGContext memory is bottom-up: y=height-1 is the top row.
    var sawTransparent = false
    var detectedPixels = 0
    for d in 0..<scanLimit {
      let topRow = height - 1 - d
      let alphaOffset = topRow * bytesPerRow + 3
      let alpha = pixels[alphaOffset]
      if alpha < 32 {
        sawTransparent = true
        continue
      }
      if sawTransparent {
        detectedPixels = d
        break
      } else {
        return 0  // window's top-left is already opaque — no rounded corner
      }
    }

    if detectedPixels > 0 && detectedPixels < scanLimit {
      return Double(detectedPixels) * pointsPerPixel
    }
    return nil
  } catch {
    log(.warn, "radius", "SCK corner-radius capture failed: \(error)")
    return nil
  }
}

class StreamCapture: NSObject, SCStreamOutput, SCStreamDelegate {
  private var stream: SCStream?
  let videoQueue = DispatchQueue(label: "screen-recorder.video", qos: .userInteractive)
  let audioQueue = DispatchQueue(label: "screen-recorder.audio", qos: .userInteractive)

  var onVideoFrame: ((CMSampleBuffer) -> Void)?
  var onAudioFrame: ((CMSampleBuffer) -> Void)?
  var onStreamError: ((Error) -> Void)?

  // Additive fan-out for the link-sharing pipeline. When set, this
  // closure is invoked on the videoQueue immediately after onVideoFrame
  // for each .screen sample buffer. The same buffer is passed through
  // unchanged. The consumer is expected to dispatch to its own queue
  // before doing any heavy work — running synchronously here would
  // back up the writer. See docs/spikes/recording-tap.md.
  var onRecordingFrame: ((CMSampleBuffer) -> Void)?
  // Parallel fan-out for recording-mode audio. Wired only when config.recording
  // is set (see SessionManager.start where RecordingWriter is constructed).
  // Studio recordings leave this nil so audio flows only into the
  // on-disk system.m4a AudioWriter, exactly as before.
  var onRecordingAudio: ((CMSampleBuffer) -> Void)?

  func start(config: CaptureConfig) async throws -> StreamInfo {
    let content = try await SCShareableContent.excludingDesktopWindows(
      false, onScreenWindowsOnly: true
    )

    let streamConfig = SCStreamConfiguration()
    streamConfig.showsCursor = config.showsCursor ?? false
    streamConfig.pixelFormat = kCVPixelFormatType_32BGRA
    streamConfig.queueDepth = 3

    let wantsAudio = config.captureAudio ?? true
    if wantsAudio {
      streamConfig.capturesAudio = true
      streamConfig.excludesCurrentProcessAudio = true
    }

    let filter: SCContentFilter
    var windowFrame: CGRect?
    var cornerRadius: Double?

    if let windowId = config.windowId {
      guard let window = content.windows.first(where: { $0.windowID == windowId }) else {
        throw NSError(domain: "StreamCapture", code: 2,
          userInfo: [NSLocalizedDescriptionKey: "Window \(windowId) not found"])
      }
      let frame = window.frame
      windowFrame = frame
      let scale = Int(NSScreen.main?.backingScaleFactor ?? 2)
      streamConfig.width = Int(frame.width) * scale
      streamConfig.height = Int(frame.height) * scale

      // Detect the window's actual corner radius before kicking off the
      // recording stream. The renderer pipes this into the dim overlay so
      // its rounded cutout matches the captured chrome's curve precisely.
      if #available(macOS 14.0, *) {
        cornerRadius = await detectWindowCornerRadius(window: window)
        log(.info, "capture", "detected cornerRadius: \(cornerRadius.map { String($0) } ?? "nil")")
      }

      // Display-mode filter (no window naming) + sourceRect crop. Naming a
      // window in the filter (`desktopIndependentWindow:` or `including:`)
      // makes macOS Sonoma 14.4+ overlay the "screen recording" privacy
      // badge on the captured window's traffic lights. Display-mode capture
      // doesn't trigger the per-window badge, so the real traffic lights
      // survive in the recording. Trade-off: occluding windows over the
      // target are captured, and the source rect is locked to the window's
      // initial frame (no live follow on move/resize).
      let targetDisplayId = config.displayId ?? CGMainDisplayID()
      guard let display = content.displays.first(where: { $0.displayID == targetDisplayId })
        ?? content.displays.first else {
        throw NSError(domain: "StreamCapture", code: 1,
          userInfo: [NSLocalizedDescriptionKey: "No display found"])
      }

      let excludedApps: [SCRunningApplication]
      if let pid = config.excludePid {
        excludedApps = content.applications.filter { $0.processID == pid }
      } else {
        excludedApps = []
      }

      filter = SCContentFilter(
        display: display,
        excludingApplications: excludedApps,
        exceptingWindows: []
      )
      streamConfig.sourceRect = frame

      log(.info, "capture", "window capture: id=\(windowId), frame=\(frame), scale=\(scale), outputSize=\(streamConfig.width)x\(streamConfig.height), displayId=\(display.displayID), excludedApps=\(excludedApps.count)")
    } else {
      let targetDisplayId = config.displayId ?? CGMainDisplayID()
      guard let display = content.displays.first(where: { $0.displayID == targetDisplayId })
        ?? content.displays.first else {
        throw NSError(domain: "StreamCapture", code: 1,
          userInfo: [NSLocalizedDescriptionKey: "No display found"])
      }

      let scale = Int(NSScreen.main?.backingScaleFactor ?? 2)

      // Area capture: crop the display to the provided rect.
      if let crop = config.cropRect {
        let cropFrame = CGRect(x: crop.x, y: crop.y, width: crop.width, height: crop.height)
        windowFrame = cropFrame
        streamConfig.width = Int(crop.width) * scale
        streamConfig.height = Int(crop.height) * scale
        streamConfig.sourceRect = cropFrame
      } else {
        streamConfig.width = display.width * scale
        streamConfig.height = display.height * scale
      }

      let excludedApps: [SCRunningApplication]
      if let pid = config.excludePid {
        excludedApps = content.applications.filter { $0.processID == pid }
      } else {
        excludedApps = []
      }

      filter = SCContentFilter(
        display: display,
        excludingApplications: excludedApps,
        exceptingWindows: []
      )
      let mode = config.cropRect != nil ? "area" : "display"
      log(.info, "capture", "\(mode) capture: id=\(display.displayID), size=\(display.width)x\(display.height), scale=\(scale), outputSize=\(streamConfig.width)x\(streamConfig.height), excludedApps=\(excludedApps.count)")
    }

    let requestedFps = config.fps ?? 60
    let effectiveFps = min(requestedFps, 60)

    streamConfig.minimumFrameInterval = CMTime(
      value: 1, timescale: CMTimeScale(effectiveFps)
    )
    log(.info, "capture", "fps: requested=\(requestedFps), effective=\(effectiveFps)")

    // 1-pixel hack for FB12013032: SCK consistently renders a single
    // row of black pixels at the very top of every output buffer on
    // macOS Sonoma+. Offsetting destinationRect by -1 in y pushes that
    // row above the output buffer's content box where it's clipped
    // away. The source content stretches across (height+1) rows of an
    // (height)-row output, which is a vertical scale of (h+1)/h — at
    // 1080p that's 0.09%, well below perceptual threshold. Same
    // workaround Loom / CleanShotX / Replay use.
    streamConfig.destinationRect = CGRect(
      x: 0,
      y: -1,
      width: CGFloat(streamConfig.width),
      height: CGFloat(streamConfig.height + 1)
    )

    stream = SCStream(filter: filter, configuration: streamConfig, delegate: self)
    try stream?.addStreamOutput(self, type: .screen, sampleHandlerQueue: videoQueue)
    if wantsAudio {
      try stream?.addStreamOutput(self, type: .audio, sampleHandlerQueue: audioQueue)
    }

    log(.info, "capture", "starting SCStream capture: fps=\(effectiveFps), \(streamConfig.width)x\(streamConfig.height), audio=\(wantsAudio)")
    try await stream?.startCapture()
    log(.info, "capture", "SCStream capture started successfully")

    return StreamInfo(
      windowFrame: windowFrame,
      cornerRadius: cornerRadius,
      width: streamConfig.width,
      height: streamConfig.height,
      effectiveFps: effectiveFps,
      wantsAudio: wantsAudio
    )
  }

  func stop(completion: @escaping () -> Void) {
    log(.info, "capture", "stopping SCStream...")
    let capturedStream = stream
    stream = nil

    guard let capturedStream = capturedStream else {
      log(.warn, "capture", "no active stream to stop")
      completion()
      return
    }

    let once = DispatchQueue(label: "stream-capture.stop-once")
    var done = false

    let tryComplete = {
      var shouldRun = false
      once.sync {
        if !done {
          done = true
          shouldRun = true
        }
      }
      if shouldRun {
        log(.info, "capture", "SCStream stopped")
        completion()
      }
    }

    capturedStream.stopCapture { _ in
      DispatchQueue.global(qos: .userInitiated).async { tryComplete() }
    }

    // Fallback if stopCapture callback never fires
    DispatchQueue.global(qos: .userInitiated).asyncAfter(deadline: .now() + 3) {
      log(.warn, "capture", "stopCapture fallback timeout triggered")
      tryComplete()
    }
  }

  // SCStreamOutput
  func stream(
    _ stream: SCStream,
    didOutputSampleBuffer sampleBuffer: CMSampleBuffer,
    of type: SCStreamOutputType
  ) {
    switch type {
    case .screen:
      onVideoFrame?(sampleBuffer)
      onRecordingFrame?(sampleBuffer)
    case .audio:
      onAudioFrame?(sampleBuffer)
      onRecordingAudio?(sampleBuffer)
    @unknown default:
      break
    }
  }

  // SCStreamDelegate
  func stream(_ stream: SCStream, didStopWithError error: Error) {
    log(.error, "capture", "SCStream stopped with error: \(error)")
    onStreamError?(error)
  }
}

// ── RecordingSession ──
// Top-level orchestrator: wires clock, writer, and capture together,
// handles stdin commands, emits JSON status/health/errors to stdout.

class RecordingSession {
  let clock = SessionClock()
  let writer = FrameWriter()
  let audioWriter = AudioWriter()
  let capture = StreamCapture()
  let config: CaptureConfig
  let outputPath: String
  let systemAudioPath: String

  private var stopped = false
  private var wantsAudio = false
  private var audioWriterReady = false
  private var healthTimer: DispatchSourceTimer?
  private(set) var streamInfo: StreamInfo?
  private var recordingStatusEmitted = false
  // Frames observed off the SCK stream (not necessarily appended to the
  // local writer). Drives the "recording confirmed stable" emission so
  // the heuristic still fires in recording mode where the local writer is
  // bypassed and writer.videoFramesWritten stays at 0.
  private var videoFramesObserved = 0
  // Recording mode skips all local-disk writes — no screen.mp4, no
  // system.m4a, no tracking.json — and just streams to R2 via the
  // recordingWriter (fd 3). Set once from config.recording, read everywhere.
  private var isRecording: Bool { config.recording != nil }

  // Spike-only: holds the recording-tap consumer when CAPTUREFLOW_RECORDING_TAP_SPIKE=1
  // AND no production recording config is present. Once the recording feature
  // is fully shipped + stable this can be removed alongside spikes/.
  private var recordingTapSpike: RecordingTapSpike?

  // Production recording-export pipeline. Initialised when CaptureConfig.recording
  // is non-nil (Electron toggled "Instant Recording" + the recording is
  // under the 1-min cap). Encodes a downscaled H.264 stream and
  // writes length-prefixed records to the fd opened by the parent.
  private var recordingWriter: RecordingWriter?

  init(config: CaptureConfig) {
    self.config = config
    // outputDir is required for recording mode; the top-level main
    // dispatch guards on this before constructing RecordingSession.
    let dir = config.outputDir ?? ""
    self.outputPath = (dir as NSString).appendingPathComponent("screen.mp4")
    self.systemAudioPath = (dir as NSString).appendingPathComponent("system.m4a")
    log(.info, "session", "initialized: \(config.summary)")
    log(.info, "session", "output: \(outputPath)")
  }

  func start() async throws {
    log(.info, "session", "starting capture...")

    // Start capture first to get stream info (resolution, settings)
    // Frame callbacks are NOT wired yet — frames are harmlessly dropped
    // until the writer is ready.
    let info = try await capture.start(config: config)
    streamInfo = info
    wantsAudio = info.wantsAudio
    log(.info, "session", "capture started: \(info.width)x\(info.height) @ \(info.effectiveFps)fps, audio=\(info.wantsAudio)")

    // Set up writer BEFORE wiring frame callbacks so the writer is
    // guaranteed to be ready when the first forwarded frame arrives.
    // Skipped entirely in recording mode — no screen.mp4 on disk.
    if !isRecording {
      let url = URL(fileURLWithPath: outputPath)
      try writer.setup(
        url: url,
        width: info.width,
        height: info.height,
        fps: info.effectiveFps
      )

      // Audio goes to a separate AAC container so the editor can remix
      // mic + system independently per segment on export. Also skipped
      // in recording mode — system audio rides the screen MP4 via the
      // recordingWriter's AAC track instead.
      if wantsAudio {
        do {
          let audioUrl = URL(fileURLWithPath: systemAudioPath)
          try audioWriter.setup(url: audioUrl)
          audioWriterReady = true
        } catch {
          log(.warn, "session", "audio writer setup failed: \(error) — continuing without system audio")
          wantsAudio = false
        }
      }
    } else {
      log(.info, "session", "recording mode: skipping local screen.mp4 + system.m4a writers")
    }

    // NOW wire up frame callbacks — writer is ready, frames will be processed
    capture.onVideoFrame = { [weak self] buffer in
      self?.handleVideoFrame(buffer)
    }
    capture.onAudioFrame = { [weak self] buffer in
      self?.handleAudioFrame(buffer)
    }
    capture.onStreamError = { [weak self] error in
      self?.handleStreamError(error)
    }

    // Production recording-export wiring. Runs on the same videoQueue as
    // onVideoFrame; RecordingWriter dispatches encoder + fd writes onto
    // its own queue so this hot path stays cheap.
    if let recordingCfg = config.recording {
      let writer = RecordingWriter(
        width: recordingCfg.width,
        height: recordingCfg.height,
        fps: recordingCfg.fps,
        bitrate: recordingCfg.bitrate,
        fd: recordingCfg.fd
      )
      do {
        try writer.start()
        recordingWriter = writer
        capture.onRecordingFrame = { [weak writer] buffer in
          writer?.pushFrame(buffer)
        }
        capture.onRecordingAudio = { [weak writer] buffer in
          writer?.pushAudio(buffer)
        }
        log(.info, "session", "recording-writer enabled: \(recordingCfg.width)x\(recordingCfg.height)@\(recordingCfg.fps)fps")
      } catch {
        log(.error, "session", "recording-writer start failed: \(error) — continuing without recording")
      }
    } else if ProcessInfo.processInfo.environment["CAPTUREFLOW_RECORDING_TAP_SPIKE"] == "1" {
      // Spike-only: closure-based fan-out for the recording-tap. Disabled
      // when the production recording writer is active — the two would
      // race for the single onRecordingFrame closure.
      let spike = RecordingTapSpike()
      recordingTapSpike = spike
      capture.onRecordingFrame = { buffer in spike.handle(buffer) }
      log(.info, "spike", "recording-tap: closure fan-out enabled")
    }

    log(.info, "session", "frame callbacks wired, waiting for first frame...")

    startHealthReporting()
  }

  func stop(completion: @escaping (String, String?, Double) -> Void) {
    log(.info, "session", "stop requested")
    stopped = true
    healthTimer?.cancel()
    healthTimer = nil
    recordingTapSpike?.finalReport()
    recordingTapSpike = nil
    recordingWriter?.finish()
    recordingWriter = nil

    capture.stop { [self] in
      // Recording mode: no local writers to finalize. Hand the renderer
      // empty paths + 0 duration — handleNativeRecordingStopped's recording
      // branch ignores those fields anyway (it reads the recording
      // pipeline's own result for duration/size). The recordingWriter was
      // already flushed via its finish() call above.
      if isRecording {
        log(.info, "session", "stopped (recording): videoFramesObserved=\(self.videoFramesObserved)")
        completion("", nil, 0)
        return
      }
      let group = DispatchGroup()
      group.enter()
      writer.finalize(videoQueue: capture.videoQueue) {
        group.leave()
      }
      if audioWriterReady {
        group.enter()
        audioWriter.finalize(audioQueue: capture.audioQueue) {
          group.leave()
        }
      }
      group.notify(queue: .main) {
        let duration = self.writer.actualDuration
        let audioPath: String? = self.audioWriterReady && self.audioWriter.audioFramesWritten > 0
          ? self.systemAudioPath
          : nil
        log(.info, "session", "stopped: duration=\(String(format: "%.2f", duration))s, videoFrames=\(self.writer.videoFramesWritten), audioFrames=\(self.audioWriter.audioFramesWritten), dropped=\(self.writer.droppedFrames)")
        self.writer.releaseResources()
        self.audioWriter.releaseResources()
        completion(self.outputPath, audioPath, duration)
      }
    }
  }

  func pause() {
    log(.info, "session", "pause requested")
    clock.pause()
  }

  func resume() {
    log(.info, "session", "resume requested")
    clock.resume()
  }

  // ── Frame Handlers ──

  private func handleVideoFrame(_ sampleBuffer: CMSampleBuffer) {
    guard !stopped, !clock.isPaused else { return }

    guard sampleBuffer.isValid else {
      if !isRecording { writer.droppedFrames += 1 }
      return
    }

    // Recording mode: writer was never set up. Frames flow to recordingWriter
    // via the separate onRecordingFrame callback wired in start(); here we
    // just bootstrap the clock (needed for emitRecordingStatus's
    // wallClockMs — without it the renderer's overlay sees elapsed =
    // Date.now() - 0 and tripping the cap-stop within a frame),
    // count observed frames, and emit the "stable" status once the
    // stream has produced enough of them.
    if isRecording {
      let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
      if !clock.hasStarted {
        clock.markFirstFrame(pts: pts)
        log(.info, "session", "first recording frame, session clock started")
      }
      videoFramesObserved += 1
      if !recordingStatusEmitted && videoFramesObserved >= 10 {
        emitRecordingStatus()
        log(.info, "session", "recording confirmed stable at \(videoFramesObserved) frames")
      }
      return
    }

    if writer.hasFailed {
      if !stopped {
        let msg = writer.failureMessage ?? "unknown"
        log(.error, "session", "writer failure: \(msg)")

        if !recordingStatusEmitted {
          // Failed before confirming stable — exit so TS can retry
          stopped = true
          fputs("{\"error\":\"\(msg)\"}\n", stdout)
          fflush(stdout)
          _exit(1)
        }

        // Failed mid-recording — gracefully stop and save what we have
        log(.warn, "session", "encoder stopped mid-recording, saving \(writer.videoFramesWritten) frames")
        stopped = true
        capture.stop { [self] in
          let group = DispatchGroup()
          group.enter()
          writer.finalize(videoQueue: capture.videoQueue) { group.leave() }
          if audioWriterReady {
            group.enter()
            audioWriter.finalize(audioQueue: capture.audioQueue) { group.leave() }
          }
          group.notify(queue: .main) {
            let duration = self.writer.actualDuration
            let w = self.streamInfo?.width ?? 0
            let h = self.streamInfo?.height ?? 0
            let audioField: String
            if self.audioWriterReady && self.audioWriter.audioFramesWritten > 0 {
              audioField = ",\"systemAudioPath\":\"\(self.systemAudioPath)\""
            } else {
              audioField = ""
            }
            log(.info, "session", "graceful save: duration=\(String(format: "%.2f", duration))s, frames=\(self.writer.videoFramesWritten)")
            self.writer.releaseResources()
            self.audioWriter.releaseResources()
            fputs("{\"status\":\"stopped\",\"path\":\"\(self.outputPath)\",\"duration\":\(duration),\"width\":\(w),\"height\":\(h)\(audioField)}\n", stdout)
            fflush(stdout)
            _exit(0)
          }
        }
      }
      return
    }

    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)

    // First frame: establish timing epoch
    if !clock.hasStarted {
      clock.markFirstFrame(pts: pts)
      writer.startSession()
      log(.info, "session", "first frame, session started")
    }

    // Adjust PTS: subtract start time and pause duration.
    // This is passed to VTCompressionSession (no CMSampleBuffer copying).
    guard let adjusted = clock.adjustedPTS(pts) else { return }
    let _ = writer.appendVideo(sampleBuffer, adjustedPTS: adjusted)
    videoFramesObserved += 1

    // Emit "recording" status after encoder proves stable (~10 frames).
    // If it fails before this, the process exits with an error so the
    // TS side can retry with a fresh process.
    if !recordingStatusEmitted && writer.videoFramesWritten >= 10 {
      emitRecordingStatus()
      log(.info, "session", "recording confirmed stable at \(writer.videoFramesWritten) frames")
    }
  }

  private func handleAudioFrame(_ sampleBuffer: CMSampleBuffer) {
    // Recording mode: system audio is captured by recordingWriter via the
    // separate onRecordingAudio callback (PCM → AAC → fd 3). The on-disk
    // audioWriter is never set up, so this path is a no-op.
    if isRecording { return }
    guard !stopped, !clock.isPaused, wantsAudio, audioWriterReady else { return }
    guard sampleBuffer.isValid else { return }
    guard writer.hasFailed == false else { return }
    guard clock.hasStarted else { return }

    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    guard let adjusted = clock.adjustedPTS(pts) else { return }
    audioWriter.startSessionIfNeeded()
    let _ = audioWriter.append(sampleBuffer, adjustedPTS: adjusted)
  }

  private func handleStreamError(_ error: Error) {
    log(.error, "session", "stream error: \(error)")
    emitJSON(["type": "error", "source": "stream", "message": error.localizedDescription, "fatal": true])
  }

  // ── Status Emission ──

  private func emitRecordingStatus() {
    guard !recordingStatusEmitted else { return }
    recordingStatusEmitted = true

    var msg: [String: Any] = [
      "status": "recording",
      "wallClockMs": clock.wallClockStartMs ?? 0,
    ]
    if let f = streamInfo?.windowFrame {
      msg["windowBounds"] = [
        "x": f.origin.x,
        "y": f.origin.y,
        "width": f.size.width,
        "height": f.size.height,
      ]
    }
    if let r = streamInfo?.cornerRadius {
      msg["cornerRadius"] = r
    }
    emitJSON(msg)
  }

  private func startHealthReporting() {
    let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global(qos: .utility))
    timer.schedule(deadline: .now() + 2, repeating: 2.0)
    timer.setEventHandler { [weak self] in
      guard let self = self, !self.stopped else { return }
      self.emitJSON([
        "type": "health",
        "videoFrames": self.writer.videoFramesWritten,
        "audioFrames": self.audioWriter.audioFramesWritten,
        "dropped": self.writer.droppedFrames,
        "duration": self.writer.actualDuration,
      ])
    }
    timer.resume()
    healthTimer = timer
  }

  private func emitJSON(_ dict: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: dict),
       let str = String(data: data, encoding: .utf8) {
      fputs("\(str)\n", stdout)
      fflush(stdout)
    }
  }
}

// ── Snapshot mode ──
// Single-shot still capture via SCScreenshotManager. Used by the
// Screenshot tab in the desktop's recording toolbar: the user picks a
// Display / Window / Area, this entry point fires once, writes a PNG to
// outputPath, and exits. No streaming, no audio, no stdin commands.

@available(macOS 14.0, *)
func runSnapshotMode(_ config: CaptureConfig) async throws {
  guard let outputPath = config.outputPath else {
    throw NSError(
      domain: "snapshot", code: 1,
      userInfo: [NSLocalizedDescriptionKey: "snapshot mode requires `outputPath`"]
    )
  }

  let content = try await SCShareableContent.excludingDesktopWindows(
    false, onScreenWindowsOnly: true
  )

  // Resolve the SCContentFilter + capture dimensions for whichever
  // source the caller picked. Window mode is straightforward; display
  // and area both filter on the display and (for area) clip via
  // sourceRect on the stream config.
  let filter: SCContentFilter
  var sourceRect: CGRect? = nil
  var pixelWidth: Int
  var pixelHeight: Int
  let scale = Int(NSScreen.main?.backingScaleFactor ?? 2)

  if let windowId = config.windowId {
    guard let window = content.windows.first(where: { $0.windowID == windowId }) else {
      throw NSError(
        domain: "snapshot", code: 2,
        userInfo: [NSLocalizedDescriptionKey: "windowId \(windowId) not found"]
      )
    }
    filter = SCContentFilter(desktopIndependentWindow: window)
    pixelWidth = Int(window.frame.width) * scale
    pixelHeight = Int(window.frame.height) * scale
  } else if let displayId = config.displayId {
    guard let display = content.displays.first(where: { $0.displayID == displayId }) else {
      throw NSError(
        domain: "snapshot", code: 3,
        userInfo: [NSLocalizedDescriptionKey: "displayId \(displayId) not found"]
      )
    }
    // Exclude CaptureFlow's own UI (the recording toolbar window, plus
    // any leftover selection overlay) so the snapshot is a clean
    // picture of the user's desktop — not a picture of the picker.
    let excludingApps: [SCRunningApplication]
    if let excludePid = config.excludePid {
      excludingApps = content.applications.filter { $0.processID == excludePid }
    } else {
      excludingApps = []
    }
    filter = SCContentFilter(
      display: display,
      excludingApplications: excludingApps,
      exceptingWindows: []
    )
    if let crop = config.cropRect {
      sourceRect = CGRect(x: crop.x, y: crop.y, width: crop.width, height: crop.height)
      pixelWidth = max(1, Int(crop.width) * scale)
      pixelHeight = max(1, Int(crop.height) * scale)
    } else {
      // Full-display capture: pin `sourceRect` to the display's point
      // frame. SCScreenshotManager doesn't auto-fill the buffer from
      // the filter the way SCStream does — without an explicit
      // `sourceRect`, it draws the display at 1:1 point→pixel into
      // the buffer's upper-left quadrant, leaving the remaining 3/4
      // black on retina screens (because the buffer is scaled up).
      // Window/area modes already set sourceRect, which is why only
      // display screenshots were affected.
      sourceRect = CGRect(
        x: 0, y: 0,
        width: CGFloat(display.width),
        height: CGFloat(display.height)
      )
      pixelWidth = Int(display.width) * scale
      pixelHeight = Int(display.height) * scale
    }
  } else {
    throw NSError(
      domain: "snapshot", code: 4,
      userInfo: [NSLocalizedDescriptionKey: "snapshot requires displayId or windowId"]
    )
  }

  let captureConfig = SCStreamConfiguration()
  captureConfig.width = pixelWidth
  captureConfig.height = pixelHeight
  // Cursor is excluded by default for snapshots. Most product/UI
  // screenshots are cleaner without the pointer baked in; users who
  // want it can re-screenshot with a delay and edit it in.
  captureConfig.showsCursor = config.showsCursor ?? false
  captureConfig.captureResolution = .best
  if let sr = sourceRect {
    captureConfig.sourceRect = sr
  }

  log(.info, "snapshot", "capturing \(pixelWidth)x\(pixelHeight) → \(outputPath)")

  let cgImage = try await SCScreenshotManager.captureImage(
    contentFilter: filter,
    configuration: captureConfig
  )

  // Encode CGImage → PNG. CGImageDestination writes synchronously, so
  // by the time we read the file size below the bytes are committed.
  let url = URL(fileURLWithPath: outputPath)
  guard let destination = CGImageDestinationCreateWithURL(
    url as CFURL,
    UTType.png.identifier as CFString,
    1,
    nil
  ) else {
    throw NSError(
      domain: "snapshot", code: 5,
      userInfo: [NSLocalizedDescriptionKey: "could not create PNG destination at \(outputPath)"]
    )
  }
  CGImageDestinationAddImage(destination, cgImage, nil)
  guard CGImageDestinationFinalize(destination) else {
    throw NSError(
      domain: "snapshot", code: 6,
      userInfo: [NSLocalizedDescriptionKey: "PNG finalize failed"]
    )
  }

  let fileSize = ((try? FileManager.default.attributesOfItem(atPath: outputPath))?[.size] as? Int) ?? 0
  let payload =
    "{\"ok\":true,\"path\":\"\(outputPath)\"," +
    "\"width\":\(cgImage.width),\"height\":\(cgImage.height)," +
    "\"bytes\":\(fileSize)}"
  fputs("\(payload)\n", stdout)
  fflush(stdout)
}

// ── Main ──

guard CommandLine.arguments.count > 1,
      let data = CommandLine.arguments[1].data(using: .utf8),
      let config = try? JSONDecoder().decode(CaptureConfig.self, from: data) else {
  fputs("{\"error\":\"Usage: screen-recorder '{json config}'\"}\n", stderr)
  exit(1)
}

log(.info, "main", "screen-recorder process started (pid=\(ProcessInfo.processInfo.processIdentifier))")
log(.info, "main", "config: \(config.summary)")

// Hide from Dock and prevent activation
let app = NSApplication.shared
app.setActivationPolicy(.accessory)

// Snapshot mode short-circuits before constructing the RecordingSession:
// one-shot capture → PNG → exit. No stdin commands, no clock, no audio.
if config.mode == "snapshot" {
  if #available(macOS 14.0, *) {
    Task {
      do {
        try await runSnapshotMode(config)
        exit(0)
      } catch {
        log(.error, "main", "snapshot failed: \(error)")
        fputs("{\"error\":\"\(error.localizedDescription)\"}\n", stdout)
        fflush(stdout)
        exit(1)
      }
    }
    RunLoop.main.run()
  } else {
    fputs("{\"error\":\"snapshot mode requires macOS 14.0 or later\"}\n", stdout)
    fflush(stdout)
    exit(1)
  }
}

// Recording mode requires outputDir — the rest of the pipeline writes
// screen.mp4 + system.m4a into that directory.
guard config.outputDir != nil else {
  fputs("{\"error\":\"recording mode requires outputDir\"}\n", stdout)
  fflush(stdout)
  exit(1)
}

let session = RecordingSession(config: config)

Task {
  do {
    try await session.start()

    // Safety timeout: if no first frame arrives within 10s, report error
    DispatchQueue.global().asyncAfter(deadline: .now() + 10) {
      if !session.clock.hasStarted {
        log(.error, "main", "no video frames received within 10 seconds, aborting")
        fputs("{\"error\":\"No video frames received within 10 seconds\"}\n", stdout)
        fflush(stdout)
        _exit(1)
      }
    }
  } catch {
    log(.error, "main", "start failed: \(error)")
    fputs("{\"error\":\"\(error.localizedDescription)\"}\n", stdout)
    fflush(stdout)
    exit(1)
  }
}

// Read stdin commands
let stdinQueue = DispatchQueue(label: "stdin")
stdinQueue.async {
  while let line = readLine() {
    let cmd = line.trimmingCharacters(in: .whitespacesAndNewlines)
    log(.info, "main", "stdin command: \(cmd)")
    switch cmd {
    case "pause":
      DispatchQueue.main.async { session.pause() }
      fputs("{\"status\":\"paused\"}\n", stdout)
      fflush(stdout)
    case "resume":
      DispatchQueue.main.async { session.resume() }
      fputs("{\"status\":\"resumed\"}\n", stdout)
      fflush(stdout)
    case "stop":
      DispatchQueue.main.async {
        session.stop { path, audioPath, duration in
          let w = session.streamInfo?.width ?? 0
          let h = session.streamInfo?.height ?? 0
          let audioField = audioPath.map { ",\"systemAudioPath\":\"\($0)\"" } ?? ""
          log(.info, "main", "exiting cleanly")
          fputs("{\"status\":\"stopped\",\"path\":\"\(path)\",\"duration\":\(duration),\"width\":\(w),\"height\":\(h)\(audioField)}\n", stdout)
          fflush(stdout)
          _exit(0)
        }
      }
    default:
      log(.warn, "main", "unknown command: \(cmd)")
    }
  }
}

RunLoop.main.run()
