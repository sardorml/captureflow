import { useEffect, useState } from "react";
import { Button, Tabs, Tooltip } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import {
  getAuthSession,
  watchAuthSession,
  type AuthSession,
} from "@/lib/auth/session";
import { reconcileAuthSession, type AuthSyncVerdict } from "@/lib/auth/sync";
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

const LIVE_KINDS = new Set(["preparing", "recording", "paused", "uploading"]);

// Why the panel dropped back to the gate. Silence here would read as the
// extension logging itself out at random.
const SYNC_NOTE: Partial<Record<AuthSyncVerdict, string>> = {
  revoked: "Your sign-in expired. Sign in again to keep recording.",
  "signed-out":
    "You're signed out of CaptureFlow in this browser, so the extension signed out too.",
  "other-user":
    "This browser is signed in to a different CaptureFlow account. Sign in again to match it.",
};

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

/* HeroUI already paints the selected pill via .tabs__indicator; only the icon
   colour is ours. No background on the list itself — the indicator sits at
   z-index -1 and a parent background would bury it. */
const TAB_CLASS = "px-4 data-[selected=true]:text-accent";

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
  const [syncNote, setSyncNote] = useState<string | null>(null);

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

  /*
   * Reconcile with the browser's own dashboard session once per open. The
   * device token outlives the cookie and doesn't follow account switches, so
   * without this the panel keeps recording as an account the browser can't open
   * the resulting links with. Skipped mid-recording: dropping the token there
   * would strand the upload.
   */
  useEffect(() => {
    void (async () => {
      const status = await getRecordingStatus();
      if (LIVE_KINDS.has(status.kind)) return;
      setSyncNote(SYNC_NOTE[await reconcileAuthSession()] ?? null);
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
  if (!auth) return <SignInGate note={syncNote} />;

  const openHome = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };

  // The popup closes as soon as the OS picker takes focus, so recording state
  // is read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startRecording", undefined);
  const onStop = () => sendMessage("stopRecording", undefined);

  return (
    <Tabs
      defaultSelectedKey="video"
      aria-label="Capture mode"
      className="flex w-full min-w-0 flex-col gap-3 p-3.5"
    >
      <header className="flex items-center justify-between gap-2">
        <IconAction label="Open dashboard" onPress={openHome}>
          {HOME_ICON}
        </IconAction>
        {/* HeroUI's .tabs__list[data-orientation] is min-width:100%, which in
            this justify-between header claims the full header width and then
            the two icon buttons push the document past the 340px body — the
            popup ends up scrolled with the left edge cut off. The bang is
            load-bearing: that selector outranks a plain utility. */}
        <Tabs.List className="w-max min-w-0!">
          <Tabs.Tab id="video" aria-label="Record video" className={TAB_CLASS}>
            {VIDEO_ICON}
          </Tabs.Tab>
          <Tabs.Tab
            id="screenshot"
            aria-label="Capture screenshot"
            className={TAB_CLASS}
          >
            {PHOTO_ICON}
          </Tabs.Tab>
        </Tabs.List>
        <IconAction label="Close" onPress={() => closeSurface()}>
          {CLOSE_ICON}
        </IconAction>
      </header>

      <Tabs.Panel id="video" className="min-w-0">
        <RecorderPanel
          status={status}
          result={result}
          onStart={onStart}
          onStop={onStop}
        />
      </Tabs.Panel>
      <Tabs.Panel id="screenshot" className="min-w-0">
        <ScreenshotPanel />
      </Tabs.Panel>

      <FooterActions />
    </Tabs>
  );
}

function IconAction({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button variant="ghost" isIconOnly aria-label={label} onPress={onPress}>
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}
