import { useEffect, useState } from "react";
import { Button, Dropdown, Spinner } from "@heroui/react";
import {
  getCapturePrefs,
  setCapturePrefs,
  watchCapturePrefs,
  type CaptureSource,
  type RecordingStatus,
} from "@/lib/storage";
import { isOverlaySurface } from "@/lib/surface";
import { DevicePickers } from "./DevicePickers";
import {
  MENU_CHECK,
  MENU_ITEM,
  MENU_LIST,
  MENU_OFFSET,
  MENU_POPOVER,
  PANEL_ROW,
} from "./panel";

type RecorderPanelProps = {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
};

const WINDOW_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
    <rect
      x="3.5"
      y="4.5"
      width="17"
      height="15"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M3.5 10h17M10 10v9.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const TAB_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
    <rect
      x="3"
      y="7"
      width="18"
      height="11"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const SCREEN_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
    <rect
      x="3"
      y="5"
      width="18"
      height="12.5"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M9 20.5h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// Same box as the rows, so the stack reads as one column of controls.
const ACTION_CLASS =
  "h-[50px] rounded-[14px] border border-separator text-[15px] font-semibold";
/* The one committing action in the panel, so it carries weight the blue
   accent doesn't: a brick-red fill. */
const START_CLASS = `${ACTION_CLASS} [--button-bg:#bc381c] [--button-bg-hover:#ab3119] [--button-bg-pressed:#962a15]`;

type SourceOption = {
  id: CaptureSource;
  label: string;
  icon: React.ReactNode;
};

const DEFAULT_SOURCE: SourceOption = {
  id: "screen",
  label: "Full screen",
  icon: SCREEN_ICON,
};

const SOURCES: SourceOption[] = [
  DEFAULT_SOURCE,
  { id: "window", label: "Window", icon: WINDOW_ICON },
  { id: "tab", label: "This tab", icon: TAB_ICON },
];

/*
 * "This tab" records immediately from a chrome.tabCapture stream id. Full
 * screen and Window can't: getDisplayMedia always shows Chrome's own picker,
 * and displaySurface only chooses which pane it opens on.
 */
function SourcePicker() {
  const [source, setSource] = useState<CaptureSource>("screen");

  useEffect(() => {
    void getCapturePrefs().then((p) => setSource(p.source ?? "screen"));
    return watchCapturePrefs((p) => setSource(p.source ?? "screen"));
  }, []);

  const choose = (next: CaptureSource) => {
    setSource(next);
    void getCapturePrefs().then((p) => setCapturePrefs({ ...p, source: next }));
  };

  const selected = SOURCES.find((s) => s.id === source) ?? DEFAULT_SOURCE;

  return (
    <Dropdown>
      {/* The source is the panel's headline choice, so the row carries the
          accent instead of sitting in the same grey as the device rows. */}
      <Dropdown.Trigger
        aria-label="Capture source"
        className={`${PANEL_ROW} w-full cursor-pointer border-2 border-(--cf-ring) bg-accent text-start text-white outline-none`}
      >
        <span className="flex" aria-hidden>
          {selected.icon}
        </span>
        <span className="flex-1 truncate">{selected.label}</span>
      </Dropdown.Trigger>
      {/* Beside the card, in the overlay frame's gutter. The standalone window
          has no gutter to open into, so there it drops under the row. */}
      <Dropdown.Popover
        placement={isOverlaySurface ? "left top" : "bottom start"}
        offset={isOverlaySurface ? MENU_OFFSET : undefined}
        shouldFlip={!isOverlaySurface}
        className={MENU_POPOVER}
      >
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[source]}
          onAction={(key) => choose(String(key) as CaptureSource)}
          className={MENU_LIST}
        >
          {SOURCES.map((s) => (
            <Dropdown.Item key={s.id} id={s.id} className={MENU_ITEM}>
              {s.icon}
              {s.label}
              {/* Trailing check, like the row it stands for: HeroUI parks the
                  indicator at the start, where the source icon already is. */}
              <Dropdown.ItemIndicator className={MENU_CHECK} />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

const BUSY_LABEL: Partial<Record<RecordingStatus["kind"], string>> = {
  preparing: "Starting…",
  uploading: "Uploading…",
};

export function RecorderPanel({ status, onStart, onStop }: RecorderPanelProps) {
  const isLive = status.kind === "recording" || status.kind === "paused";
  const isBusy = status.kind === "preparing" || status.kind === "uploading";

  return (
    <div className="flex flex-col gap-4">
      <SourcePicker />

      <DevicePickers />

      {isLive ? (
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onPress={onStop}
          className={ACTION_CLASS}
        >
          Stop Recording
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isDisabled={isBusy}
          onPress={onStart}
          className={START_CLASS}
        >
          {isBusy && <Spinner size="sm" color="current" />}
          {BUSY_LABEL[status.kind] ?? "Start Recording"}
        </Button>
      )}
    </div>
  );
}
