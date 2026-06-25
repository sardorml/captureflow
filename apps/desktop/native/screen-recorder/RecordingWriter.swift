// RecordingWriter.swift
// ──────────────────
// Parallel H.264 encoder for the Instant Recording pipeline. Sits next
// to FrameWriter (which produces screen.mp4 via AVAssetWriter) and
// emits a downscaled, lower-bitrate H.264 elementary stream on fd 3
// for the Electron renderer to mux + upload.
//
// Why a second encoder instead of branching from FrameWriter's output:
//   1. Different target resolution (1280×720 recording vs full capture
//      size for the local recording).
//   2. Different bitrate budget (4 Mbps recording vs quality-based local
//      encode that can spike to 50+ Mbps for screen content).
//   3. Different output sink (fd 3 length-prefixed records vs
//      AVAssetWriter sample-buffer append).
//
// Sharing the underlying CMSampleBuffer is fine — the tap closure
// (`StreamCapture.onRecordingFrame`) hands the same buffer to the recording
// path that the writer pipeline already received via `onVideoFrame`.
//
// Wire protocol on fd 3 (binary, little-endian):
//   Tag 0x01 (video format desc, sent once after the first encode):
//     u32 width | u32 height | u32 fps | u32 descLen | descLen bytes (avcC)
//   Tag 0x02 (encoded video chunk, one per output frame):
//     u8 flags (bit0 = key) | i64 ptsUs | u32 durationUs |
//     u32 dataLen | dataLen bytes (length-prefixed NALUs)
//   Tag 0x03 (audio format, sent once before the first audio chunk):
//     u32 sampleRate | u32 channelCount | u32 descLen |
//     descLen bytes (AudioSpecificConfig)
//   Tag 0x04 (encoded audio chunk, one per AAC packet):
//     i64 ptsUs | u32 durationUs | u32 dataLen | dataLen bytes (raw AAC)
//   Tag 0xFF (end of stream, 1 byte total).

import AVFoundation
import Foundation
import CoreMedia
import CoreImage
import CoreVideo
import VideoToolbox

final class RecordingWriter {
  // Reinterpreted as MAX bounds. Actual encode dimensions are derived
  // from the first frame's source aspect ratio fit within these — so a
  // 3024×1964 capture (1.54:1) doesn't get pillarboxed into a fixed
  // 1280×720 (1.78:1) canvas. Without this the recording has black bars
  // baked into the encoded frames.
  private let maxWidth: Int
  private let maxHeight: Int
  private let outputFps: Int
  private let outputBitrate: Int
  private let fileHandle: FileHandle

  private var outputWidth: Int = 0
  private var outputHeight: Int = 0

  private var session: VTCompressionSession?
  private var ciContext: CIContext?
  private var scratchPixelBuffer: CVPixelBuffer?
  private var pixelBufferPool: CVPixelBufferPool?

  private var emittedFormatDesc = false
  private var frameCount = 0
  private var firstPts: CMTime?
  private var failed = false

  // Audio path. The SCK audio tap delivers PCM CMSampleBuffers; we
  // encode to AAC LC 48 kHz stereo with AVAudioConverter and emit one
  // record per AAC packet on fd 3 alongside the video records. Mp4-muxer
  // on the renderer side just passes these bytes straight into its
  // audio track — no second decode/re-encode.
  private var audioConverter: AVAudioConverter?
  private var emittedAudioFormat = false
  private var firstAudioPts: CMTime?
  private var audioPacketsEmitted = 0
  // Cumulative AAC packet count expressed in 48 kHz samples. We track
  // packet timing in samples (1024 per AAC LC packet) rather than µs to
  // avoid the accumulated rounding error that a 21333 µs step would
  // produce over a 60 s recording.
  private var audioPacketCursorSamples: Int64 = 0
  // AAC LC at 48 kHz packs exactly 1024 samples / packet (~21.33ms).
  private static let aacFramesPerPacket: Int64 = 1024
  private static let aacOutputSampleRate: Double = 48000
  private static let aacOutputChannels: UInt32 = 2
  private static let aacBitRate: Int32 = 128_000

  // The encode output runs on VT's internal thread; serialise writes
  // to fd 3 + bookkeeping mutations through this queue so the encode
  // callback never races the format-desc emission.
  private let writeQueue = DispatchQueue(label: "captureflow.recording-writer.write")

  init(width: Int, height: Int, fps: Int, bitrate: Int, fd: Int32) {
    self.maxWidth = width
    self.maxHeight = height
    self.outputFps = fps
    self.outputBitrate = bitrate
    self.fileHandle = FileHandle(fileDescriptor: fd, closeOnDealloc: true)
  }

  /// Compute encoder dimensions from the source frame's aspect ratio,
  /// fit within (maxWidth × maxHeight). Forces even values — H.264
  /// requires even width/height.
  private func computeOutputDimensions(inWidth: Int, inHeight: Int) -> (Int, Int) {
    let inAspect = Double(inWidth) / Double(inHeight)
    let maxAspect = Double(maxWidth) / Double(maxHeight)
    var w: Double, h: Double
    if inAspect > maxAspect {
      // Source is wider than max → fit width.
      w = Double(maxWidth)
      h = Double(maxWidth) / inAspect
    } else {
      // Source is taller (or equal) → fit height.
      h = Double(maxHeight)
      w = Double(maxHeight) * inAspect
    }
    // H.264 requires even dimensions; round to nearest even.
    let evenW = Int(w.rounded() / 2) * 2
    let evenH = Int(h.rounded() / 2) * 2
    return (max(evenW, 2), max(evenH, 2))
  }

  func start() throws {
    // Defer encoder + pool creation to first frame — we can't size the
    // VTCompressionSession until we know the source aspect ratio.
    ciContext = CIContext(options: [.useSoftwareRenderer: false])
    log(.info, "recording-writer", "ready, deferring encoder until first frame")
  }

  private func setupEncoder(inWidth: Int, inHeight: Int) throws {
    let (w, h) = computeOutputDimensions(inWidth: inWidth, inHeight: inHeight)
    outputWidth = w
    outputHeight = h

    let attrs: [String: Any] = [
      kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA),
      kCVPixelBufferWidthKey as String: outputWidth,
      kCVPixelBufferHeightKey as String: outputHeight,
      kCVPixelBufferIOSurfacePropertiesKey as String: [:]
    ]
    var pool: CVPixelBufferPool?
    CVPixelBufferPoolCreate(nil, nil, attrs as CFDictionary, &pool)
    pixelBufferPool = pool

    var s: VTCompressionSession?
    let status = VTCompressionSessionCreate(
      allocator: nil,
      width: Int32(outputWidth),
      height: Int32(outputHeight),
      codecType: kCMVideoCodecType_H264,
      encoderSpecification: nil,
      imageBufferAttributes: attrs as CFDictionary,
      compressedDataAllocator: nil,
      outputCallback: nil,
      refcon: nil,
      compressionSessionOut: &s
    )
    guard status == noErr, let session = s else {
      throw NSError(
        domain: "RecordingWriter", code: Int(status),
        userInfo: [NSLocalizedDescriptionKey: "VTCompressionSession create failed: \(status)"]
      )
    }

    // Baseline profile = max browser/decoder compatibility. Same
    // profile choice as the WebCodecs config we proved in spike #2.
    VTSessionSetProperty(
      session, key: kVTCompressionPropertyKey_RealTime, value: kCFBooleanTrue
    )
    VTSessionSetProperty(
      session, key: kVTCompressionPropertyKey_AllowFrameReordering, value: kCFBooleanFalse
    )
    VTSessionSetProperty(
      session,
      key: kVTCompressionPropertyKey_ProfileLevel,
      value: kVTProfileLevel_H264_Baseline_AutoLevel
    )
    VTSessionSetProperty(
      session, key: kVTCompressionPropertyKey_ExpectedFrameRate, value: outputFps as CFNumber
    )
    // 2-second keyframe interval matches the renderer-side RecordingEncoder
    // KEYFRAME_INTERVAL_SECONDS so the muxer's sample table stays sane.
    VTSessionSetProperty(
      session, key: kVTCompressionPropertyKey_MaxKeyFrameInterval,
      value: (outputFps * 2) as CFNumber
    )
    VTSessionSetProperty(
      session, key: kVTCompressionPropertyKey_AverageBitRate,
      value: outputBitrate as CFNumber
    )
    VTCompressionSessionPrepareToEncodeFrames(session)
    self.session = session
    log(
      .info, "recording-writer",
      "VTCompressionSession ready: \(outputWidth)x\(outputHeight)@\(outputFps)fps from source \(inWidth)x\(inHeight), bitrate=\(outputBitrate)"
    )
  }

  /// Push one frame from the recording-tap closure. The pixel buffer is
  /// downscaled into a pooled CVPixelBuffer at the encoder's chosen
  /// output size (computed from the source aspect ratio on first
  /// frame), then handed to VTCompressionSession.
  func pushFrame(_ sampleBuffer: CMSampleBuffer) {
    if failed { return }
    guard let inputBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    let inWidth = CVPixelBufferGetWidth(inputBuffer)
    let inHeight = CVPixelBufferGetHeight(inputBuffer)

    // Lazy encoder init — needs the source aspect ratio to size the
    // VTCompressionSession + pixel pool. Failure here marks the
    // writer as failed; subsequent frames are dropped silently so the
    // primary recorder isn't disturbed.
    if session == nil {
      do {
        try setupEncoder(inWidth: inWidth, inHeight: inHeight)
      } catch {
        markFailure("encoder setup failed: \(error)")
        return
      }
    }
    guard let session else { return }
    guard let pool = pixelBufferPool, let ctx = ciContext else { return }

    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    if firstPts == nil { firstPts = pts }
    let duration = CMTime(value: 1, timescale: CMTimeScale(outputFps))

    // Render the input into a fresh pooled buffer at output size.
    var scaled: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &scaled)
    guard let scaled else { return }

    // Output dims are picked to match source aspect (see setupEncoder),
    // BUT computeOutputDimensions rounds to even pixels — a 3024×1964
    // source (1.539 aspect) lands at 1662×1080 (1.539 aspect ≈ 1.5389).
    // A uniform X-derived scale (1662/3024 = 0.5496) leaves the scaled
    // height at 1964×0.5496 = 1079.4, ~0.6px short of 1080. CoreImage's
    // bottom-left origin means the uncovered sliver lands at the TOP of
    // the canvas — paints as a 1-px black band on the encoded recording.
    // Per-axis scale fills the canvas exactly; the resulting aspect
    // distortion is on the order of the even-pixel rounding itself
    // (≤0.05%), below perceptual threshold.
    let scaleX = CGFloat(outputWidth) / CGFloat(inWidth)
    let scaleY = CGFloat(outputHeight) / CGFloat(inHeight)
    let ciImage = CIImage(cvPixelBuffer: inputBuffer)
      .transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

    ctx.render(
      ciImage, to: scaled,
      bounds: CGRect(x: 0, y: 0, width: outputWidth, height: outputHeight),
      colorSpace: CGColorSpaceCreateDeviceRGB()
    )

    // Force a key frame on every Nth input frame, in addition to the
    // VT-managed periodic keyframes. Belt + suspenders for the player.
    let forceKey = frameCount % (outputFps * 2) == 0
    let frameProps: [String: Any] = forceKey
      ? [kVTEncodeFrameOptionKey_ForceKeyFrame as String: true]
      : [:]

    var flagsOut: VTEncodeInfoFlags = []
    let status = VTCompressionSessionEncodeFrame(
      session,
      imageBuffer: scaled,
      presentationTimeStamp: pts,
      duration: duration,
      frameProperties: frameProps as CFDictionary,
      infoFlagsOut: &flagsOut
    ) { [weak self] status, _, sample in
      guard let self else { return }
      if status != noErr {
        self.markFailure("encode callback status=\(status)")
        return
      }
      if let sample {
        self.handleEncodedSample(sample)
      }
    }
    if status != noErr {
      markFailure("VTCompressionSessionEncodeFrame failed: \(status)")
    }
    frameCount += 1
  }

  /// Drain the encoder, flush the fd, close it. Idempotent.
  func finish() {
    guard let session else { return }
    VTCompressionSessionCompleteFrames(session, untilPresentationTimeStamp: .invalid)
    VTCompressionSessionInvalidate(session)
    self.session = nil
    // Flush any pending AAC packets from the audio converter. The
    // converter may hold the trailing few packets internally — calling
    // convert with `nil` input flushes them.
    flushAudioConverter()
    writeQueue.sync {
      // Optional 0xFF end-of-stream tag — helps the reader notice a
      // clean stop vs an abrupt close.
      try? self.fileHandle.write(contentsOf: Data([0xFF]))
      try? self.fileHandle.close()
    }
    log(.info, "recording-writer",
        "finished, totalFrames=\(frameCount), audioPackets=\(audioPacketsEmitted)")
  }

  // ── Audio path ────────────────────────────────────────────
  //
  // Called from the StreamCapture audio queue (one CMSampleBuffer per
  // SCK chunk, typically ~1024 PCM samples at the SCK-chosen rate).
  // The converter lazy-inits on the first sample so we adopt SCK's
  // exact input format (commonly Float32 non-interleaved @ 48 kHz),
  // and we never have to hand-craft an AudioStreamBasicDescription
  // that drifts from what SCK actually delivers.
  //
  // IMPORTANT: PCM extraction is inlined here (rather than factored
  // into a makePCMBuffer helper) because AVAudioPCMBuffer with
  // bufferListNoCopy holds raw pointers into the local audioBufferList
  // and the retained block buffer. Returning the PCM buffer from a
  // helper would free those locals before the converter reads from
  // them — silently producing zero AAC output (no log, no error,
  // just nothing on fd 3). Keeping them in this function's scope for
  // the synchronous `converter.convert(...)` call keeps the memory
  // alive long enough for the encode to complete.
  func pushAudio(_ sampleBuffer: CMSampleBuffer) {
    guard !failed, CMSampleBufferDataIsReady(sampleBuffer) else { return }

    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    if firstAudioPts == nil {
      firstAudioPts = pts
      log(.info, "recording-writer", "pushAudio: first frame, pts=\(pts.seconds)s")
    }

    guard
      let formatDesc = CMSampleBufferGetFormatDescription(sampleBuffer),
      let asbdPtr = CMAudioFormatDescriptionGetStreamBasicDescription(formatDesc)
    else {
      log(.warn, "recording-writer", "pushAudio: no format description / ASBD on sample buffer")
      return
    }
    var asbd = asbdPtr.pointee
    guard let inputFormat = AVAudioFormat(streamDescription: &asbd) else {
      log(.warn, "recording-writer", "pushAudio: AVAudioFormat(streamDescription:) returned nil")
      return
    }

    // Ask CoreMedia how much memory the AudioBufferList needs. SCK
    // delivers Float32 non-interleaved stereo (2 channel buffers), but
    // MemoryLayout<AudioBufferList>.size only fits 1 — passing that as
    // bufferListSize trips kCMSampleBufferError_RequiredParameterMissing
    // (-12737). The two-pass pattern (query needed size, then allocate)
    // works for any channel layout SCK might decide to emit.
    var sizeNeeded = 0
    let sizeStatus = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
      sampleBuffer,
      bufferListSizeNeededOut: &sizeNeeded,
      bufferListOut: nil,
      bufferListSize: 0,
      blockBufferAllocator: nil,
      blockBufferMemoryAllocator: nil,
      flags: 0,
      blockBufferOut: nil
    )
    guard sizeStatus == noErr, sizeNeeded > 0 else {
      log(.warn, "recording-writer",
          "pushAudio: could not size AudioBufferList: status=\(sizeStatus), size=\(sizeNeeded)")
      return
    }

    let ablRawPtr = UnsafeMutableRawPointer.allocate(
      byteCount: sizeNeeded,
      alignment: MemoryLayout<AudioBufferList>.alignment
    )
    defer { ablRawPtr.deallocate() }
    let ablPtr = ablRawPtr.bindMemory(to: AudioBufferList.self, capacity: 1)

    var blockBuffer: CMBlockBuffer?
    let status = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
      sampleBuffer,
      bufferListSizeNeededOut: nil,
      bufferListOut: ablPtr,
      bufferListSize: sizeNeeded,
      blockBufferAllocator: nil,
      blockBufferMemoryAllocator: nil,
      flags: 0,
      blockBufferOut: &blockBuffer
    )
    guard status == noErr else {
      log(.warn, "recording-writer",
          "pushAudio: CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer failed: \(status)")
      return
    }
    guard let pcm = AVAudioPCMBuffer(pcmFormat: inputFormat, bufferListNoCopy: ablPtr)
    else {
      log(.warn, "recording-writer",
          "pushAudio: AVAudioPCMBuffer(bufferListNoCopy:) returned nil for format \(inputFormat)")
      return
    }

    if audioConverter == nil {
      guard setupAudioConverter(inputFormat: pcm.format) else { return }
    }
    guard let converter = audioConverter else { return }

    // AAC LC packs 1024 frames per packet. Up to 8 input packets'
    // worth of samples per SCK delivery is plenty (~21 ms per AAC
    // packet × 8 = 170 ms of headroom).
    let outputCapacity: AVAudioPacketCount = 8
    let outputBuffer = AVAudioCompressedBuffer(
      format: converter.outputFormat,
      packetCapacity: outputCapacity,
      maximumPacketSize: converter.maximumOutputPacketSize
    )

    var providedInput = false
    let inputBlock: AVAudioConverterInputBlock = { _, outStatus in
      if providedInput {
        outStatus.pointee = .noDataNow
        return nil
      }
      providedInput = true
      outStatus.pointee = .haveData
      return pcm
    }

    var error: NSError?
    let convertStatus = converter.convert(
      to: outputBuffer, error: &error, withInputFrom: inputBlock
    )
    if convertStatus == .error {
      markFailure("audio convert failed: \(error?.localizedDescription ?? "unknown")")
      _ = blockBuffer
      return
    }
    // Keep blockBuffer alive through the synchronous convert — pcm
    // references its bytes via bufferListNoCopy. The ablPtr allocation
    // is kept alive by `defer` on the function scope.
    _ = blockBuffer

    emitAACPackets(outputBuffer)
  }

  private func flushAudioConverter() {
    guard let converter = audioConverter else { return }
    let outputBuffer = AVAudioCompressedBuffer(
      format: converter.outputFormat,
      packetCapacity: 8,
      maximumPacketSize: converter.maximumOutputPacketSize
    )
    let inputBlock: AVAudioConverterInputBlock = { _, outStatus in
      // No more input — drain whatever the encoder has left.
      outStatus.pointee = .endOfStream
      return nil
    }
    var error: NSError?
    _ = converter.convert(to: outputBuffer, error: &error, withInputFrom: inputBlock)
    if outputBuffer.packetCount > 0 {
      emitAACPackets(outputBuffer)
    }
  }

  private func setupAudioConverter(inputFormat: AVAudioFormat) -> Bool {
    var aacDesc = AudioStreamBasicDescription(
      mSampleRate: RecordingWriter.aacOutputSampleRate,
      mFormatID: kAudioFormatMPEG4AAC,
      mFormatFlags: 0,
      mBytesPerPacket: 0,
      mFramesPerPacket: UInt32(RecordingWriter.aacFramesPerPacket),
      mBytesPerFrame: 0,
      mChannelsPerFrame: RecordingWriter.aacOutputChannels,
      mBitsPerChannel: 0,
      mReserved: 0
    )
    guard let outputFormat = AVAudioFormat(streamDescription: &aacDesc) else {
      markFailure("could not create AAC output format")
      return false
    }
    guard let converter = AVAudioConverter(from: inputFormat, to: outputFormat) else {
      markFailure("could not create audio converter (in=\(inputFormat))")
      return false
    }
    converter.bitRate = Int(RecordingWriter.aacBitRate)
    self.audioConverter = converter
    log(.info, "recording-writer",
        "audio converter ready: input=\(inputFormat) → AAC LC 48kHz stereo @ 128kbps")
    return true
  }

  private func emitAACPackets(_ buffer: AVAudioCompressedBuffer) {
    let count = Int(buffer.packetCount)
    guard count > 0 else { return }
    guard let descs = buffer.packetDescriptions else { return }
    let baseAddr = buffer.data
    var packetPayloads: [(Data, Int64, UInt32)] = []
    packetPayloads.reserveCapacity(count)
    for i in 0..<count {
      let pd = descs[i]
      let dataOffset = Int(pd.mStartOffset)
      let dataLen = Int(pd.mDataByteSize)
      let data = Data(bytes: baseAddr.advanced(by: dataOffset), count: dataLen)
      let ptsUs = Int64(
        Double(audioPacketCursorSamples) * 1_000_000 / RecordingWriter.aacOutputSampleRate
      )
      audioPacketCursorSamples += RecordingWriter.aacFramesPerPacket
      let nextPtsUs = Int64(
        Double(audioPacketCursorSamples) * 1_000_000 / RecordingWriter.aacOutputSampleRate
      )
      let durationUs = UInt32(max(0, nextPtsUs - ptsUs))
      packetPayloads.append((data, ptsUs, durationUs))
    }
    writeQueue.async {
      if !self.emittedAudioFormat {
        self.emitAudioFormat()
        self.emittedAudioFormat = true
      }
      for (payload, ptsUs, durationUs) in packetPayloads {
        self.emitAudioChunk(payload: payload, ptsUs: ptsUs, durationUs: durationUs)
      }
    }
  }

  private func emitAudioFormat() {
    // Tag 0x03 audio-format. We hardcode the AudioSpecificConfig for
    // AAC LC, sampling-frequency-index = 3 (48 kHz), channel-config = 2
    // (stereo) → 5+4+4 = 13 bits → 0x11 0x90 (right-padded). Matches
    // the converter's output format set up in setupAudioConverter().
    let asc: [UInt8] = [0x11, 0x90]
    var packet = Data()
    packet.append(0x03)
    packet.appendU32(UInt32(RecordingWriter.aacOutputSampleRate))
    packet.appendU32(RecordingWriter.aacOutputChannels)
    packet.appendU32(UInt32(asc.count))
    packet.append(contentsOf: asc)
    do {
      try fileHandle.write(contentsOf: packet)
    } catch {
      markFailure("fd 3 write (audio-format) failed: \(error)")
    }
  }

  private func emitAudioChunk(payload: Data, ptsUs: Int64, durationUs: UInt32) {
    var packet = Data()
    packet.append(0x04)
    packet.appendI64(ptsUs)
    packet.appendU32(durationUs)
    packet.appendU32(UInt32(payload.count))
    packet.append(payload)
    do {
      try fileHandle.write(contentsOf: packet)
      audioPacketsEmitted += 1
    } catch {
      markFailure("fd 3 write (audio-chunk) failed: \(error)")
    }
  }

  // ── Encode callback handling ──────────────────────────────

  private func handleEncodedSample(_ sample: CMSampleBuffer) {
    guard CMSampleBufferDataIsReady(sample) else { return }
    guard let block = CMSampleBufferGetDataBuffer(sample) else { return }

    // Extract the (already length-prefixed) AVC NAL units. VT outputs
    // sample buffers where the CMBlockBuffer holds NALUs in the AVC
    // format expected by mp4-muxer — no Annex-B conversion needed.
    var totalLen: Int = 0
    var dataPointer: UnsafeMutablePointer<Int8>?
    let status = CMBlockBufferGetDataPointer(
      block, atOffset: 0, lengthAtOffsetOut: nil,
      totalLengthOut: &totalLen, dataPointerOut: &dataPointer
    )
    guard status == noErr, let dataPointer, totalLen > 0 else { return }
    let payload = Data(bytes: dataPointer, count: totalLen)

    let isKey = !sampleHasDependsOnOthers(sample)
    let pts = CMSampleBufferGetPresentationTimeStamp(sample)
    let durationCm = CMSampleBufferGetDuration(sample)

    writeQueue.async {
      if !self.emittedFormatDesc {
        if let desc = CMSampleBufferGetFormatDescription(sample) {
          self.emitFormatDescription(desc)
          self.emittedFormatDesc = true
        }
      }
      self.emitChunk(payload: payload, isKey: isKey, pts: pts, duration: durationCm)
    }
  }

  private func emitFormatDescription(_ desc: CMFormatDescription) {
    // Build the avcC box from SPS/PPS NAL units in the format desc.
    // VT gives us the NALUs as parameter-set arrays; we hand-build the
    // 3GPP/MPEG-4 avcC structure (ISO/IEC 14496-15 §5.2.4.1.1).
    guard let avcc = buildAvcCBox(from: desc) else {
      log(.warn, "recording-writer", "could not build avcC box from format desc")
      return
    }
    var packet = Data()
    packet.append(0x01)
    packet.appendU32(UInt32(outputWidth))
    packet.appendU32(UInt32(outputHeight))
    packet.appendU32(UInt32(outputFps))
    packet.appendU32(UInt32(avcc.count))
    packet.append(avcc)
    do {
      try fileHandle.write(contentsOf: packet)
    } catch {
      markFailure("fd 3 write (format) failed: \(error)")
    }
  }

  private func emitChunk(payload: Data, isKey: Bool, pts: CMTime, duration: CMTime) {
    let ptsUs = Int64((pts.seconds - (firstPts?.seconds ?? 0)) * 1_000_000)
    let durationUs = UInt32(max(0, duration.seconds * 1_000_000))
    var packet = Data()
    packet.append(0x02)
    packet.append(isKey ? 0x01 : 0x00)
    packet.appendI64(ptsUs)
    packet.appendU32(durationUs == 0 ? UInt32(1_000_000 / outputFps) : durationUs)
    packet.appendU32(UInt32(payload.count))
    packet.append(payload)
    do {
      try fileHandle.write(contentsOf: packet)
    } catch {
      markFailure("fd 3 write (chunk) failed: \(error)")
    }
  }

  private func markFailure(_ reason: String) {
    if failed { return }
    failed = true
    log(.error, "recording-writer", reason)
  }
}

// ── Helpers ─────────────────────────────────────────────────

private func sampleHasDependsOnOthers(_ sample: CMSampleBuffer) -> Bool {
  guard
    let attachments = CMSampleBufferGetSampleAttachmentsArray(sample, createIfNecessary: false)
      as? [[CFString: Any]],
    let first = attachments.first
  else {
    return true
  }
  return first[kCMSampleAttachmentKey_DependsOnOthers] as? Bool ?? true
}

private func buildAvcCBox(from desc: CMFormatDescription) -> Data? {
  // CMVideoFormatDescriptionGetH264ParameterSetAtIndex returns each
  // SPS/PPS as a raw NAL unit (no start code). avcC layout:
  //   1B  configurationVersion = 1
  //   1B  AVCProfileIndication (SPS[1])
  //   1B  profile_compatibility (SPS[2])
  //   1B  AVCLevelIndication    (SPS[3])
  //   1B  0xFC | (lengthSizeMinusOne)   — we use 4-byte lengths → 0xFF
  //   1B  0xE0 | numOfSequenceParameterSets
  //   loop SPS:  2B length, N bytes
  //   1B  numOfPictureParameterSets
  //   loop PPS:  2B length, N bytes

  var spsList: [Data] = []
  var ppsList: [Data] = []
  var paramSetCount: Int = 0
  var nalLength: Int32 = 0
  if CMVideoFormatDescriptionGetH264ParameterSetAtIndex(
    desc, parameterSetIndex: 0,
    parameterSetPointerOut: nil, parameterSetSizeOut: nil,
    parameterSetCountOut: &paramSetCount, nalUnitHeaderLengthOut: &nalLength
  ) != noErr {
    return nil
  }
  for i in 0..<paramSetCount {
    var ptr: UnsafePointer<UInt8>?
    var size: Int = 0
    if CMVideoFormatDescriptionGetH264ParameterSetAtIndex(
      desc, parameterSetIndex: i,
      parameterSetPointerOut: &ptr, parameterSetSizeOut: &size,
      parameterSetCountOut: nil, nalUnitHeaderLengthOut: nil
    ) == noErr, let ptr {
      let nal = Data(bytes: ptr, count: size)
      // SPS NAL unit type = 7, PPS = 8 (low 5 bits of byte 0).
      let nalType = nal[0] & 0x1F
      if nalType == 7 { spsList.append(nal) }
      else if nalType == 8 { ppsList.append(nal) }
    }
  }
  guard let firstSps = spsList.first, firstSps.count >= 4 else { return nil }

  var avcc = Data()
  avcc.append(0x01)               // version
  avcc.append(firstSps[1])        // profile
  avcc.append(firstSps[2])        // compat
  avcc.append(firstSps[3])        // level
  avcc.append(0xFF)               // 6 bits set + length-1 = 3 (4-byte lengths)
  avcc.append(0xE0 | UInt8(spsList.count & 0x1F))
  for sps in spsList {
    avcc.appendU16BE(UInt16(sps.count))
    avcc.append(sps)
  }
  avcc.append(UInt8(ppsList.count & 0xFF))
  for pps in ppsList {
    avcc.appendU16BE(UInt16(pps.count))
    avcc.append(pps)
  }
  return avcc
}

private extension Data {
  mutating func appendU16BE(_ v: UInt16) {
    append(UInt8((v >> 8) & 0xFF))
    append(UInt8(v & 0xFF))
  }
  mutating func appendU32(_ v: UInt32) {
    var le = v.littleEndian
    Swift.withUnsafeBytes(of: &le) { append(contentsOf: $0) }
  }
  mutating func appendI64(_ v: Int64) {
    var le = v.littleEndian
    Swift.withUnsafeBytes(of: &le) { append(contentsOf: $0) }
  }
}
