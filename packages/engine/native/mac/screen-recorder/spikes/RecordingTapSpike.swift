// RecordingTapSpike.swift
// ──────────────────────
// Spike harness for the link-sharing pipeline. Counts frames + samples
// PTS as they pass through the recording-tap fan-out closure on the primary
// SCStreamOutput. Originally tried as a parallel SCStreamOutput; that
// approach broke the primary handler entirely (see docs/spikes/recording-tap.md
// for the failure log) so the architecture pivoted to in-handler fan-out.
//
// The spike answers the same questions in the new shape:
//
//   1. Does invoking an extra closure inside the primary's
//      stream(_:didOutputSampleBuffer:of:) measurably perturb the
//      writer's frame cadence?
//
//   2. What CPU/memory cost does the closure call add?
//
// Off by default. Enable per-recording with CAPTUREFLOW_RECORDING_TAP_SPIKE=1
// in the recorder process's environment.

import CoreMedia
import Foundation

final class RecordingTapSpike {
  private var frameCount: Int = 0
  private var droppedCount: Int = 0
  private var firstPTS: CMTime?
  private var lastPTS: CMTime?
  private var lastLogFrame: Int = 0
  private let statsInterval: Int = 60  // ~1s at 60 fps

  func handle(_ sampleBuffer: CMSampleBuffer) {
    let isValid =
      CMSampleBufferIsValid(sampleBuffer)
      && CMSampleBufferDataIsReady(sampleBuffer)
    if !isValid {
      droppedCount += 1
      return
    }

    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    if firstPTS == nil { firstPTS = pts }
    lastPTS = pts
    frameCount += 1

    if frameCount - lastLogFrame >= statsInterval {
      lastLogFrame = frameCount
      logStats()
    }
  }

  func logStats() {
    guard let first = firstPTS, let last = lastPTS else { return }
    let elapsed = CMTimeGetSeconds(CMTimeSubtract(last, first))
    let fps = elapsed > 0 ? Double(frameCount) / elapsed : 0
    FileHandle.standardError.write(
      Data(
        "[recording-tap-spike] frames=\(frameCount) elapsed=\(String(format: "%.2f", elapsed))s fps=\(String(format: "%.2f", fps)) drops=\(droppedCount)\n"
          .utf8
      )
    )
  }

  func finalReport() {
    FileHandle.standardError.write(Data("[recording-tap-spike] FINAL —\n".utf8))
    logStats()
  }
}
