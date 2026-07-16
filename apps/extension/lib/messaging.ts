import { defineExtensionMessaging } from "@webext-core/messaging";
import type {
  ActiveUpload,
  RecordingResultPayload,
  RecordingStatus,
} from "./storage";

export type StartResult = { ok: true } | { ok: false; error: string };

export type CaptureContext = {
  deviceId: string;
  token: string;
  camera: boolean;
  mic: boolean;
  cameraId?: string;
  micId?: string;
};

/*
 * Direction by message: popup/control-bar→SW for sign-in and recording
 * control; SW→offscreen for capture control; offscreen→SW for status/result.
 */
type ProtocolMap = {
  openSignIn(): void;
  signOut(): void;
  setCameraBubble(input: { on: boolean; mic: boolean }): void;
  cameraStatus(input: { blocked: boolean }): void;
  ensureMediaGrant(): void;
  mediaGrantResult(input: { granted: boolean; denied: boolean }): void;
  closeRecorderOverlay(): void;
  setOverlayVisible(input: { visible: boolean }): void;
  setOverlayHeight(input: { height: number }): void;
  startRecording(): StartResult;
  stopRecording(): void;
  pauseRecording(): void;
  resumeRecording(): void;
  restartRecording(): void;
  deleteRecording(): void;
  beginCapture(ctx: CaptureContext): void;
  stopCapture(): void;
  pauseCapture(): void;
  resumeCapture(): void;
  restartCapture(): void;
  deleteCapture(): void;
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
  // Offscreen docs can't touch chrome.storage, so the crash marker is relayed
  // to the SW.
  activeUploadChanged(upload: ActiveUpload | null): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
