import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import {
  DEFAULT_RECORDING_QUALITY,
  RECORDING_QUALITIES,
  RECORDING_QUALITY_IDS,
  estimateBytesPerMinute,
  hydrateRecordingQuality,
  type RecordingQuality,
  type RecordingQualityId,
} from "@captureflow/engine";
import {
  getCapturePrefs,
  setCapturePrefs,
  watchCapturePrefs,
} from "@/lib/storage";

const BACK_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path
      d="M15 5l-7 7 7 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
    <path
      d="m5 12.5 4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MB = 1024 * 1024;

function detail(quality: RecordingQuality, camera: boolean): string {
  const { screen, webcam } = quality;
  const parts = [`${screen.maxHeight}p`, `${screen.fps} fps`];
  if (camera) parts.push(`camera ${webcam.height}p`);
  return parts.join(" · ");
}

function perMinute(quality: RecordingQuality, camera: boolean): string {
  const mb = estimateBytesPerMinute(quality, camera) / MB;
  return `≈ ${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB/min`;
}

// The ceilings the next recording is encoded under, lowest first. Saved with
// the capture prefs so the service worker sends it with the capture request.
export function QualityPanel({ onBack }: { onBack: () => void }) {
  const [quality, setQuality] = useState<RecordingQualityId>(
    DEFAULT_RECORDING_QUALITY,
  );
  const [camera, setCamera] = useState(true);

  useEffect(() => {
    const read = (p: { quality?: unknown; camera: boolean }) => {
      setQuality(hydrateRecordingQuality(p.quality));
      setCamera(p.camera);
    };
    void getCapturePrefs().then(read);
    return watchCapturePrefs(read);
  }, []);

  const choose = (next: RecordingQualityId) => {
    setQuality(next);
    void getCapturePrefs().then((p) =>
      setCapturePrefs({ ...p, quality: next }),
    );
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 px-[19px] pt-4 pb-5">
      <header className="flex items-center gap-1">
        <Button variant="ghost" isIconOnly aria-label="Back" onPress={onBack}>
          {BACK_ICON}
        </Button>
        <h2 className="text-lg font-semibold text-foreground">Quality</h2>
      </header>

      <div
        role="radiogroup"
        aria-label="Recording quality"
        className="flex flex-col overflow-hidden rounded-[14px] border border-separator bg-surface"
      >
        {RECORDING_QUALITY_IDS.map((id) => {
          const preset = RECORDING_QUALITIES[id];
          const on = id === quality;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(id)}
              className="flex cursor-pointer flex-col gap-0.5 border-t border-separator px-4 py-3 text-left outline-none first:border-t-0 hover:bg-overlay focus-visible:bg-overlay"
            >
              <span className="flex w-full items-center gap-3">
                <span className="flex-1 text-[15px] font-semibold text-foreground">
                  {preset.label}
                </span>
                <span className="text-sm tabular-nums text-muted">
                  {perMinute(preset, camera)}
                </span>
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                    on ? "bg-accent text-white" : "border border-separator"
                  }`}
                >
                  {on ? CHECK_ICON : null}
                </span>
              </span>
              <span className="text-xs text-muted">
                {detail(preset, camera)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        Estimates for a typical screen recording
        {camera ? " with the camera on" : ""}.
      </p>
    </div>
  );
}
