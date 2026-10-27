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
import { useMessages } from "./i18n-provider";
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
}: {
  size: number;
  ring: number;
  live?: boolean;
}) {
  return (
    <span
      className="block overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 ${ring}px #fff, 0 18px 40px rgb(0 0 0 / 0.45)`,
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
 * The recording scene: our /canvas being recorded, with a title typed, a
 * line drawn under it, a box and an arrow drawn, and a note typed into the
 * box, over one ten-second loop. One clock drives every part, so the cursor,
 * the strokes, the typing and the active tool can never drift apart. Reduced
 * motion holds the finished frame.
 */
const LOOP_S = 10;
const REST_T = 0.93;
const FRAME_MS = 1000 / 30;

type Point = { x: number; y: number };
type Tool = "pen" | "rect" | "arrow" | "text";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: Point, b: Point, p: number): Point => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
});
// 0 before `from` seconds into the loop, 1 after `to`, linear between.
const phase = (t: number, from: number, to: number) =>
  clamp01((t * LOOP_S - from) / (to - from));

const SCENE = { width: 600, height: 338 };
const HEADING = { x: 72, y: 104 };
const UNDERLINE =
  "M74 146 C 95 134, 110 158, 132 146 S 170 134, 192 146 S 230 158, 252 146";
const UNDERLINE_END: Point = { x: 252, y: 146 };
const BOX = { x: 340, y: 168, w: 150, h: 86 };
const NOTE = { x: BOX.x + 18, y: BOX.y + 30 };
const ARROW = { from: { x: 216, y: 211 }, to: { x: 326, y: 211 } };
const IDLE: Point = { x: 64, y: 136 };
const PARKED: Point = { x: 360, y: 226 };

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
function boxPoint(p: number): Point {
  const { x, y, w, h } = BOX;
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
function useLoopClock(running: boolean): number {
  const [t, setT] = useState(REST_T);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (now - last >= FRAME_MS) {
        last = now;
        setT(((now - start) % (LOOP_S * 1000)) / (LOOP_S * 1000));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  return t;
}

function useOnScreen(ref: React.RefObject<HTMLElement | null>): boolean {
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

function useReducedMotion(): boolean {
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

  const heading = phase(t, 0.6, 2.6);
  const underline = phase(t, 3.4, 4.4);
  const box = phase(t, 4.9, 5.9);
  const arrow = phase(t, 6.4, 7.1);
  const note = phase(t, 7.5, 8.9);
  const fade = 1 - phase(t, 9.5, 10);
  const s = t * LOOP_S;

  const tool: Tool =
    s < 3
      ? "text"
      : s < 4.4
        ? "pen"
        : s < 5.9
          ? "rect"
          : s < 7.1
            ? "arrow"
            : "text";

  const underlinePoint = (p: number): Point => {
    const path = underlineRef.current;
    if (!path) return UNDERLINE_END;
    const at = path.getPointAtLength(p * path.getTotalLength());
    return { x: at.x, y: at.y };
  };
  const boxStart = boxPoint(0);
  const cursor: Point =
    s < 3
      ? IDLE
      : s < 3.4
        ? lerp(IDLE, underlinePoint(0), phase(t, 3, 3.4))
        : s < 4.4
          ? underlinePoint(underline)
          : s < 4.9
            ? lerp(UNDERLINE_END, boxStart, phase(t, 4.4, 4.9))
            : s < 5.9
              ? boxPoint(box)
              : s < 6.4
                ? lerp(boxStart, ARROW.from, phase(t, 5.9, 6.4))
                : s < 7.1
                  ? lerp(ARROW.from, ARROW.to, arrow)
                  : s < 7.5
                    ? lerp(ARROW.to, PARKED, phase(t, 7.1, 7.5))
                    : PARKED;

  const caretOn = Math.floor(s * 2) % 2 === 0;
  const headingCaret = s >= 0.6 && s < 3 && caretOn;
  const noteCaret = s >= 7.5 && s < 9.3 && caretOn;
  const timer = `0:${String(42 + Math.floor(s)).padStart(2, "0")}`;
  const arrowEnd = lerp(ARROW.from, ARROW.to, arrow);

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
          <rect
            x={BOX.x}
            y={BOX.y}
            width={BOX.w}
            height={BOX.h}
            rx={8}
            pathLength={1}
            fill={box === 1 ? "rgb(37 99 235 / 0.06)" : "none"}
            stroke="#2563eb"
            strokeWidth={3}
            strokeDasharray={1}
            strokeDashoffset={1 - box}
            opacity={box > 0 ? 1 : 0}
          />
          <line
            x1={ARROW.from.x}
            y1={ARROW.from.y}
            x2={arrowEnd.x}
            y2={arrowEnd.y}
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={arrow > 0 ? 1 : 0}
          />
          <path
            d={`M${ARROW.to.x} ${ARROW.to.y} l-13 -8 v16 z`}
            fill="currentColor"
            opacity={arrow === 1 ? 1 : 0}
          />
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
        <p
          className="absolute text-[15px] leading-none font-medium whitespace-nowrap text-[#2563eb]"
          style={{ left: NOTE.x, top: NOTE.y }}
        >
          {typed(copy.note, note)}
          <span
            className="ml-0.5 inline-block h-[15px] w-0.5 translate-y-[2px] bg-[#2563eb]"
            style={{ opacity: noteCaret ? 1 : 0 }}
          />
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
        <Presenter size={76} ring={3} live />
      </div>
    </div>
  );
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
        className="absolute inset-0 overflow-hidden rounded-2xl border border-black/5 shadow-[0_30px_60px_rgb(0_0_0/0.15),0_8px_20px_rgb(0_0_0/0.105)] dark:border-white/10 dark:shadow-[0_30px_60px_rgb(0_0_0/0.5),0_8px_20px_rgb(0_0_0/0.35)]"
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
