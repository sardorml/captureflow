import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Link,
  Menu,
  Spinner,
  Typography,
} from "@heroui/react";
import {
  getCapturePrefs,
  setCapturePrefs,
  watchCapturePrefs,
  type CaptureSource,
  type RecordingResult,
  type RecordingStatus,
} from "@/lib/storage";
import { MAX_DURATION_MS } from "@/lib/capture/limits";
import { DevicePickers } from "./DevicePickers";

type RecorderPanelProps = {
  status: RecordingStatus;
  result: RecordingResult | null;
  onStart: () => void;
  onStop: () => void;
};

const WINDOW_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
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
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
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

/* The one committing action in the panel, so it carries weight the blue
   accent doesn't: warm fill, squared-off radius, heavier label. */
const START_CLASS =
  "h-11 rounded-xl text-[15px] font-semibold [--button-bg:#e8563a] [--button-bg-hover:#d94b30] [--button-bg-pressed:#c44227]";

type SourceOption = {
  id: CaptureSource;
  label: string;
  icon: React.ReactNode;
  // The tab source records straight away; the other two have to go through
  // Chrome's own picker, which only ever opens on the pane we ask for.
  hint: string;
};

const DEFAULT_SOURCE: SourceOption = {
  id: "screen",
  label: "Full screen",
  icon: SCREEN_ICON,
  hint: "Pick at start",
};

const SOURCES: SourceOption[] = [
  DEFAULT_SOURCE,
  { id: "window", label: "Window", icon: WINDOW_ICON, hint: "Pick at start" },
  { id: "tab", label: "This tab", icon: TAB_ICON, hint: "Records now" },
];

/*
 * "This tab" records immediately from a chrome.tabCapture stream id. Full
 * screen and Window can't: getDisplayMedia always shows Chrome's own picker,
 * and displaySurface only chooses which pane it opens on. The row says which
 * of the two you get rather than implying they behave alike.
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
      <Dropdown.Trigger
        aria-label="Capture source"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 text-start outline-none"
      >
        <span className="flex text-foreground" aria-hidden>
          {selected.icon}
        </span>
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {selected.label}
        </span>
        <span className="text-xs text-muted">{selected.hint}</span>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom start" className="min-w-56">
        <Menu
          selectionMode="single"
          selectedKeys={[source]}
          onAction={(key) => choose(String(key) as CaptureSource)}
        >
          {SOURCES.map((s) => (
            <Menu.Item key={s.id} id={s.id}>
              {s.icon}
              {s.label}
            </Menu.Item>
          ))}
        </Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

const BUSY_LABEL: Partial<Record<RecordingStatus["kind"], string>> = {
  preparing: "Starting…",
  uploading: "Uploading…",
};

export function ResultLink({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the link is still tappable */
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Typography type="body-xs" className="text-success">
        {label} ✓
      </Typography>
      <div className="flex items-center gap-2 rounded-[10px] bg-surface px-2.5 py-2">
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate text-xs"
        >
          {url}
        </Link>
        <Button variant="outline" size="sm" onPress={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

function StatusLine({
  status,
  result,
}: {
  status: RecordingStatus;
  result: RecordingResult | null;
}) {
  switch (status.kind) {
    case "preparing":
      return (
        <Typography type="body-xs">Choose a source in the picker…</Typography>
      );
    case "recording":
    case "paused":
      return (
        <Typography type="body-xs">
          {status.kind === "paused" ? "Paused" : "Recording"} — control it from
          the bar on the page.
        </Typography>
      );
    case "uploading":
      return <Typography type="body-xs">Uploading your recording…</Typography>;
    case "cancelled":
      return (
        <Typography type="body-xs" color="muted">
          Recording cancelled.
        </Typography>
      );
    case "error":
      return (
        <Typography type="body-xs" className="text-danger">
          {status.detail ?? "Something went wrong."}
        </Typography>
      );
    default:
      if (result?.ok) {
        return (
          <ResultLink url={result.url} label="Your recording link is ready" />
        );
      }
      return null;
  }
}

export function RecorderPanel({
  status,
  result,
  onStart,
  onStop,
}: RecorderPanelProps) {
  const isLive = status.kind === "recording" || status.kind === "paused";
  const isBusy = status.kind === "preparing" || status.kind === "uploading";

  return (
    <div className="flex flex-col gap-3">
      <SourcePicker />

      <DevicePickers />

      {isLive ? (
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onPress={onStop}
          className="h-11 rounded-xl text-[15px] font-semibold"
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
      <Typography type="body-xs" color="muted" align="center" className="-mt-2">
        {Math.round(MAX_DURATION_MS / 60_000)} min recording limit
      </Typography>

      <StatusLine status={status} result={result} />
    </div>
  );
}
