import { useState } from "react";
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

const BUSY_LABEL: Partial<Record<RecordingStatus["kind"], string>> = {
  preparing: "Starting…",
  uploading: "Uploading…",
};

function RecordingLink({ url }: { url: string }) {
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
    <div className="cf-result">
      <p className="cf-status cf-status--ok">Your recording link is ready ✓</p>
      <div className="cf-linkrow">
        <a className="cf-link" href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
        <button type="button" className="cf-copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
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
      return <p className="cf-status">Choose a source in the picker…</p>;
    case "recording":
    case "paused":
      return (
        <p className="cf-status">
          {status.kind === "paused" ? "Paused" : "Recording"} — control it from
          the bar on the page.
        </p>
      );
    case "uploading":
      return <p className="cf-status">Uploading your recording…</p>;
    case "cancelled":
      return <p className="cf-status cf-status--muted">Recording cancelled.</p>;
    case "error":
      return (
        <p className="cf-status cf-status--error">
          {status.detail ?? "Something went wrong."}
        </p>
      );
    default:
      if (result?.ok) return <RecordingLink url={result.url} />;
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
    <>
      <section className="cf-section">
        <div className="cf-row">
          <span className="cf-row-icon" aria-hidden>
            {SCREEN_ICON}
          </span>
          <span className="cf-row-label">Screen, window, or tab</span>
          <span className="cf-row-note">Pick at start</span>
        </div>
      </section>

      <DevicePickers />

      {isLive ? (
        <button type="button" className="cf-start cf-stop" onClick={onStop}>
          Stop Recording
        </button>
      ) : (
        <button
          type="button"
          className="cf-start"
          onClick={onStart}
          disabled={isBusy}
        >
          {BUSY_LABEL[status.kind] ?? "Start Recording"}
        </button>
      )}
      <p className="cf-limit">
        {Math.round(MAX_DURATION_MS / 60_000)} min recording limit
      </p>

      <StatusLine status={status} result={result} />
    </>
  );
}
