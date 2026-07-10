import {
  createScreenRecorder,
  type StartResult,
  type StopResult,
} from "@captureflow/engine/main";
import { engineBinaryPath } from "./lib/engine-paths";
import { logInfo, logWarn, logError, logRaw } from "./lib/logger";
import type { RecordingFrameEvent, WindowBounds } from "../shared/types";

export type { StopResult };

const recorder = createScreenRecorder({
  binaryPath: () => engineBinaryPath("screen-recorder"),
  logger: { info: logInfo, warn: logWarn, error: logError, raw: logRaw },
});

type RecorderConfig = {
  displayId?: number;
  windowId?: number;
  fps?: number;
  showsCursor?: boolean;
  captureAudio?: boolean;
  excludePid?: number;
  cropRect?: WindowBounds;
};

export function setOnUnexpectedExit(cb: (() => void) | null): void {
  recorder.setOnUnexpectedExit(cb);
}

export function setOnRecordingEvent(
  cb: ((event: RecordingFrameEvent) => void) | null,
): void {
  recorder.setOnRecordingEvent(cb);
}

export function startNativeRecording(
  config: RecorderConfig,
): Promise<StartResult> {
  // Always streaming at the contract defaults; the app has no disk mode.
  return recorder.start({ ...config, outputDir: "", streaming: {} });
}

export function stopNativeRecording(): Promise<StopResult> {
  return recorder.stop();
}

export function pauseNativeRecording(): void {
  recorder.pause();
}

export function resumeNativeRecording(): void {
  recorder.resume();
}

export function isNativeRecordingActive(): boolean {
  return recorder.isActive();
}
