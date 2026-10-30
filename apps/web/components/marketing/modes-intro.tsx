"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Circle,
  Eraser,
  Hand,
  Highlighter,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Plus,
  Redo2,
  Square,
  Type,
  Undo2,
} from "lucide-react";
import { AppIcon } from "@/components/brand-mark";
import { PRODUCT_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { InstallButton } from "./install-button";
import { ChromeLogoColor } from "./platform-logos";
import { RecorderPanel } from "./recorder-panel";
import { WebcamLoop } from "./webcam-loop";

/*
 * Glyphs and colours copied from the extension's control bar
 * (apps/extension/entrypoints/control-bar.content/index.ts) so the mockup is
 * the bar people actually see while recording: folded to stop, clock and
 * pause, the way it sits once a recording is under way.
 */
const BAR = {
  background: "#292a2e",
  border: "#3b3d42",
  stop: "#ec5e3b",
  fg: "#f2f3f5",
  icon: "#c9cbd1",
};

const STOP_ICON = (
  <svg viewBox="0 0 17 17" width="17" height="17" aria-hidden>
    <rect width="17" height="17" rx="4" fill="currentColor" />
  </svg>
);
const PAUSE_ICON = (
  <svg viewBox="0 0 15 17" width="15" height="17" aria-hidden>
    <rect width="6" height="17" rx="1.5" fill="currentColor" />
    <rect x="9" width="6" height="17" rx="1.5" fill="currentColor" />
  </svg>
);

// Lays a pixel-authored mockup out at `width`×`height` and scales it to fit.
function Scaled({
  width,
  height,
  maxScale = 1,
  children,
}: {
  width: number;
  height: number;
  maxScale?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(maxScale, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, maxScale]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative w-full"
      style={{ maxWidth: width * maxScale, height: height * scale }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

function Presenter({
  size,
  ring,
  live = false,
  soft = false,
}: {
  size: number;
  ring: number;
  live?: boolean;
  soft?: boolean;
}) {
  const drop = soft
    ? "0 6px 16px rgb(0 0 0 / 0.14)"
    : "0 18px 40px rgb(0 0 0 / 0.45)";
  return (
    <span
      className="block overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 ${ring}px #fff, ${drop}`,
      }}
    >
      {live ? (
        <WebcamLoop name="cardigan" />
      ) : (
        <img
          src="/presenter-recorder.webp"
          alt=""
          width={320}
          height={320}
          className="size-full object-cover"
        />
      )}
    </span>
  );
}

/*
 * The recording scene: a walkthrough recorded over our /canvas, where the
 * presenter explains a three-step process. She types
 * the title, underlines it, then draws each step as a box, labels it and
 * arrows on to the next, while a live caption carries what she is saying.
 * One clock drives every part over a twelve-second loop, so the cursor, the
 * strokes, the typing and the active tool can never drift apart. Reduced
 * motion holds the finished frame.
 */
const LOOP_S = 12;
const REST_T = 0.93;
const FRAME_MS = 1000 / 30;

type Point = { x: number; y: number };
type Tool = "select" | "pen" | "rect" | "arrow" | "text";
type Box = { x: number; y: number; w: number; h: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: Point, b: Point, p: number): Point => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
});
// 0 before `from` seconds into the loop, 1 after `to`, linear between.
const phase = (t: number, from: number, to: number) =>
  clamp01((t * LOOP_S - from) / (to - from));

const SCENE = { width: 600, height: 338 };
const HEADING = { x: 72, y: 78 };
const UNDERLINE =
  "M74 120 C 95 108, 110 132, 132 120 S 170 108, 192 120 S 230 132, 252 120";
const UNDERLINE_END: Point = { x: 252, y: 120 };
const STEP_Y = 158;
const STEP_W = 116;
const STEP_H = 60;
const STEP_GAP = 48;
const STEPS: Box[] = [0, 1, 2].map((i) => ({
  x: 72 + i * (STEP_W + STEP_GAP),
  y: STEP_Y,
  w: STEP_W,
  h: STEP_H,
}));
const IDLE: Point = { x: 64, y: 110 };
const PARKED: Point = { x: 300, y: 262 };

// Each step's slice of the loop: the box drawn, its label typed, then the
// arrow on to the next step.
const STEP_START = 3.5;
const STEP_SPAN = 2.2;
const stepTimes = (i: number) => {
  const at = STEP_START + i * STEP_SPAN;
  return {
    box: [at, at + 0.6],
    label: [at + 0.7, at + 1.3],
    arrow: [at + 1.5, at + 1.9],
  } as const;
};
const arrowBetween = (i: number) => ({
  from: { x: STEPS[i].x + STEP_W + 8, y: STEP_Y + STEP_H / 2 },
  to: { x: STEPS[i + 1].x - 8, y: STEP_Y + STEP_H / 2 },
});

const TOOLS: { id: string; icon: ReactNode }[] = [
  { id: "select", icon: <MousePointer2 size={13} /> },
  { id: "hand", icon: <Hand size={13} /> },
  { id: "pen", icon: <Pencil size={13} /> },
  { id: "highlighter", icon: <Highlighter size={13} /> },
  { id: "rect", icon: <Square size={13} /> },
  { id: "ellipse", icon: <Circle size={13} /> },
  { id: "arrow", icon: <MoveUpRight size={13} /> },
  { id: "line", icon: <Minus size={13} /> },
  { id: "text", icon: <Type size={13} /> },
  { id: "eraser", icon: <Eraser size={13} /> },
];

// Clockwise from the top-left corner, matching where an SVG rect's path starts.
function boxPoint(box: Box, p: number): Point {
  const { x, y, w, h } = box;
  let d = p * 2 * (w + h);
  if (d <= w) return { x: x + d, y };
  d -= w;
  if (d <= h) return { x: x + w, y: y + d };
  d -= h;
  if (d <= w) return { x: x + w - d, y: y + h };
  d -= w;
  return { x, y: y + h - d };
}

function typed(text: string, p: number): string {
  return text.slice(0, Math.round(p * text.length));
}

// The loop's position, 0–1, ticking only while the scene is on screen.
export function useLoopClock(
  running: boolean,
  loopS = LOOP_S,
  rest = REST_T,
): number {
  const [t, setT] = useState(rest);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (now - last >= FRAME_MS) {
        last = now;
        setT(((now - start) % (loopS * 1000)) / (loopS * 1000));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, loopS]);
  return t;
}

export function useOnScreen(ref: React.RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setOnScreen(entry?.isIntersecting ?? false),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return onScreen;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Pill({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center gap-0.5 rounded-xl bg-canvas-2 p-1 shadow-md ring-1 ring-line",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ToolButton({ on, children }: { on?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-lg",
        on ? "bg-tint text-fg" : "text-fg-muted",
      )}
    >
      {children}
    </span>
  );
}

function CanvasScene({ t }: { t: number }) {
  const copy = useMessages().modes.scene;
  const underlineRef = useRef<SVGPathElement>(null);
  const s = t * LOOP_S;

  const heading = phase(t, 0.5, 2);
  const underline = phase(t, 2.5, 3.2);
  const steps = STEPS.map((box, i) => {
    const at = stepTimes(i);
    return {
      box,
      drawn: phase(t, ...at.box),
      label: phase(t, ...at.label),
      arrow: i < STEPS.length - 1 ? phase(t, ...at.arrow) : 0,
    };
  });
  const fade = 1 - phase(t, 11.4, 12);

  const lastStep = stepTimes(STEPS.length - 1);
  const stage = STEPS.findIndex((_, i) => s < stepTimes(i).box[0]);
  const captionIndex = stage === -1 ? STEPS.length : stage;

  let tool: Tool = "select";
  let cursor: Point = PARKED;
  if (s < 2.3) {
    tool = "text";
    cursor = IDLE;
  } else if (s < 2.5) {
    tool = "pen";
    cursor = lerp(IDLE, underlinePoint(underlineRef, 0), phase(t, 2.3, 2.5));
  } else if (s < 3.2) {
    tool = "pen";
    cursor = underlinePoint(underlineRef, underline);
  } else if (s < lastStep.label[1]) {
    const i = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor((s - STEP_START) / STEP_SPAN)),
    );
    const at = stepTimes(i);
    const box = STEPS[i];
    const labelPoint = { x: box.x + 16, y: box.y + box.h / 2 + 4 };
    const previous = i === 0 ? UNDERLINE_END : arrowBetween(i - 1).to;
    if (s < at.box[0]) {
      tool = "rect";
      cursor = lerp(
        previous,
        boxPoint(box, 0),
        phase(t, at.box[0] - 0.3, at.box[0]),
      );
    } else if (s < at.box[1]) {
      tool = "rect";
      cursor = boxPoint(box, steps[i].drawn);
    } else if (s < at.label[0]) {
      tool = "text";
      cursor = lerp(
        boxPoint(box, 0),
        labelPoint,
        phase(t, at.box[1], at.label[0]),
      );
    } else if (s < at.label[1]) {
      tool = "text";
      cursor = labelPoint;
    } else if (i < STEPS.length - 1) {
      const { from, to } = arrowBetween(i);
      tool = "arrow";
      cursor =
        s < at.arrow[0]
          ? lerp(labelPoint, from, phase(t, at.label[1], at.arrow[0]))
          : lerp(from, to, steps[i].arrow);
    }
  } else if (s < lastStep.label[1] + 0.5) {
    const box = STEPS[STEPS.length - 1];
    cursor = lerp(
      { x: box.x + 16, y: box.y + box.h / 2 + 4 },
      PARKED,
      phase(t, lastStep.label[1], lastStep.label[1] + 0.5),
    );
  }

  const caretOn = Math.floor(s * 2) % 2 === 0;
  const headingCaret = s >= 0.5 && s < 2.3 && caretOn;
  const timer = `0:${String(42 + Math.floor(s)).padStart(2, "0")}`;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-canvas text-fg"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(128 128 128 / 0.35) 1px, transparent 1.2px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-canvas-2 px-2 py-1 shadow-sm ring-1 ring-line">
        <AppIcon size={16} />
        <span className="text-[11px] font-semibold tracking-tight text-fg-strong">
          {PRODUCT_NAME}
        </span>
      </div>
      <Pill className="top-3 left-1/2 -translate-x-1/2">
        {TOOLS.map((item) => (
          <ToolButton key={item.id} on={item.id === tool}>
            {item.icon}
          </ToolButton>
        ))}
      </Pill>
      <Pill className="top-3 right-3">
        <ToolButton>
          <Undo2 size={13} />
        </ToolButton>
        <ToolButton>
          <Redo2 size={13} />
        </ToolButton>
      </Pill>
      <Pill className="bottom-3 left-3">
        <ToolButton>
          <Minus size={13} />
        </ToolButton>
        <span className="px-1.5 text-[10px] text-fg tabular-nums">100%</span>
        <ToolButton>
          <Plus size={13} />
        </ToolButton>
      </Pill>

      <div className="absolute inset-0" style={{ opacity: fade }}>
        <svg
          viewBox={`0 0 ${SCENE.width} ${SCENE.height}`}
          className="absolute inset-0 h-full w-full"
        >
          <path
            ref={underlineRef}
            d={UNDERLINE}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1 - underline}
            opacity={underline > 0 ? 1 : 0}
          />
          {steps.map(({ box, drawn, arrow }, i) => {
            const line = i < STEPS.length - 1 ? arrowBetween(i) : null;
            const end = line ? lerp(line.from, line.to, arrow) : null;
            return (
              <g key={i}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx={8}
                  pathLength={1}
                  fill={drawn === 1 ? "rgb(37 99 235 / 0.06)" : "none"}
                  stroke="#2563eb"
                  strokeWidth={3}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawn}
                  opacity={drawn > 0 ? 1 : 0}
                />
                {line && end && (
                  <>
                    <line
                      x1={line.from.x}
                      y1={line.from.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      opacity={arrow > 0 ? 1 : 0}
                    />
                    <path
                      d={`M${line.to.x} ${line.to.y} l-13 -8 v16 z`}
                      fill="currentColor"
                      opacity={arrow === 1 ? 1 : 0}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <p
          className="absolute text-[22px] leading-none font-semibold whitespace-nowrap text-fg"
          style={{ left: HEADING.x, top: HEADING.y }}
        >
          {typed(copy.heading, heading)}
          <span
            className="ml-0.5 inline-block h-[22px] w-0.5 translate-y-[3px] bg-fg"
            style={{ opacity: headingCaret ? 1 : 0 }}
          />
        </p>
        {steps.map(({ box, label }, i) => (
          <p
            key={i}
            className="absolute text-[15px] leading-none font-medium whitespace-nowrap text-[#2563eb]"
            style={{ left: box.x + 16, top: box.y + box.h / 2 - 7 }}
          >
            {typed(copy.steps[i] ?? "", label)}
          </p>
        ))}
      </div>

      <div
        className="absolute bottom-4 left-[130px] w-[290px]"
        style={{ opacity: fade }}
      >
        <p
          key={captionIndex}
          className="animate-reveal rounded-lg bg-fg/80 px-3 py-1.5 text-center text-[12px] leading-snug font-medium text-canvas"
        >
          {copy.captions[captionIndex]}
        </p>
      </div>

      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        className="absolute top-0 left-0 drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      >
        <path
          d="M1 1v15.5l4.2-3.6 3 6.8 2.6-1.2-3-6.6H13z"
          fill="#fff"
          stroke="#111"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute top-1/2 left-3 origin-left -translate-y-1/2 scale-[0.6]">
        <ControlBar time={timer} />
      </div>
      <div className="absolute right-4 bottom-4">
        <Presenter size={100} ring={3} live soft />
      </div>
    </div>
  );
}

function underlinePoint(
  ref: React.RefObject<SVGPathElement | null>,
  p: number,
): Point {
  const path = ref.current;
  if (!path) return UNDERLINE_END;
  const at = path.getPointAtLength(p * path.getTotalLength());
  return { x: at.x, y: at.y };
}

// Drawn at up to 1.2× its 600px design so it holds the wider column.
const CANVAS_MAX_SCALE = 1.2;

function RecordingMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref);
  const reducedMotion = useReducedMotion();
  const t = useLoopClock(onScreen && !reducedMotion);

  return (
    <Scaled
      width={SCENE.width}
      height={SCENE.height}
      maxScale={CANVAS_MAX_SCALE}
    >
      <div
        ref={ref}
        className="absolute inset-0 overflow-hidden rounded-2xl border border-black/5 shadow-[0_16px_40px_rgb(0_0_0/0.08),0_4px_12px_rgb(0_0_0/0.06)] dark:border-white/10 dark:shadow-[0_16px_40px_rgb(0_0_0/0.4),0_4px_12px_rgb(0_0_0/0.3)]"
      >
        <CanvasScene t={reducedMotion ? REST_T : t} />
      </div>
    </Scaled>
  );
}

// The bar's 36px control, square-cornered at 12px like the extension's.
function BarButton({
  children,
  color,
  background,
}: {
  children: ReactNode;
  color: string;
  background?: string;
}) {
  return (
    <span
      className="flex size-9 items-center justify-center rounded-xl"
      style={{ color, backgroundColor: background }}
    >
      {children}
    </span>
  );
}

function ControlBar({ time }: { time?: string }) {
  const copy = useMessages().modes.scene;
  return (
    <div
      className="flex flex-col items-center rounded-[20px] border px-2.5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
      style={{ backgroundColor: BAR.background, borderColor: BAR.border }}
    >
      <BarButton color="#fff" background={BAR.stop}>
        {STOP_ICON}
      </BarButton>
      <span
        className="flex h-9 items-center text-xs font-bold tabular-nums"
        style={{ color: BAR.fg }}
      >
        {time ?? copy.timer}
      </span>
      <BarButton color={BAR.icon}>{PAUSE_ICON}</BarButton>
    </div>
  );
}

// Measured: the panel renders 280×418 and the folded bar 58×126.
const RECORDER = { width: 400, height: 418 };

// The popup panel with what starts when you hit record: the camera bubble and
// the control bar.
function RecorderMockup() {
  return (
    <Scaled width={RECORDER.width} height={RECORDER.height}>
      {/* Depth from light, not rotation: a lit top edge and stacked shadows
          lift each layer off the card while the layout stays square. */}
      <div className="absolute top-0 left-0 rounded-[20px] shadow-[0_30px_60px_rgb(0_0_0/0.15),0_8px_20px_rgb(0_0_0/0.105)] dark:shadow-[0_30px_60px_rgb(0_0_0/0.5),0_8px_20px_rgb(0_0_0/0.35)]">
        <RecorderPanel />
        <span className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]" />
      </div>
      <div
        className="absolute top-0 rounded-[20px] shadow-[0_24px_48px_rgb(0_0_0/0.15),0_6px_14px_rgb(0_0_0/0.105)] dark:shadow-[0_24px_48px_rgb(0_0_0/0.5),0_6px_14px_rgb(0_0_0/0.35)]"
        style={{ left: 296 }}
      >
        <ControlBar />
      </div>
      <div
        className="absolute rounded-full shadow-[0_28px_56px_rgb(0_0_0/0.165)] dark:shadow-[0_28px_56px_rgb(0_0_0/0.55)]"
        style={{ left: 248, top: 250 }}
      >
        <Presenter size={150} ring={4} />
      </div>
    </Scaled>
  );
}

export function ModesIntro({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <MarketingSection
      id="modes"
      style={{ scrollMarginTop: 24, maxWidth: 1328 }}
    >
      <div className="px-5 py-12 text-fg md:px-10 md:py-16 lg:px-16 lg:py-20">
        <SectionHeading
          title={m.modes.heading}
          subtitle={m.modes.subtitle}
          level={headingLevel}
        />
        <div className="-mt-4 mb-14 flex justify-center">
          <InstallButton
            href={CHROME_WEBSTORE_URL ?? lh("/download")}
            label={m.hero.installChrome}
            icon={<ChromeLogoColor className="size-7" />}
            location="modes_chrome"
            primary
          />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="flex justify-center">
            <RecorderMockup />
          </div>
          <div className="flex justify-center">
            <RecordingMockup />
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
