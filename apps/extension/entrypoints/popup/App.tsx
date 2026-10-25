import { useEffect, useRef, useState, type Key } from "react";
import { Button, Tabs, Tooltip } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import {
  getAuthSession,
  getSignedOutReason,
  watchAuthSession,
  type AuthSession,
  type SignedOutReason,
} from "@/lib/auth/session";
import { probeAuthSession } from "@/lib/auth/sync";
import { LIVE_KINDS } from "@/lib/capture/status";
import { WEB_BASE } from "@/lib/config";
import {
  getCameraBlocked,
  getCapturePrefs,
  getRecordingStatus,
  watchRecordingStatus,
  type RecordingStatus,
} from "@/lib/storage";
import { closeSurface, isOverlaySurface } from "@/lib/surface";
import { RecorderPanel } from "./RecorderPanel";
import { ScreenshotPanel } from "./ScreenshotPanel";
import { EffectsPanel } from "./EffectsPanel";
import { FooterActions } from "./FooterActions";
import { SignInGate } from "./SignInGate";

// "loading" until storage resolves, to avoid flashing the sign-in gate.
type AuthState = AuthSession | null | "loading";

// Why the token was dropped for the user rather than by them. Silence here
// would read as the extension logging itself out at random.
const SIGNED_OUT_NOTE: Record<SignedOutReason, string> = {
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

/* The pill comes from Tabs.Indicator inside each tab; only the icon colour is
   ours. isolate: the indicator sits at z-index -1, so without a stacking
   context of its own it sinks behind the popup's background. */
const TAB_CLASS = "isolate h-10 px-[21px] data-[selected=true]:text-accent";

const HOME_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
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
  const [reason, setReason] = useState<SignedOutReason | null>(null);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const mode = useRef<Key>("video");

  useEffect(() => {
    void getAuthSession().then(setAuth);
    void getSignedOutReason().then(setReason);
    void getRecordingStatus().then(setStatus);
    // A drop can land while the panel is open — from the service worker acting
    // on a dashboard tab, or from the probe below — so the reason is re-read
    // rather than captured once.
    const unwatchAuth = watchAuthSession((next) => {
      setAuth(next);
      if (!next) void getSignedOutReason().then(setReason);
    });
    const unwatchStatus = watchRecordingStatus(setStatus);
    return () => {
      unwatchAuth();
      unwatchStatus();
    };
  }, []);

  // Probe the token once per open; a revocation is the one desync no web page
  // would have pushed. Skipped mid-recording: dropping the token there would
  // strand the upload.
  useEffect(() => {
    void (async () => {
      const status = await getRecordingStatus();
      if (LIVE_KINDS.has(status.kind)) return;
      await probeAuthSession();
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
  if (!auth) {
    return <SignInGate note={reason ? SIGNED_OUT_NOTE[reason] : null} />;
  }

  const openHome = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };

  // The popup closes as soon as the OS picker takes focus, so recording state
  // is read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startRecording", undefined);
  const onStop = () => sendMessage("stopRecording", undefined);

  /*
   * The bar preview and the bubble belong to recording, and they sit in the
   * page rather than in this panel — left up, they would be in shot of the
   * screenshot about to be taken. The worker tears them down and puts them
   * back; the camera pref is what remembers the switch was on.
   */
  const onModeChange = (key: Key) => {
    // Also swallows the callback some versions fire for the default key, which
    // would remount the bubble the panel's own restore is already staging.
    if (key === mode.current) return;
    mode.current = key;
    void (async () => {
      const status = await getRecordingStatus();
      if (LIVE_KINDS.has(status.kind)) return;
      void sendMessage("panelMode", key === "video" ? "video" : "screenshot");
    })();
  };

  if (effectsOpen) {
    return <EffectsPanel onBack={() => setEffectsOpen(false)} />;
  }

  return (
    <Tabs
      defaultSelectedKey="video"
      onSelectionChange={onModeChange}
      aria-label="Capture mode"
      className="flex w-full min-w-0 flex-col gap-5 px-[19px] pt-4 pb-5"
    >
      <header className="flex items-center justify-between gap-2">
        <IconAction label="Open dashboard" onPress={openHome}>
          {HOME_ICON}
        </IconAction>
        {/* ListContainer paints the track; the indicator is React Aria's
            SelectionIndicator, which only exists if the tab renders one —
            without both, the tabs are bare icons with no selected state.
            HeroUI's .tabs__list[data-orientation] is min-width:100%, which in
            this justify-between header claims the full header width and then
            the two icon buttons push the document past the body width — the
            popup ends up scrolled with the left edge cut off. The bang is
            load-bearing: that selector outranks a plain utility. */}
        <Tabs.ListContainer className="w-max rounded-[14px] border border-separator bg-overlay p-1">
          <Tabs.List className="w-max min-w-0! gap-0 p-0">
            <Tabs.Tab
              id="video"
              aria-label="Record video"
              className={TAB_CLASS}
            >
              <Tabs.Indicator className="rounded-[10px] bg-background" />
              {VIDEO_ICON}
            </Tabs.Tab>
            <Tabs.Tab
              id="screenshot"
              aria-label="Capture screenshot"
              className={TAB_CLASS}
            >
              <Tabs.Indicator className="rounded-[10px] bg-background" />
              {PHOTO_ICON}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <IconAction label="Close" onPress={() => closeSurface()}>
          {CLOSE_ICON}
        </IconAction>
      </header>

      {/* HeroUI pads the panel and pushes it off the list; the stack's own
          gap and the card's padding already do both. */}
      <Tabs.Panel id="video" className="mt-0 min-w-0 p-0">
        <RecorderPanel status={status} onStart={onStart} onStop={onStop} />
      </Tabs.Panel>
      <Tabs.Panel id="screenshot" className="mt-0 min-w-0 p-0">
        <ScreenshotPanel />
      </Tabs.Panel>

      <FooterActions onEffects={() => setEffectsOpen(true)} />
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
