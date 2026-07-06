import {
  startWebcamRecorder,
  type WebcamRecorder,
} from "@captureflow/engine/web";
import { logRendererInfo, logRendererWarn } from "./recording-log";

export type RecordingWebcamUploaderInputs = {
  webcamStream: MediaStream;
  micStream: MediaStream | null;
};

export type RecordingWebcamUploaderResult = {
  totalBytes: number;
};

export class RecordingWebcamUploader {
  private recorder: WebcamRecorder | null = null;

  start(inputs: RecordingWebcamUploaderInputs): void {
    this.recorder = startWebcamRecorder({
      webcamStream: inputs.webcamStream,
      micStream: inputs.micStream,
      onChunk: (buf) => window.electronAPI.recordingPartWebcam(buf),
      log: { info: logRendererInfo, warn: logRendererWarn },
    });
  }

  async stop(): Promise<RecordingWebcamUploaderResult> {
    const rec = this.recorder;
    if (!rec) return { totalBytes: 0 };
    return rec.stop();
  }

  abort(): void {
    this.recorder?.abort();
    this.recorder = null;
  }
}
