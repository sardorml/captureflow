import { defineExtensionMessaging } from "@webext-core/messaging";
import type { RecordingResultPayload, RecordingStatus } from "./storage";

export type SignInResult = { ok: true } | { ok: false; error: string };
export type StartResult = { ok: true } | { ok: false; error: string };

export type CaptureContext = { deviceId: string; token: string };

/*
 * Typed cross-context messages. Direction by message: popup→SW for sign-in and
 * recording control (startSignIn runs in the SW because the auth window unloads
 * the popup); SW→offscreen for capture control (beginCapture/stopCapture);
 * offscreen→SW for recordingStatus/recordingResult.
 */
type ProtocolMap = {
  startSignIn(): SignInResult;
  signOut(): void;
  startRecording(): StartResult;
  stopRecording(): void;
  beginCapture(ctx: CaptureContext): void;
  stopCapture(): void;
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
