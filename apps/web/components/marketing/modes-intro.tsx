"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { useMessages } from "./i18n-provider";
import { RecorderPanel } from "./recorder-panel";
import { WebcamLoop } from "./webcam-loop";

/*
 * Glyphs and colours copied from the extension's control bar
 * (apps/extension/entrypoints/control-bar.content/index.ts) so the mockup is
 * the bar people actually see while recording.
 */
const BAR = { background: "#16181d", button: "#2a2e36", fg: "#e8eaed" };

const STOP_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect x="6" y="6" width="12" height="12" rx="3" fill="#f0554f" />
  </svg>
);
const PAUSE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect x="7" y="5" width="3.5" height="14" rx="1.5" fill="currentColor" />
    <rect x="13.5" y="5" width="3.5" height="14" rx="1.5" fill="currentColor" />
  </svg>
);
const RESTART_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M12 5V2.5L7.5 6 12 9.5V7a5.5 5.5 0 1 1-5.5 5.5H4.5A7.5 7.5 0 1 0 12 5z"
      fill="currentColor"
    />
  </svg>
);
const DELETE_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2.5 6h11l-.8 11.1a2 2 0 0 1-2 1.9H9.3a2 2 0 0 1-2-1.9L6.5 9zm4 2.5v7h1.5v-7h-1.5zm3 0v7H15v-7h-1.5z"
      fill="currentColor"
    />
  </svg>
);

type Riser =
  | { kind: "emoji"; emoji: string; x: number }
  | { kind: "comment"; index: number; x: number };

const RISE_PERIOD = 6;

// Seconds from an item's start until it has faded in (10% of rise-fade).
const RISE_ENTER = RISE_PERIOD * 0.1;

/*
 * Six items share one 6s loop, one second apart, so the feed never empties.
 * Comments rise in the left lane and reactions in two lanes to their right,
 * and no two neighbours in the loop share a lane, so nothing overlaps.
 */
const RISERS: Riser[] = [
  { kind: "emoji", emoji: "🔥", x: 180 },
  { kind: "comment", index: 0, x: 0 },
  { kind: "emoji", emoji: "👏", x: 226 },
  { kind: "emoji", emoji: "❤️", x: 176 },
  { kind: "comment", index: 1, x: 12 },
  { kind: "emoji", emoji: "😂", x: 222 },
];

// One look for every timestamp. Solid rather than translucent, so a badge
// hanging off an emoji bubble matches one sitting inside a comment.
const TIMESTAMP_CHIP =
  "rounded-md bg-[#e6efff] px-1.5 py-0.5 font-mono text-[11px] leading-none text-[#2563eb] tabular-nums dark:bg-[#2a303e] dark:text-[#7aa7ff]";

const riseDelay = (i: number) => (i * RISE_PERIOD) / RISERS.length;

// Where each item's marker sits along the progress bar, 0–1.
const markerAt = (i: number) => (riseDelay(i) + RISE_ENTER / 2) / RISE_PERIOD;

// The video time under a marker, so the feed and the bar tell the same story.
function timestampAt(fraction: number, duration: string): string {
  const [m = 0, s = 0] = duration.split(":").map(Number);
  const at = Math.round(fraction * (m * 60 + s));
  return `${Math.floor(at / 60)}:${String(at % 60).padStart(2, "0")}`;
}

// Lays a pixel-authored mockup out at `width`×`height` and scales it to fit.
function Scaled({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative w-full"
      style={{ maxWidth: width, height: height * scale }}
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

function CheckoutField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-medium text-black/45">{label}</span>
      <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-[9px]">
        {children}
      </span>
    </div>
  );
}

const CAPTION_MS = 3000;

function Caption({ lines }: { lines: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % lines.length),
      CAPTION_MS,
    );
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-black/75 px-2 py-0.5 whitespace-nowrap text-[12px] leading-snug text-white">
      {lines[index]}
    </p>
  );
}

const PLAYER = { width: 740, height: 400 };
const TITLE_HEIGHT = 60;
const VIDEO = { width: 480, height: 270 };
const FEED = { left: VIDEO.width + 20, bottom: VIDEO.height + 20 };

function PlaybackMockup() {
  const copy = useMessages().modes.scene;
  const checkout = copy.checkout;
  const clockRef = useRef<HTMLDivElement>(null);

  // CSS animations start whenever their element gets them (hydration, a hot
  // reload), so pin every one in the mockup to the same start to keep the
  // playhead and the feed in step.
  useEffect(() => {
    const animations = clockRef.current?.getAnimations({ subtree: true });
    animations?.forEach((animation) => (animation.startTime = 0));
  }, []);

  return (
    <Scaled width={PLAYER.width} height={PLAYER.height}>
      <div ref={clockRef} className="contents">
        <div className="absolute top-0 left-0" style={{ width: VIDEO.width }}>
          <p className="truncate text-[18px] font-semibold text-fg">
            {copy.title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-fg-muted">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-semibold text-white">
              {copy.author[0]}
            </span>
            {copy.author} · {copy.age}
          </p>
        </div>
        <div
          className="absolute left-0 overflow-hidden rounded-2xl border border-black/5 shadow-[0_24px_60px_rgb(0_0_0/0.135)] dark:border-white/10 dark:shadow-[0_24px_60px_rgb(0_0_0/0.45)]"
          style={{
            top: TITLE_HEIGHT,
            width: VIDEO.width,
            height: VIDEO.height,
          }}
        >
          <div className="relative size-full overflow-hidden bg-[linear-gradient(135deg,#fdba74,#f9a8d4)]">
            <div className="absolute inset-x-8 top-5 bottom-0 flex flex-col overflow-hidden rounded-t-xl bg-[#f6f7fb] shadow-[0_20px_50px_rgb(0_0_0/0.105)] dark:shadow-[0_20px_50px_rgb(0_0_0/0.35)]">
              <div className="flex h-6 items-center gap-1.5 bg-[#e9ebf2] px-3">
                <span className="size-2 rounded-full bg-[#ff5f57]" />
                <span className="size-2 rounded-full bg-[#febc2e]" />
                <span className="size-2 rounded-full bg-[#28c840]" />
                <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[9px] text-black/45">
                  {checkout.address}
                </span>
              </div>
              <div className="flex flex-1 gap-4 py-4 pr-4 pl-7 text-[#201f1d]">
                <div className="flex flex-1 flex-col gap-2">
                  <p className="text-[14px] leading-none font-bold">
                    {checkout.heading}
                  </p>
                  <CheckoutField label={checkout.emailLabel}>
                    {checkout.email}
                  </CheckoutField>
                  <CheckoutField label={checkout.cardLabel}>
                    <span className="flex justify-between">
                      {checkout.card}
                      <span className="text-black/40">{checkout.expiry}</span>
                    </span>
                  </CheckoutField>
                  <span className="mt-1 rounded-md bg-[#2563eb] py-1.5 text-center text-[10px] font-semibold text-white">
                    {checkout.pay}
                  </span>
                </div>
                <div className="flex w-[140px] flex-col gap-1.5 self-start rounded-lg bg-white p-3 text-[9px] shadow-[0_2px_8px_rgb(15_23_42/0.08)]">
                  <p className="text-[10px] font-semibold">
                    {checkout.summary}
                  </p>
                  {checkout.items.map((item) => (
                    <p
                      key={item.name}
                      className="flex justify-between text-black/55"
                    >
                      {item.name}
                      <span>{item.price}</span>
                    </p>
                  ))}
                  <p className="flex justify-between border-t border-black/10 pt-1.5 font-semibold">
                    {checkout.totalLabel}
                    <span>{checkout.total}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-3 origin-left -translate-y-1/2 scale-[0.6]">
              <ControlBar />
            </div>
            <div className="absolute right-4 bottom-4">
              <Presenter size={76} ring={3} live />
            </div>
            <Caption lines={copy.captions} />
          </div>
        </div>

        <div
          className="absolute left-0 flex h-10 items-center gap-3"
          style={{ top: TITLE_HEIGHT + VIDEO.height + 24, width: VIDEO.width }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#18181b] dark:bg-white">
            <Pause className="size-3.5 fill-white text-white dark:fill-[#111] dark:text-[#111]" />
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-black/10 dark:bg-white/15">
            <div
              className="animate-playback-fill absolute inset-0 origin-left rounded-full bg-[#3b82f6]"
              style={{ animationDuration: `${RISE_PERIOD}s` }}
            />
            {RISERS.map((riser, i) => (
              <span
                key={i}
                className={`absolute bottom-full mb-2 flex size-4 -translate-x-1/2 items-center justify-center rounded-full ${
                  riser.kind === "emoji"
                    ? "text-[12px]"
                    : "bg-[#3b82f6] text-[8px] font-bold text-white"
                }`}
                style={{
                  left: `${markerAt(i) * 100}%`,
                }}
              >
                {riser.kind === "emoji"
                  ? riser.emoji
                  : copy.comments[riser.index].author[0]}
              </span>
            ))}
            <span
              className="animate-playback-head absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ animationDuration: `${RISE_PERIOD}s` }}
            />
          </div>
          <span className="font-mono text-[11px] text-fg-muted tabular-nums">
            {copy.duration}
          </span>
        </div>

        {RISERS.map((riser, i) => (
          <div
            key={i}
            className="animate-rise-fade absolute"
            style={
              {
                left: FEED.left + riser.x,
                top: FEED.bottom,
                animationDuration: `${RISE_PERIOD}s`,
                animationDelay: `${riseDelay(i)}s`,
                "--rest": `${-i * 40}px`,
              } as CSSProperties
            }
          >
            {riser.kind === "emoji" ? (
              <span className="relative flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-[20px] dark:border-white/10 dark:bg-[#2a2927] shadow-[0_10px_24px_rgb(0_0_0/0.105)] dark:shadow-[0_10px_24px_rgb(0_0_0/0.35)]">
                {riser.emoji}
                <span
                  className={cn(
                    "absolute -bottom-2.5 left-1/2 -translate-x-1/2",
                    TIMESTAMP_CHIP,
                  )}
                >
                  {timestampAt(markerAt(i), copy.duration)}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 rounded-full border border-black/5 bg-white py-1.5 pr-3 pl-1.5 text-[12px] whitespace-nowrap text-fg-muted dark:border-white/10 dark:bg-[#2a2927] shadow-[0_10px_24px_rgb(0_0_0/0.105)] dark:shadow-[0_10px_24px_rgb(0_0_0/0.35)]">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-semibold text-white">
                  {copy.comments[riser.index].author[0]}
                </span>
                <span className="font-semibold text-fg">
                  {copy.comments[riser.index].author}
                </span>
                <span className={TIMESTAMP_CHIP}>
                  {timestampAt(markerAt(i), copy.duration)}
                </span>
                {copy.comments[riser.index].text}
              </span>
            )}
          </div>
        ))}
      </div>
    </Scaled>
  );
}

function BarButton({
  children,
  filled,
}: {
  children: ReactNode;
  filled?: boolean;
}) {
  return (
    <span
      className="flex size-[38px] items-center justify-center rounded-full"
      style={{ backgroundColor: filled ? BAR.button : undefined }}
    >
      {children}
    </span>
  );
}

function ControlBar() {
  const copy = useMessages().modes.scene;
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
      style={{ backgroundColor: BAR.background, color: BAR.fg }}
    >
      <BarButton filled>{STOP_ICON}</BarButton>
      <span className="pt-0.5 pb-1 text-xs tabular-nums">{copy.timer}</span>
      <BarButton>{PAUSE_ICON}</BarButton>
      <BarButton>{RESTART_ICON}</BarButton>
      <BarButton>{DELETE_ICON}</BarButton>
    </div>
  );
}

// Measured: the panel renders 280×342 and the bar 54×210.
const RECORDER = { width: 400, height: 390 };

// The popup panel with what starts when you hit record: the camera bubble and
// the control bar.
function RecorderMockup() {
  return (
    <Scaled width={RECORDER.width} height={RECORDER.height}>
      {/* Depth from light, not rotation: a lit top edge and stacked shadows
          lift each layer off the card while the layout stays square. */}
      <div className="absolute top-0 left-0 rounded-2xl shadow-[0_30px_60px_rgb(0_0_0/0.15),0_8px_20px_rgb(0_0_0/0.105)] dark:shadow-[0_30px_60px_rgb(0_0_0/0.5),0_8px_20px_rgb(0_0_0/0.35)]">
        <RecorderPanel />
        <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]" />
      </div>
      <div
        className="absolute top-0 rounded-2xl shadow-[0_24px_48px_rgb(0_0_0/0.15),0_6px_14px_rgb(0_0_0/0.105)] dark:shadow-[0_24px_48px_rgb(0_0_0/0.5),0_6px_14px_rgb(0_0_0/0.35)]"
        style={{ left: 296 }}
      >
        <ControlBar />
      </div>
      <div
        className="absolute rounded-full shadow-[0_28px_56px_rgb(0_0_0/0.165)] dark:shadow-[0_28px_56px_rgb(0_0_0/0.55)]"
        style={{ left: 248, top: 232 }}
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
            <PlaybackMockup />
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
