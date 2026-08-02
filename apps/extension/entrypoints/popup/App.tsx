import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getAuthSession,
  setAuthSession,
  watchAuthSession,
  type AuthSession,
} from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import { checkAuth } from "@/lib/api/client";
import { WEB_BASE } from "@/lib/config";
import {
  getCameraBlocked,
  getRecordingResult,
  getRecordingStatus,
  watchRecordingResult,
  watchRecordingStatus,
  type RecordingResult,
  type RecordingStatus,
} from "@/lib/storage";
import { closeSurface, isOverlaySurface } from "@/lib/surface";
import { RecorderPanel } from "./RecorderPanel";
import { ScreenshotPanel } from "./ScreenshotPanel";
import { FooterActions } from "./FooterActions";
import { SignInGate } from "./SignInGate";

// "loading" until storage resolves, to avoid flashing the sign-in gate.
type AuthState = AuthSession | null | "loading";

type Mode = "video" | "screenshot";

const LIVE_KINDS = new Set(["preparing", "recording", "paused", "uploading"]);

async function hasMediaGrant(): Promise<boolean> {
  try {
    const [cam, mic] = await Promise.all([
      navigator.permissions.query({ name: "camera" as PermissionName }),
      navigator.permissions.query({ name: "microphone" as PermissionName }),
    ]);
    return cam.state === "granted" && mic.state === "granted";
  } catch {
    return false;
  }
}

const HOME_ICON = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const VIDEO_ICON = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    <rect
      x="3"
      y="6.5"
      width="12.5"
      height="11"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 10.5 4.2-2.4v7.8L16 13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const PHOTO_ICON = (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    <path
      d="M8.5 6.5 10 4.5h4l1.5 2H19a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V8A1.5 1.5 0 0 1 5 6.5h3.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12.7"
      r="3.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export function App() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [status, setStatus] = useState<RecordingStatus>({ kind: "idle" });
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [mode, setMode] = useState<Mode>("video");

  useEffect(() => {
    void getAuthSession().then(setAuth);
    void getRecordingStatus().then(setStatus);
    void getRecordingResult().then(setResult);
    const unwatchAuth = watchAuthSession(setAuth);
    const unwatchStatus = watchRecordingStatus(setStatus);
    const unwatchResult = watchRecordingResult(setResult);
    return () => {
      unwatchAuth();
      unwatchStatus();
      unwatchResult();
    };
  }, []);

  // Probe the token once per popup open; a revoked token flips the UI (and the
  // action gating) back to signed-out instead of failing at record time.
  useEffect(() => {
    void (async () => {
      const session = await getAuthSession();
      if (!session) return;
      const deviceId = await getDeviceId();
      if ((await checkAuth(deviceId, session.token)) === "invalid") {
        await setAuthSession(null);
      }
    })();
  }, []);

  /*
   * Missing camera/mic grant → one combined native prompt on the page (the SW
   * injects an invisible extension frame), instead of separate prompts behind
   * each toggle. Skipped while recording and after an explicit Block.
   */
  useEffect(() => {
    void (async () => {
      const session = await getAuthSession();
      if (!session) return;
      const status = await getRecordingStatus();
      if (LIVE_KINDS.has(status.kind)) return;
      if (await getCameraBlocked()) return;
      if (await hasMediaGrant()) return;
      void sendMessage("ensureMediaGrant", undefined);
    })();
  }, []);

  // Overlay-only: Escape closes, like clicking the blurred backdrop.
  useEffect(() => {
    if (!isOverlaySurface) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSurface();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (auth === "loading") return null;
  if (!auth) return <SignInGate />;

  const openHome = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };

  // The popup closes as soon as the OS picker takes focus, so recording state
  // is read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startRecording", undefined);
  const onStop = () => sendMessage("stopRecording", undefined);

  return (
    <div className="cf-panel">
      <header className="cf-topbar">
        <button
          type="button"
          className="cf-iconbtn"
          title="Open dashboard"
          onClick={openHome}
        >
          {HOME_ICON}
        </button>
        <div className="cf-tabs" role="tablist" aria-label="Capture mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "video"}
            className={mode === "video" ? "cf-tab is-active" : "cf-tab"}
            title="Record video"
            onClick={() => setMode("video")}
          >
            {VIDEO_ICON}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "screenshot"}
            className={mode === "screenshot" ? "cf-tab is-active" : "cf-tab"}
            title="Capture screenshot"
            onClick={() => setMode("screenshot")}
          >
            {PHOTO_ICON}
          </button>
        </div>
        <button
          type="button"
          className="cf-iconbtn"
          title="Close"
          onClick={() => closeSurface()}
        >
          {CLOSE_ICON}
        </button>
      </header>

      {mode === "video" ? (
        <RecorderPanel
          status={status}
          result={result}
          onStart={onStart}
          onStop={onStop}
        />
      ) : (
        <ScreenshotPanel />
      )}

      <FooterActions />
    </div>
  );
}
