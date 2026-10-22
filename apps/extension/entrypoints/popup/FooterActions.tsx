import { useEffect, useState, type ReactNode } from "react";
import { Dropdown } from "@heroui/react";
import type { RecordingVisibility } from "@/lib/api/types";
import { sendMessage } from "@/lib/messaging";
import { WEB_BASE } from "@/lib/config";
import {
  getCapturePrefs,
  setCapturePrefs,
  watchCapturePrefs,
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
  "flex cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs text-muted outline-none transition-colors hover:text-foreground motion-reduce:transition-none";

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

export function FooterActions() {
  const openDashboard = () => {
    void chrome.tabs.create({ url: `${WEB_BASE}/recordings` });
    closeSurface();
  };
  const onSignOut = () => {
    void sendMessage("signOut", undefined);
    closeSurface();
  };

  return (
    <footer className="-mt-2 flex justify-center gap-6">
      <VisibilityAction />
      <Dropdown>
        <Dropdown.Trigger aria-label="More" className={ACTION_CLASS}>
          {MORE_ICON}
          More
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top">
          <Dropdown.Menu>
            <Dropdown.Item onAction={openDashboard}>
              Open dashboard
            </Dropdown.Item>
            <Dropdown.Item onAction={onSignOut}>Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </footer>
  );
}
