import { formatBytes } from "@/lib/format";
import type { SpikeResult, SpikeStatus } from "@/lib/storage";
import { DevicePickers } from "./DevicePickers";

type RecorderPanelProps = {
  status: SpikeStatus;
  result: SpikeResult | null;
  onStart: () => void;
  onSignOut: () => void;
};

const START_LABEL: Partial<Record<SpikeStatus["kind"], string>> = {
  preparing: "Preparing…",
  recording: "Recording…",
};

function StatusLine({
  status,
  result,
}: {
  status: SpikeStatus;
  result: SpikeResult | null;
}) {
  if (status.kind === "preparing" || status.kind === "recording") {
    return <p className="cf-status">Choose a source in the picker…</p>;
  }
  if (!result) {
    return (
      <p className="cf-status cf-status--muted">
        No capture yet — Phase 0 records ~5s to verify the pipeline.
      </p>
    );
  }
  if (!result.ok) {
    return (
      <p className="cf-status cf-status--error">
        Last capture failed: {result.error ?? "unknown error"}
      </p>
    );
  }
  return (
    <p className="cf-status cf-status--ok">
      Last capture: {formatBytes(result.bytes)} · {result.mimeType} ·{" "}
      {(result.durationMs / 1000).toFixed(1)}s ✓
    </p>
  );
}

export function RecorderPanel({
  status,
  result,
  onStart,
  onSignOut,
}: RecorderPanelProps) {
  const isBusy = status.kind === "preparing" || status.kind === "recording";

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

      <button
        type="button"
        className="cf-start"
        onClick={onStart}
        disabled={isBusy}
      >
        {START_LABEL[status.kind] ?? "Start Recording"}
      </button>

      <StatusLine status={status} result={result} />

      <footer className="cf-footer">
        <button type="button" className="cf-signout" onClick={onSignOut}>
          Sign out
        </button>
      </footer>
    </div>
  );
}
