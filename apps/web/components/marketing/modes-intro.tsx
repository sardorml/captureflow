"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Play } from "lucide-react";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { useMessages } from "./i18n-provider";
import { RecorderPanel } from "./recorder-panel";

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

const riseDelay = (i: number) => (i * RISE_PERIOD) / RISERS.length;

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

function Presenter({ size, ring }: { size: number; ring: number }) {
  return (
    <span
      className="block overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 ${ring}px #fff, 0 18px 40px rgb(0 0 0 / 0.45)`,
      }}
    >
      <img
        src="/avatar-presenter.webp"
        alt=""
        className="size-full object-cover"
      />
    </span>
  );
}

const PLAYER = { width: 740, height: 400 };
const TITLE_HEIGHT = 60;
const VIDEO = { width: 480, height: 270 };
const FEED = { left: VIDEO.width + 20, bottom: VIDEO.height + 20 };

function PlaybackMockup() {
  const copy = useMessages().modes.scene;
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
          <p className="truncate text-[18px] font-semibold text-white">
            {copy.title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/55">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-semibold text-white">
              {copy.author[0]}
            </span>
            {copy.author} · {copy.age}
          </p>
        </div>
        <div
          className="absolute left-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgb(0_0_0/0.45)]"
          style={{
            top: TITLE_HEIGHT,
            width: VIDEO.width,
            height: VIDEO.height,
          }}
        >
          <div className="relative size-full overflow-hidden bg-[linear-gradient(135deg,#2563eb,#7c3aed)]">
            <div className="absolute inset-x-8 top-5 bottom-0 flex flex-col overflow-hidden rounded-t-xl bg-[#f6f7fb] shadow-[0_20px_50px_rgb(0_0_0/0.35)]">
              <div className="flex h-6 items-center gap-1.5 bg-[#e9ebf2] px-3">
                <span className="size-2 rounded-full bg-[#ff5f57]" />
                <span className="size-2 rounded-full bg-[#febc2e]" />
                <span className="size-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex flex-1 gap-4 p-4">
                <div className="flex w-16 flex-col gap-2">
                  <span className="h-2 w-[70%] rounded-full bg-black/10" />
                  <span className="h-2 w-1/2 rounded-full bg-black/[0.07]" />
                  <span className="h-2 w-[60%] rounded-full bg-black/[0.07]" />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <span className="h-2.5 w-1/3 rounded-full bg-black/10" />
                  <div className="grid flex-1 grid-cols-3 gap-3">
                    <span className="rounded-lg bg-[#6b9bff]/25" />
                    <span className="rounded-lg bg-[#6b9bff]/40" />
                    <span className="rounded-lg bg-[#6b9bff]/55" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4">
              <Presenter size={76} ring={3} />
            </div>
          </div>
        </div>

        <div
          className="absolute left-0 flex h-10 items-center gap-3"
          style={{ top: TITLE_HEIGHT + VIDEO.height + 24, width: VIDEO.width }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
            <Play className="size-3.5 translate-x-px fill-[#111] text-[#111]" />
          </span>
          <div className="relative h-1.5 flex-1 rounded-full bg-white/15">
            <div
              className="animate-playback-fill absolute inset-0 origin-left rounded-full bg-[#3b82f6]"
              style={{ animationDuration: `${RISE_PERIOD}s` }}
            />
            {RISERS.map((riser, i) => (
              <span
                key={i}
                className={`absolute bottom-full mb-2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full ${
                  riser.kind === "emoji"
                    ? "bg-[#27221d] text-[10px]"
                    : "bg-[#3b82f6] text-[9px] font-bold text-white"
                }`}
                style={{
                  left: `${((riseDelay(i) + RISE_ENTER / 2) / RISE_PERIOD) * 100}%`,
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
          <span className="font-mono text-[11px] text-white/60 tabular-nums">
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
              <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#27221d] text-[20px] shadow-[0_10px_24px_rgb(0_0_0/0.35)]">
                {riser.emoji}
              </span>
            ) : (
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-[#27221d] py-1.5 pr-3 pl-1.5 text-[12px] whitespace-nowrap text-white/70 shadow-[0_10px_24px_rgb(0_0_0/0.35)]">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-semibold text-white">
                  {copy.comments[riser.index].author[0]}
                </span>
                <span className="font-semibold text-white">
                  {copy.comments[riser.index].author}
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

// Measured: the panel renders 280×342 and the bar 54×210.
const RECORDER = { width: 400, height: 390 };

// The popup panel with what starts when you hit record: the camera bubble and
// the control bar.
function RecorderMockup() {
  const copy = useMessages().modes.scene;
  return (
    <Scaled width={RECORDER.width} height={RECORDER.height}>
      <div className="absolute top-0 left-0">
        <RecorderPanel />
      </div>
      <div
        className="absolute top-0 flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
        style={{ left: 296, backgroundColor: BAR.background, color: BAR.fg }}
      >
        <BarButton filled>{STOP_ICON}</BarButton>
        <span className="pt-0.5 pb-1 text-xs tabular-nums">{copy.timer}</span>
        <BarButton>{PAUSE_ICON}</BarButton>
        <BarButton>{RESTART_ICON}</BarButton>
        <BarButton>{DELETE_ICON}</BarButton>
      </div>
      <div className="absolute" style={{ left: 248, top: 232 }}>
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
      style={{ scrollMarginTop: 24, maxWidth: 1156 }}
    >
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
    </MarketingSection>
  );
}
