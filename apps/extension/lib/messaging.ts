import { defineExtensionMessaging } from "@webext-core/messaging";
import type { RecordingVisibility } from "./api/types";
import type { WebSession } from "./auth/sync";
import type { PageArea } from "./overlay/area-select";
import type {
  ActiveUpload,
  CaptureSource,
  PendingUpload,
  RecordingResultPayload,
  RecordingStatus,
} from "./storage";
import type { RecordingQualityId } from "@captureflow/engine";
import type { CameraEffect } from "./capture/camera-effects";
import type { RecordingLimits } from "./capture/quality-limits";

export type StartResult = { ok: true } | { ok: false; error: string };

export type CountdownResult = "go" | "cancel";

export const COUNTDOWN_SECONDS = 3;

export type CaptureContext = {
  deviceId: string;
  token: string;
  camera: boolean;
  mic: boolean;
  cameraId?: string;
  micId?: string;
  // Offscreen docs can't read storage, so the chosen surface and the
  // recording's visibility ride the message.
  source?: CaptureSource;
  visibility?: RecordingVisibility;
  effect?: CameraEffect;
  quality?: RecordingQualityId;
  // The workspace's length cap as last read; the init response's wins.
  maxDurationMs?: number;
  /*
   * Set only for the tab source: a chrome.tabCapture stream id the offscreen
   * doc turns into a stream directly, skipping the getDisplayMedia picker.
   */
  tabStreamId?: string;
};

/*
 * Direction by message: popup/control-bar→SW for sign-in and recording
 * control; SW→offscreen for capture control; offscreen→SW for status/result.
 */
type ProtocolMap = {
  openSignIn(): void;
  signOut(): void;
  hasAuthSession(): boolean;
  // popup→SW: the caps of the workspace the next recording lands in; null
  // when signed out or unreachable.
  recordingLimits(): RecordingLimits | null;
  webSession(web: WebSession): void;
  setCameraBubble(input: { on: boolean; mic: boolean }): void;
  cameraStatus(input: { blocked: boolean }): void;
  ensureMediaGrant(): void;
  mediaGrantResult(input: { granted: boolean; denied: boolean }): void;
  closeRecorderOverlay(): void;
  // panel→SW: close this panel and reopen it on a fresh canvas tab.
  openCanvas(): void;
  // SW→page: while the panel is open the control bar shows where it will
  // sit, disabled, so the recording's chrome is in view before it starts.
  panelPreview(on: boolean): void;
  // SW→page: a toolbar click mid-recording points at the bar instead of
  // opening the panel.
  nudgeControlBar(): void;
  // SW→page, on the Start press: float the recording's camera bubble in a
  // Picture-in-Picture window, out of the tab's capture. False means the
  // recording goes without a bubble.
  openRecordingWindow(): boolean;
  // Points the window's bubble at the camera. Sent during the countdown, once
  // the recorder holds the camera, so the page load lands before encoding.
  liveRecordingWindow(): void;
  // SW→page: the window would be in shot, so it goes before capture starts.
  closeRecordingWindow(): void;
  // panel→SW: the page-side backdrop follows the panel's painted theme.
  setOverlayTheme(theme: "light" | "dark"): void;
  setOverlayVisible(input: { visible: boolean }): void;
  // panel→SW: the recording chrome on the page, bar and bubble, belongs to
  // the video tab; the screenshot tab clears it out of shot.
  panelMode(mode: "video" | "screenshot"): void;
  // panel→SW: put the area picker on the page; SW→panel: what was drawn,
  // null when the pick was abandoned.
  selectArea(): void;
  areaSelected(area: PageArea | null): void;
  setOverlayHeight(input: { height: number }): void;
  startRecording(): StartResult;
  stopRecording(): void;
  pauseRecording(): void;
  resumeRecording(): void;
  restartRecording(): void;
  deleteRecording(): void;
  beginCapture(ctx: CaptureContext): void;
  // Offscreen docs can't inject page UI, so the SW renders the pre-roll
  // countdown and reports how it ended. countdownStarted marks the overlay's
  // actual mount, so the offscreen beeps line up with the visual ticks.
  runCountdown(): CountdownResult;
  countdownStarted(): void;
  // Announces finalize with the share URL the moment stop lands, so the SW
  // can open the pending share page instead of waiting out the tail upload.
  finalizeStarted(url: string): void;
  stopCapture(): void;
  pauseCapture(): void;
  resumeCapture(): void;
  restartCapture(): void;
  deleteCapture(): void;
  // offscreen→SW: which surface the picker gave, as the stream's
  // displaySurface setting.
  capturedSurface(surface: string | null): void;
  recordingStatus(status: RecordingStatus): void;
  recordingResult(result: RecordingResultPayload): void;
  // Offscreen docs can't touch chrome.storage, so the crash marker is relayed
  // to the SW.
  activeUploadChanged(upload: ActiveUpload | null): void;
  // offscreen→SW: an upload stalled and its files stay for a later resume.
  uploadPending(upload: PendingUpload): void;
  // SW→offscreen: finish uploads left on this device, one at a time.
  resumeUploads(uploads: PendingUpload[]): void;
  // offscreen→SW: done means it left the pending list, finished or not.
  uploadResumed(result: { slug: string; done: boolean; url?: string }): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
