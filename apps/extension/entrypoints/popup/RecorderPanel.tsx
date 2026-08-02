import { useState } from "react";
import { Button, Link, Spinner, Typography } from "@heroui/react";
import type { RecordingResult, RecordingStatus } from "@/lib/storage";
import { MAX_DURATION_MS } from "@/lib/capture/limits";
import { DevicePickers } from "./DevicePickers";

type RecorderPanelProps = {
  status: RecordingStatus;
  result: RecordingResult | null;
  onStart: () => void;
  onStop: () => void;
};

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
      <div className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5">
        <span className="flex text-foreground" aria-hidden>
          {SCREEN_ICON}
        </span>
        <Typography type="body-sm" weight="medium" className="flex-1">
          Screen, window, or tab
        </Typography>
        <Typography type="body-xs" color="muted">
          Pick at start
        </Typography>
      </div>

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
