import { useEffect, useState, type ReactNode } from "react";
import { Dropdown } from "@heroui/react";
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
import { getUserProfile, watchUserProfile } from "@/lib/auth/session";
import {
  resolveUploadWorkspace,
  type UserWorkspace,
} from "@/lib/auth/workspaces";
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
  "flex cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs text-muted outline-none transition-colors hover:text-foreground motion-reduce:transition-none";

/*
 * Where the next recording saves, chosen before it starts and sent with the
 * upload like the other capture prefs. The list rides the auth probe, so it
 * is as fresh as the last panel open; a pick that is no longer listed falls
 * back to the dashboard's default.
 */
function WorkspaceAction() {
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [pickedId, setPickedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    void getUserProfile().then((p) => setWorkspaces(p?.workspaces ?? []));
    void getCapturePrefs().then((p) => setPickedId(p.workspaceId));
    const unwatchProfile = watchUserProfile((p) =>
      setWorkspaces(p?.workspaces ?? []),
    );
    const unwatchPrefs = watchCapturePrefs((p) => setPickedId(p.workspaceId));
    return () => {
      unwatchProfile();
      unwatchPrefs();
    };
  }, []);

  const choose = (next: string) => {
    setPickedId(next);
    void getCapturePrefs().then((p) =>
      setCapturePrefs({ ...p, workspaceId: next }),
    );
  };

  const current = resolveUploadWorkspace(workspaces, pickedId);

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Choose where the recording saves"
        className={ACTION_CLASS}
      >
        {USERS_ICON}
        <span className="max-w-24 truncate">
          {current?.name ?? "Workspace"}
        </span>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="top" className={MENU_POPOVER}>
        <p className="px-5 pt-3 pb-1 text-[11px] font-medium tracking-wide text-muted uppercase">
          Save to
        </p>
        <Dropdown.Menu
          aria-label="Save to workspace"
          selectionMode="single"
          selectedKeys={current ? [current.id] : []}
          onAction={(key) => choose(String(key))}
          className={MENU_LIST}
        >
          {workspaces.map((w) => (
            <Dropdown.Item key={w.id} id={w.id} className={MENU_ITEM}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{w.name}</span>
                <span className="text-xs opacity-70">
                  {w.kind === "personal"
                    ? "Personal"
                    : w.role === "owner"
                      ? "Team · you own this"
                      : "Team · you joined"}
                  {w.isDefault ? " · Default" : ""}
                </span>
              </span>
              <Dropdown.ItemIndicator className={MENU_CHECK} />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

// The same three choices the share page offers, inline like the theme row.
function VisibilityRow() {
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

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <span className="flex items-center gap-2 text-sm">
        {VISIBILITY[visibility].icon}
        {VISIBILITY[visibility].label}
      </span>
      <div
        role="radiogroup"
        aria-label="Video access"
        className="flex items-center gap-0.5 rounded-full bg-overlay p-0.5"
      >
        {VISIBILITY_ORDER.map((id) => {
          const on = id === visibility;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={VISIBILITY[id].label}
              onClick={() => choose(id)}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-full outline-none transition-colors motion-reduce:transition-none [&_svg]:size-4 ${
                on
                  ? "bg-background text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {VISIBILITY[id].icon}
            </button>
          );
        })}
      </div>
    </div>
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

export function FooterActions({ onEffects }: { onEffects: () => void }) {
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
      <button type="button" onClick={onEffects} className={ACTION_CLASS}>
        {WAND_ICON}
        Effects
      </button>
      <WorkspaceAction />
      <Dropdown>
        <Dropdown.Trigger aria-label="More" className={ACTION_CLASS}>
          {MORE_ICON}
          More
        </Dropdown.Trigger>
        <Dropdown.Popover placement="top" className={MENU_POPOVER}>
          {/* Outside the Menu: an item would close the popover on each press,
              and the theme is something to flick between. */}
          <VisibilityRow />
          <ThemeRow />
          <Dropdown.Menu className={`${MENU_LIST} border-t border-separator`}>
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
