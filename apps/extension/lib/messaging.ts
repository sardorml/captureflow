import { defineExtensionMessaging } from "@webext-core/messaging";
import type { RecordingResultPayload, RecordingStatus } from "./storage";

export type SignInResult = { ok: true } | { ok: false; error: string };
export type StartResult = { ok: true } | { ok: false; error: string };

// Upload credentials the SW resolves and hands to the offscreen recorder.
export type CaptureContext = { deviceId: string; token: string };

type ProtocolMap = {
  // popup → background. Sign-in runs in the SW (the popup unloads when the
  // auth window steals focus), so the popup awaits the result here.
  startSignIn(): SignInResult;
  signOut(): void;
  // popup → background
  startRecording(): StartResult;
  stopRecording(): void;
  // background → offscreen (offscreen calls getDisplayMedia itself)
  beginCapture(ctx: CaptureContext): void;
  stopCapture(): void;
  // offscreen → background
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
