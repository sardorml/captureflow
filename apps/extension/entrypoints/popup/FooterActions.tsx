import { useEffect, useState, type ReactNode } from "react";
import { Dropdown } from "@heroui/react";
import {
  DEFAULT_RECORDING_QUALITY,
  RECORDING_QUALITIES,
  hydrateRecordingQuality,
  type RecordingQualityId,
  UNREAD_LIMITS,
  clampQuality,
} from "@captureflow/engine";
import type { RecordingVisibility } from "@/lib/api/types";
import { sendMessage } from "@/lib/messaging";
import { WEB_BASE } from "@/lib/config";
import {
  getCapturePrefs,
  getThemePreference,
  setCapturePrefs,
  setThemePreference,
  watchCapturePrefs,
  watchThemePreference,
  type ThemePreference,
} from "@/lib/storage";
import { closeSurface } from "@/lib/surface";
import { MENU_CHECK, MENU_ITEM, MENU_LIST, MENU_POPOVER } from "./panel";

const GLOBE_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <circle
      cx="12"
      cy="12"
      r="8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const USERS_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <circle
      cx="9"
      cy="8"
      r="3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.5 3.5 0 0 1 0 7M18.5 13.5A6.5 6.5 0 0 1 21.5 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LOCK_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <rect
      x="4.5"
      y="10.5"
      width="15"
      height="10"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <circle cx="5" cy="12" r="1.8" fill="currentColor" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <circle cx="19" cy="12" r="1.8" fill="currentColor" />
  </svg>
);

const PALETTE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-2 0-.6-.3-1-.6-1.4-.3-.4-.4-.8-.4-1.1 0-1 .9-1.5 2-1.5h1.5A4.5 4.5 0 0 0 21 10.5C21 6.4 17 3 12 3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="7.5" cy="11.5" r="1.3" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.3" fill="currentColor" />
    <circle cx="15" cy="7.5" r="1.3" fill="currentColor" />
  </svg>
);

const SUN_ICON = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
    <circle
      cx="12"
      cy="12"
      r="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
    <path
      d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const MONITOR_ICON = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
    <rect
      x="3"
      y="4"
      width="18"
      height="12"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 20h8M12 16v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Same names and order as the dashboard's visibility select.
const VISIBILITY: Record<
  RecordingVisibility,
  { label: string; icon: ReactNode }
> = {
  public: { label: "Public", icon: GLOBE_ICON },
  workspace: { label: "Workspace", icon: USERS_ICON },
  private: { label: "Private", icon: LOCK_ICON },
};
const VISIBILITY_ORDER: RecordingVisibility[] = [
  "public",
  "workspace",
  "private",
];

// Dropdown.Trigger wraps React Aria's unstyled Button, so the icon-over-label
// look is applied by hand.
const ACTION_CLASS =
  "flex cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-1 text-xs text-muted outline-none transition-colors hover:text-foreground motion-reduce:transition-none";

/*
 * Where the next recording lands, chosen before it starts. Saved with the
 * other capture prefs so the service worker sends it with the upload; the
 * server applies it to the new recording, and the owner can still change it
 * on the share page.
 */
function VisibilityAction() {
  const [visibility, setVisibility] = useState<RecordingVisibility>("public");

  useEffect(() => {
    void getCapturePrefs().then((p) => setVisibility(p.visibility ?? "public"));
    return watchCapturePrefs((p) => setVisibility(p.visibility ?? "public"));
  }, []);

  const choose = (next: RecordingVisibility) => {
    setVisibility(next);
    void getCapturePrefs().then((p) =>
      setCapturePrefs({ ...p, visibility: next }),
    );
  };

  const current = VISIBILITY[visibility];

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Change video access"
        className={ACTION_CLASS}
      >
        {current.icon}
        {current.label}
      </Dropdown.Trigger>
      <Dropdown.Popover placement="top" className={MENU_POPOVER}>
        <Dropdown.Menu
          aria-label="Change video access"
          selectionMode="single"
          selectedKeys={[visibility]}
          onAction={(key) => choose(String(key) as RecordingVisibility)}
          className={MENU_LIST}
        >
          {VISIBILITY_ORDER.map((id) => (
            <Dropdown.Item key={id} id={id} className={MENU_ITEM}>
              {VISIBILITY[id].icon}
              {VISIBILITY[id].label}
              <Dropdown.ItemIndicator className={MENU_CHECK} />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

const THEMES: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: SUN_ICON },
  { value: "dark", label: "Dark", icon: MOON_ICON },
  { value: "system", label: "System", icon: MONITOR_ICON },
];

// The dashboard's theme row: a label with the segmented control inline.
function ThemeRow() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    void getThemePreference().then(setPreference);
    return watchThemePreference(setPreference);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <span className="flex items-center gap-2 text-sm">
        {PALETTE_ICON}
        Theme
      </span>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex items-center gap-0.5 rounded-full bg-overlay p-0.5"
      >
        {THEMES.map(({ value, label, icon }) => {
          const on = value === preference;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label}
              onClick={() => void setThemePreference(value)}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-full outline-none transition-colors motion-reduce:transition-none ${
                on
                  ? "bg-background text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const WAND_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <path
      d="m4 20 10.5-10.5M13 7l1-3 1 3 3 1-3 1-1 3-1-3-3-1 3-1zM18 14l.6-1.6L20.2 12l-1.6-.6L18 9.8l-.6 1.6-1.6.6 1.6.6L18 14zM6 8l.5-1.3L7.8 6 6.5 5.5 6 4.2l-.5 1.3L4.2 6l1.3.5L6 8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BOARD_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <rect
      x="3"
      y="4"
      width="18"
      height="13"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M7 12.5c1.5-3.5 3-3.5 4.5 0s3 3.5 4.5 0M9 20.5h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export function FooterActions({
  onEffects,
  onQuality,
}: {
  onEffects: () => void;
  onQuality: () => void;
}) {
  const [quality, setQuality] = useState<RecordingQualityId>(
    DEFAULT_RECORDING_QUALITY,
  );
  const [maxQuality, setMaxQuality] = useState<RecordingQualityId | null>(
    UNREAD_LIMITS.maxQuality,
  );
  useEffect(() => {
    void getCapturePrefs().then((p) =>
      setQuality(hydrateRecordingQuality(p.quality)),
    );
    return watchCapturePrefs((p) =>
      setQuality(hydrateRecordingQuality(p.quality)),
    );
  }, []);
  useEffect(() => {
    let cancelled = false;
    sendMessage("recordingLimits", undefined)
      .then((limits) => {
        if (!cancelled) setMaxQuality(limits ? limits.maxQuality : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const openDashboard = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };
  const onSignOut = () => {
    void sendMessage("signOut", undefined);
    closeSurface();
  };

  // The service worker closes this panel and reopens it on the new tab.
  const openCanvas = () => void sendMessage("openCanvas", undefined);

  return (
    <footer className="-mt-2 grid grid-cols-4 justify-items-center">
      <button type="button" onClick={onEffects} className={ACTION_CLASS}>
        {WAND_ICON}
        Effects
      </button>
      <button type="button" onClick={openCanvas} className={ACTION_CLASS}>
        {BOARD_ICON}
        Canvas
      </button>
      <VisibilityAction />
      <Dropdown>
        <Dropdown.Trigger aria-label="More" className={ACTION_CLASS}>
          {MORE_ICON}
          More
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top" className={MENU_POPOVER}>
          {/* Outside the Menu: an item would close the popover on each press,
              and the theme is something to flick between. */}
          <ThemeRow />
          <Dropdown.Menu className={`${MENU_LIST} border-t border-separator`}>
            <Dropdown.Item
              onAction={onQuality}
              className={`${MENU_ITEM} justify-between pe-5`}
            >
              Quality
              <span className="text-sm text-muted">
                {RECORDING_QUALITIES[clampQuality(quality, maxQuality)].label}
              </span>
            </Dropdown.Item>
            <Dropdown.Item onAction={openDashboard} className={MENU_ITEM}>
              Open dashboard
            </Dropdown.Item>
            {/* The text carries its own colour: the item's is overridden by
                HeroUI's label styling, so it never reached the words. */}
            <Dropdown.Item
              onAction={onSignOut}
              className={`${MENU_ITEM} hover:bg-danger data-[focus-visible=true]:bg-danger [&:hover_span]:text-white [&[data-focus-visible=true]_span]:text-white`}
            >
              <span className="text-danger">Sign out</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </footer>
  );
}
