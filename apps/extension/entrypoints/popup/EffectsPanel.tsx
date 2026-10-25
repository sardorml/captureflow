import { useEffect, useState } from "react";
import { Button, Tabs } from "@heroui/react";
import {
  CAMERA_BACKGROUNDS,
  CAMERA_BACKGROUND_IDS,
  CAMERA_FILTERS,
  CAMERA_FILTER_IDS,
  DEFAULT_CAMERA_EFFECT,
  cameraBackgroundCss,
  hydrateCameraEffect,
  type CameraBackgroundId,
  type CameraEffect,
  type CameraFilterId,
} from "@/lib/capture/camera-effects";
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

const TAB_CLASS =
  "isolate h-9 flex-1 justify-center text-sm font-medium text-muted data-[selected=true]:text-foreground";

// A disc per background, the camera bubble's shape, with the chosen one
// ringed in the accent; None and Blur carry their names since they have no
// colour to show.
const SWATCH =
  "flex size-10 cursor-pointer items-center justify-center rounded-full text-[11px] font-semibold outline-none ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-separator aria-pressed:ring-2 aria-pressed:ring-accent motion-reduce:transition-none";

function swatchStyle(id: CameraBackgroundId): React.CSSProperties {
  const bg = CAMERA_BACKGROUNDS[id];
  if (bg.kind === "none") return {};
  if (bg.kind === "blur") {
    return {
      background: "radial-gradient(circle at 35% 35%, #9aa3ad, #3b4048)",
      color: "#fff",
    };
  }
  return { background: cameraBackgroundCss(id) };
}

// The effect lives with the capture prefs: the bubble previews it as it
// changes and the recorder bakes it into the camera track at start.
export function EffectsPanel({ onBack }: { onBack: () => void }) {
  const [effect, setEffect] = useState<CameraEffect>(DEFAULT_CAMERA_EFFECT);

  useEffect(() => {
    void getCapturePrefs().then((p) =>
      setEffect(hydrateCameraEffect(p.effect)),
    );
    return watchCapturePrefs((p) => setEffect(hydrateCameraEffect(p.effect)));
  }, []);

  const update = (patch: Partial<CameraEffect>) => {
    const next = { ...effect, ...patch };
    setEffect(next);
    void getCapturePrefs().then((p) => setCapturePrefs({ ...p, effect: next }));
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 px-[19px] pt-4 pb-5">
      <header className="flex items-center gap-1">
        <Button variant="ghost" isIconOnly aria-label="Back" onPress={onBack}>
          {BACK_ICON}
        </Button>
        <h2 className="text-lg font-semibold text-foreground">Effects</h2>
      </header>

      <Tabs defaultSelectedKey="backgrounds" aria-label="Camera effects">
        <Tabs.ListContainer className="rounded-[14px] border border-separator bg-overlay p-1">
          <Tabs.List className="flex w-full min-w-0! gap-0 p-0">
            <Tabs.Tab id="backgrounds" className={TAB_CLASS}>
              <Tabs.Indicator className="rounded-[10px] bg-background" />
              Backgrounds
            </Tabs.Tab>
            <Tabs.Tab id="filters" className={TAB_CLASS}>
              <Tabs.Indicator className="rounded-[10px] bg-background" />
              Filters
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="backgrounds" className="mt-3 p-0">
          <div
            role="radiogroup"
            aria-label="Camera background"
            className="grid grid-cols-5 justify-items-center gap-x-2.5 gap-y-3"
          >
            {CAMERA_BACKGROUND_IDS.map((id) => {
              const bg = CAMERA_BACKGROUNDS[id];
              const on = effect.background === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-pressed={on}
                  aria-label={bg.label}
                  onClick={() => update({ background: id })}
                  className={`${SWATCH} ${
                    bg.kind === "none"
                      ? "border border-separator bg-surface text-foreground"
                      : ""
                  }`}
                  style={swatchStyle(id)}
                >
                  {bg.kind === "none" || bg.kind === "blur" ? bg.label : null}
                </button>
              );
            })}
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="filters" className="mt-3 p-0">
          <div
            role="radiogroup"
            aria-label="Camera filter"
            className="grid grid-cols-3 gap-2"
          >
            {CAMERA_FILTER_IDS.map((id) => {
              const on = effect.filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => update({ filter: id as CameraFilterId })}
                  className={`flex h-[50px] cursor-pointer items-center justify-center rounded-[14px] border text-sm font-semibold outline-none transition-colors motion-reduce:transition-none ${
                    on
                      ? "border-accent bg-(--cf-selected) text-foreground"
                      : "border-separator bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {CAMERA_FILTERS[id].label}
                </button>
              );
            })}
          </div>
        </Tabs.Panel>
      </Tabs>

      <p className="text-xs text-muted">
        Applied to the camera in the preview and in the recording. Backgrounds
        need a moment to load the first time.
      </p>
    </div>
  );
}
