import { useState } from "react";
import type { RecordingResult, RecordingStatus } from "@/lib/storage";
import { DevicePickers } from "./DevicePickers";

type RecorderPanelProps = {
  status: RecordingStatus;
  result: RecordingResult | null;
  onStart: () => void;
  onStop: () => void;
  onSignOut: () => void;
};

const BUSY_LABEL: Partial<Record<RecordingStatus["kind"], string>> = {
  preparing: "Starting…",
  uploading: "Uploading…",
};

function ShareLink({ url }: { url: string }) {
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
      <p className="cf-status cf-status--ok">Your share link is ready ✓</p>
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
      return <p className="cf-status">Recording… stop when you’re done.</p>;
    case "uploading":
      return <p className="cf-status">Uploading your recording…</p>;
    case "cancelled":
      return <p className="cf-status cf-status--muted">Recording cancelled.</p>;
    case "error":
      return (
        <p className="cf-status cf-status--error">
          {status.detail ?? result?.error ?? "Something went wrong."}
        </p>
      );
    default:
      if (result?.ok && result.url) return <ShareLink url={result.url} />;
      return (
        <p className="cf-status cf-status--muted">
          Record your screen and get an instant share link.
        </p>
      );
  }
}

export function RecorderPanel({
  status,
  result,
  onStart,
  onStop,
  onSignOut,
}: RecorderPanelProps) {
  const isRecording = status.kind === "recording";
  const isBusy = status.kind === "preparing" || status.kind === "uploading";

  return (
    <div className="cf-panel">
      <header className="cf-header">
        <div className="cf-brand">
          <span className="cf-logo" aria-hidden />
          CaptureFlow
        </div>
        <div className="cf-mode" role="tablist" aria-label="Capture mode">
          <button type="button" className="cf-mode-btn is-active" aria-selected>
            Video
          </button>
          <button
            type="button"
            className="cf-mode-btn"
            disabled
            title="Coming soon"
          >
            Screenshot
          </button>
        </div>
      </header>

      <section className="cf-section">
        <span className="cf-label">Source</span>
        <p className="cf-source">
          Pick a screen, window, or browser tab when recording starts.
        </p>
      </section>

      <DevicePickers />

      {isRecording ? (
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

      <StatusLine status={status} result={result} />

      <footer className="cf-footer">
        <button type="button" className="cf-signout" onClick={onSignOut}>
          Sign out
        </button>
      </footer>
    </div>
  );
}
