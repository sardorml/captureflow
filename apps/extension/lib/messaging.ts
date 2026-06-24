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
 * Typed cross-context messages. Direction by message: popup→SW for sign-in
 * (openSignIn opens the web login tab) and recording control; SW→offscreen for
 * capture control (beginCapture/stopCapture); offscreen→SW for
 * recordingStatus/recordingResult.
 */
type ProtocolMap = {
  openSignIn(): void;
  signOut(): void;
  setCameraBubble(input: { on: boolean; mic: boolean }): void;
  startRecording(): StartResult;
  stopRecording(): void;
  beginCapture(ctx: CaptureContext): void;
  stopCapture(): void;
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
