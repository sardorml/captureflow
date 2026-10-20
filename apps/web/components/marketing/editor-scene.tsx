"use client";

import { useRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "./i18n-provider";
import { SceneFrame, useLoopAnimation, type SceneState } from "./scene-frame";
import { WebcamLoop } from "./webcam-loop";

const LOOP_MS = 12000;

// The edits land one after another, then hold before the loop starts over.
const STEPS = [0, 1800, 4200, 6600, 8000, 9400];

const SWATCHES = [
  "#e4e7ef",
  "linear-gradient(135deg,#fde68a,#fb923c 55%,#f43f5e)",
  "linear-gradient(135deg,#a5f3fc,#3b82f6)",
  "linear-gradient(135deg,#bbf7d0,#14b8a6)",
];
const PICKED_SWATCH = 1;

const BARS = Array.from(
  { length: 72 },
  (_, i) => 8 + ((i * 37) % 13) * 2 + ((i * 11) % 5) * 3,
);
const FILLER_BARS = { from: 27, to: 37 };

const PREVIEW = { width: 404, height: 252 };
const CAMERA = {
  before: { size: 88, left: 14, top: PREVIEW.height - 88 - 14, radius: 44 },
  after: {
    size: 120,
    left: PREVIEW.width - 120 - 30,
    top: PREVIEW.height - 120 - 30,
    radius: 26,
  },
};

export function EditorScene() {
  return (
    <SceneFrame steps={STEPS} loopMs={LOOP_MS} background="#d3dffa">
      {(state) => <EditorContent {...state} />}
    </SceneFrame>
  );
}

function EditorContent({ step, playing }: SceneState) {
  const copy = useMessages().collaboration.categories.share.scene;
  const playheadRef = useRef<HTMLSpanElement>(null);
  useLoopAnimation(
    playheadRef,
    [{ left: "0%" }, { left: "100%" }],
    LOOP_MS,
    playing,
  );

  const hasBackground = step >= 1;
  const cameraMoved = step >= 2;
  const fillersMarked = step >= 3;
  const fillersCut = step >= 4;
  const saved = step >= 5;
  const camera = cameraMoved ? CAMERA.after : CAMERA.before;

  return (
    <>
      <div
        className="absolute top-7 left-7 overflow-hidden rounded-2xl shadow-[0_18px_40px_rgb(10_30_90/0.18)] transition-[background] duration-700"
        style={{
          ...PREVIEW,
          background: hasBackground ? SWATCHES[PICKED_SWATCH] : SWATCHES[0],
        }}
      >
        <div
          className={cn(
            "absolute overflow-hidden bg-white transition-all duration-700 ease-out",
            hasBackground
              ? "inset-[22px] rounded-[10px] shadow-[0_12px_30px_rgb(0_0_0/0.18)]"
              : "inset-0 rounded-none",
          )}
        >
          <AppScreen copy={copy} />
        </div>

        <div
          className="absolute overflow-hidden bg-[#d9d4c8] shadow-[0_0_0_3px_#fff,0_10px_24px_rgb(0_0_0/0.3)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: camera.size,
            height: camera.size,
            left: camera.left,
            top: camera.top,
            borderRadius: camera.radius,
          }}
        >
          <WebcamLoop name="cardigan" />
        </div>

        <div
          className={cn(
            "absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#16181d] py-1 pr-2.5 pl-1.5 text-[10px] font-medium text-white shadow-lg transition-all duration-500",
            saved ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          )}
        >
          <span className="flex size-4 items-center justify-center rounded-full bg-[#22c55e]">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          {copy.saved}
        </div>
      </div>

      <div className="absolute top-7 right-7 flex w-[128px] flex-col gap-3">
        <Tool label={copy.background} on={hasBackground}>
          <div className="flex gap-1.5">
            {SWATCHES.map((swatch, i) => (
              <span
                key={swatch}
                className={cn(
                  "size-[18px] rounded-md transition-shadow duration-300",
                  hasBackground && i === PICKED_SWATCH
                    ? "shadow-[0_0_0_2px_#fff,0_0_0_4px_#2662e8]"
                    : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]",
                )}
                style={{ background: swatch }}
              />
            ))}
          </div>
        </Tool>
        <Tool label={copy.camera} on={cameraMoved}>
          <div className="flex gap-1.5">
            {copy.shapes.map((shape, i) => (
              <span
                key={shape}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[9px] font-medium transition-colors duration-300",
                  (cameraMoved ? 1 : 0) === i
                    ? "bg-[#2662e8] text-white"
                    : "bg-[#eef1f7] text-[#52525b]",
                )}
              >
                <span
                  className={cn(
                    "size-2 border-[1.5px] border-current",
                    i === 0 ? "rounded-full" : "rounded-[2px]",
                  )}
                />
                {shape}
              </span>
            ))}
          </div>
        </Tool>
        <Tool label={copy.fillers} on={fillersCut}>
          <div className="flex items-center justify-between text-[9px] font-medium text-[#52525b]">
            {copy.remove}
            <span
              className={cn(
                "relative h-3.5 w-6 rounded-full transition-colors duration-300",
                fillersMarked ? "bg-[#2662e8]" : "bg-[#d4d4d8]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-2.5 rounded-full bg-white shadow transition-[left] duration-300",
                  fillersMarked ? "left-[12px]" : "left-0.5",
                )}
              />
            </span>
          </div>
        </Tool>
      </div>

      <div className="absolute inset-x-7 top-[300px] flex h-14 items-center overflow-hidden rounded-2xl bg-white/70 px-4">
        <div className="relative flex h-full flex-1 items-center">
          {BARS.map((height, i) => {
            const filler = i >= FILLER_BARS.from && i < FILLER_BARS.to;
            return (
              <span
                key={i}
                className={cn(
                  "shrink-0 rounded-full transition-all duration-500",
                  filler && fillersMarked ? "bg-[#2662e8]" : "bg-[#2662e8]/35",
                  filler && fillersCut
                    ? "mx-0 w-0 opacity-0"
                    : "mx-[1.5px] w-[4px]",
                )}
                style={{ height }}
              />
            );
          })}
          <span
            ref={playheadRef}
            className="absolute inset-y-1 w-0.5 rounded-full bg-[#2662e8]"
            style={{ left: playing ? "0%" : "70%" }}
          />
        </div>
      </div>

      <p className="absolute inset-x-7 top-[374px] flex items-center text-[19px] font-semibold whitespace-nowrap text-[#2662e8]">
        <span className="mr-[0.3em]">{copy.transcript.before}</span>
        {copy.transcript.fillers.map((word) => (
          <span
            key={word}
            className={cn(
              "inline-block overflow-hidden rounded transition-all duration-500",
              fillersMarked
                ? "bg-[#2662e8]/20 text-[#2662e8]/60 line-through"
                : "",
              fillersCut
                ? "mr-0 max-w-0 px-0 opacity-0"
                : "mr-[0.3em] max-w-[80px] px-0.5",
            )}
          >
            {word}
          </span>
        ))}
        <span>{copy.transcript.after}</span>
      </p>
    </>
  );
}

function Tool({
  label,
  on,
  children,
}: {
  label: string;
  on: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl bg-white p-2.5 shadow-[0_10px_24px_rgb(10_30_90/0.3)] transition-transform duration-300",
        on && "scale-[1.03]",
      )}
    >
      <span className="text-[10px] font-semibold text-[#18181b]">{label}</span>
      {children}
    </div>
  );
}

export function AppScreen({
  copy,
}: {
  copy: ReturnType<
    typeof useMessages
  >["collaboration"]["categories"]["share"]["scene"];
}) {
  return (
    <div className="flex size-full flex-col text-[#18181b]">
      <div className="flex h-5 shrink-0 items-center gap-1 border-b border-black/5 bg-[#f4f5f9] px-2">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" />
        <span className="size-1.5 rounded-full bg-[#febc2e]" />
        <span className="size-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[78px] shrink-0 flex-col gap-1 border-r border-black/5 bg-[#fafbfc] p-2">
          {copy.nav.map((item, i) => (
            <span
              key={item}
              className={cn(
                "rounded px-1.5 py-1 text-[8px] font-medium",
                i === 1 ? "bg-[#e8eefc] text-[#2662e8]" : "text-black/50",
              )}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
          <span className="text-[11px] font-bold">{copy.app}</span>
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {copy.columns.map((column, c) => (
              <div
                key={column.name}
                className="flex flex-col gap-1 rounded-md bg-[#f4f5f9] p-1.5"
              >
                <span className="text-[7px] font-semibold text-black/45">
                  {column.name}
                </span>
                {column.tasks.map((task) => (
                  <span
                    key={task}
                    className="flex flex-col gap-1 rounded bg-white p-1.5 text-[7.5px] leading-tight font-medium shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                  >
                    {task}
                    <span
                      className="h-1 w-6 rounded-full"
                      style={{
                        background: ["#f59e0b", "#2662e8", "#22c55e"][c],
                      }}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
