"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "./ui";
import { TOKENS } from "./tokens";
import { motion, AnimatePresence } from "motion/react";
import {
  AppWindow,
  Camera,
  Droplets,
  House,
  Mic,
  Monitor,
  MoreHorizontal,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";

// Keep this mode set in sync with the extension popup's Tabs (video + screenshot).
const MODES = [
  { key: "share", icon: Video },
  { key: "screenshot", icon: Camera },
] as const;

// The panel is authored at the extension popup's real width and scaled as one
// block, so the mockup keeps the proportions a user actually sees.
const PANEL_WIDTH = 308;
const MAX_SCALE = 1.45;

const ROW = "flex items-center gap-2.5 rounded-xl px-2.5 py-2";

function IconGlyph({ icon: Glyph }: { icon: typeof Camera }) {
  return <Glyph className="h-4 w-4 shrink-0" strokeWidth={1.8} />;
}

function StatePill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
        on ? "border-[#22c55e] text-[#22c55e]" : "border-white/20 text-white/45"
      }`}
    >
      {label}
    </span>
  );
}

function DeviceRow({
  icon,
  label,
  on,
  onLabel,
  meter,
}: {
  icon: typeof Camera;
  label: string;
  on: boolean;
  onLabel: string;
  meter?: boolean;
}) {
  return (
    <div
      className={`${ROW} relative overflow-hidden bg-white/[0.06] text-white ${
        on ? "outline outline-white/15" : ""
      }`}
    >
      <IconGlyph icon={icon} />
      <span className="flex-1 truncate text-[13px] font-medium">{label}</span>
      <StatePill on={on} label={onLabel} />
      {meter && (
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-[#22c55e]/70"
          style={{ width: "42%" }}
          aria-hidden
        />
      )}
    </div>
  );
}

function ToolButton({
  icon: Glyph,
  label,
}: {
  icon: typeof Camera;
  label: string;
}) {
  return (
    <span className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-white/55">
      <Glyph className="h-4 w-4" strokeWidth={1.8} />
      {label}
    </span>
  );
}

export function ModesIntro() {
  const m = useMessages();
  const token = TOKENS;
  const copy = m.modes.panel;

  // `target` is where the cursor is heading; `active` is the committed mode. They
  // diverge briefly so the click reads as the cause of the swap.
  const [target, setTarget] = useState(0);
  const [active, setActive] = useState(0);
  const [clicking, setClicking] = useState(false);

  // Read from `offsetLeft`/`offsetTop` (transform-independent) so the wrapper's
  // fit scale doesn't corrupt the cursor's target coordinates. Nothing between a
  // tab and the panel is positioned, so the panel is their offsetParent.
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modeBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [centers, setCenters] = useState<Array<{ x: number; y: number }>>([]);
  const [panelSize, setPanelSize] = useState({ w: 0, h: 0 });
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const measure = () => {
      const panel = panelRef.current;
      const container = containerRef.current;
      if (!panel || !container) return;
      setCenters(
        modeBtnRefs.current.map((b) =>
          b
            ? {
                x: b.offsetLeft + b.offsetWidth / 2,
                y: b.offsetTop + b.offsetHeight / 2,
              }
            : { x: 0, y: 0 },
        ),
      );
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      setPanelSize({ w, h });
      setFit(
        w > 0 ? Math.min(MAX_SCALE, (container.clientWidth * 0.92) / w) : 1,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (panelRef.current) ro.observe(panelRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    const cycle = (next: number) => {
      setTarget(next);
      // Wait for the cursor's spring move to settle before the click pulse.
      at(900, () => {
        setClicking(true);
        at(180, () => {
          setActive(next);
          at(200, () => setClicking(false));
          at(1400, () => cycle((next + 1) % MODES.length));
        });
      });
    };

    const start = setTimeout(() => cycle(1), 1100);
    timers.push(start);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const isShare = MODES[active].key === "share";
  const cursor = centers[target] ?? { x: 0, y: 0 };
  const captionX = centers[active]?.x ?? 0;
  const measured = centers.length === MODES.length;

  return (
    <MarketingSection id="modes" style={{ scrollMarginTop: 24 }}>
      <SectionHeading
        eyebrow={m.modes.eyebrow}
        title={m.modes.headingLine1}
        titleMuted={m.modes.headingLine2}
        subtitle={
          <>
            {m.modes.subtitleLine1}{" "}
            {/* Forced break desktop-only; on phones it would orphan words. */}
            <br className="hidden sm:inline" />
            {m.modes.subtitleLine2}
          </>
        }
      />

      <Card
        styles={{
          body: {
            paddingBlock: "clamp(56px, 9vw, 96px)",
            paddingInline: 24,
          },
        }}
        style={{
          background: token.colorFillTertiary,
          borderColor: token.colorBorderSecondary,
        }}
      >
        <div ref={containerRef} className="flex justify-center">
          <div
            className="relative transition-[width,height] duration-300 motion-reduce:transition-none"
            style={{
              width: panelSize.w ? panelSize.w * fit : undefined,
              height: panelSize.h ? panelSize.h * fit : undefined,
            }}
          >
            {/* Content-sized so the panel lays out at its natural width, then
                scales as one block. `dir=ltr` keeps cluster order under RTL. */}
            <div
              className="absolute top-0 left-0 origin-top-left"
              dir="ltr"
              style={{ transform: `scale(${fit})` }}
            >
              <div
                className="pointer-events-none absolute bottom-full left-0 mb-3 whitespace-nowrap"
                style={{
                  transform: `translateX(${captionX}px) translateX(-50%)`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={MODES[active].key}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="rounded-lg bg-[#171717] px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                  >
                    {m.modes.tabs[MODES[active].key].caption}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div
                ref={panelRef}
                className="relative flex flex-col gap-2.5 rounded-2xl bg-[#0f0f0f] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                style={{ width: PANEL_WIDTH }}
              >
                <header className="flex items-center justify-between gap-2 text-white">
                  <span className="flex h-7 w-7 items-center justify-center text-white/55">
                    <IconGlyph icon={House} />
                  </span>

                  <div className="flex items-center gap-1 rounded-[10px] bg-white/[0.06] p-1">
                    {MODES.map((mode, i) => {
                      const Glyph = mode.icon;
                      const isActive = i === active;
                      return (
                        <button
                          key={mode.key}
                          ref={(el) => {
                            modeBtnRefs.current[i] = el;
                          }}
                          type="button"
                          aria-label={m.modes.tabs[mode.key].label}
                          aria-pressed={isActive}
                          className={`flex h-7 w-9 items-center justify-center rounded-lg transition-colors motion-reduce:transition-none ${
                            isActive
                              ? "bg-white text-[#171717]"
                              : "text-white/55"
                          }`}
                        >
                          <Glyph className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      );
                    })}
                  </div>

                  <span className="flex h-7 w-7 items-center justify-center text-white/55">
                    <IconGlyph icon={X} />
                  </span>
                </header>

                {/* Both bodies share one grid cell, so the panel is always as
                    tall as the taller of the two and switching modes doesn't
                    resize it mid-animation. */}
                <div className="grid">
                  <div
                    className={`col-start-1 row-start-1 flex flex-col gap-2 ${
                      isShare ? "" : "invisible"
                    }`}
                    aria-hidden={!isShare}
                  >
                    {/* The source is the panel's headline choice, so the row
                        carries the accent the device rows don't. */}
                    <div
                      className={`${ROW} bg-[#2563eb]/20 text-[#93b4fd]`}
                      aria-label={copy.sourceAria}
                    >
                      <IconGlyph icon={Monitor} />
                      <span className="flex-1 truncate text-[13px] font-semibold">
                        {copy.source}
                      </span>
                      <span className="text-[11px] opacity-70">
                        {copy.sourceHint}
                      </span>
                    </div>

                    <DeviceRow
                      icon={Camera}
                      label={copy.camera}
                      on={false}
                      onLabel={copy.off}
                    />
                    <DeviceRow
                      icon={Mic}
                      label={copy.microphone}
                      on
                      onLabel={copy.on}
                      meter
                    />

                    <span className="flex h-10 items-center justify-center rounded-xl bg-[#e8563a] text-sm font-semibold text-white">
                      {copy.startRecording}
                    </span>
                    <span className="text-center text-[11px] text-white/45">
                      {copy.limit}
                    </span>
                  </div>

                  <div
                    className={`col-start-1 row-start-1 flex flex-col gap-2 ${
                      isShare ? "invisible" : ""
                    }`}
                    aria-hidden={isShare}
                  >
                    <div className={`${ROW} bg-white/[0.06] text-white`}>
                      <IconGlyph icon={AppWindow} />
                      <span className="flex-1 truncate text-[13px] font-medium">
                        {copy.currentTab}
                      </span>
                    </div>

                    <span className="flex h-10 items-center justify-center rounded-xl bg-[#2563eb] text-sm font-semibold text-white">
                      {copy.captureScreenshot}
                    </span>
                  </div>
                </div>

                <footer className="grid grid-cols-3 items-start gap-1">
                  <ToolButton icon={Sparkles} label={copy.effects} />
                  <ToolButton icon={Droplets} label={copy.blur} />
                  <ToolButton icon={MoreHorizontal} label={copy.more} />
                </footer>
              </div>

              {measured && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute z-20 -mt-[33px] -ml-[47px]"
                  animate={{ left: cursor.x, top: cursor.y }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 18,
                    mass: 0.7,
                  }}
                >
                  <motion.svg
                    width={150}
                    height={150}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={clicking ? { scale: [1, 0.7, 1] } : { scale: 1 }}
                    transition={
                      clicking
                        ? {
                            duration: 0.3,
                            times: [0, 0.5, 1],
                            ease: "easeInOut",
                          }
                        : { duration: 0 }
                    }
                    className="text-black drop-shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                  >
                    <g fillRule="evenodd" transform="translate(10 7)">
                      <path
                        d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
                        fill="#fff"
                      />
                      <path
                        d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
                        fill="currentColor"
                      />
                    </g>
                  </motion.svg>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </MarketingSection>
  );
}
