import { defineExtensionMessaging } from "@webext-core/messaging";
import type { RecordingResultPayload, RecordingStatus } from "./storage";

export type StartResult = { ok: true } | { ok: false; error: string };

export type CaptureContext = {
  deviceId: string;
  token: string;
  camera: boolean;
  mic: boolean;
};

/*
 * Direction by message: popup→SW for sign-in and recording control;
 * SW→offscreen for capture control; offscreen→SW for status/result.
 */
type ProtocolMap = {
  openSignIn(): void;
  signOut(): void;
  setCameraBubble(input: { on: boolean; mic: boolean }): void;
  cameraStatus(input: { blocked: boolean }): void;
  startRecording(): StartResult;
  stopRecording(): void;
  beginCapture(ctx: CaptureContext): void;
  stopCapture(): void;
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
