"use client";

import { useEffect, useRef, useState } from "react";
import { Card, theme } from "antd";
import { motion, AnimatePresence } from "motion/react";
import {
  AppWindow,
  Camera,
  ChevronDown,
  Link2,
  Mic,
  Monitor,
  Scan,
  Volume2,
  X,
} from "lucide-react";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";

// Keep this mode set in sync with the app's RecordingModeToggle (Share + Screenshot only).
const MODES = [
  { key: "share", icon: Link2 },
  { key: "screenshot", icon: Camera },
] as const;

const SOURCES = [Monitor, AppWindow, Scan];

function Divider() {
  return (
    <div className="flex items-center self-stretch px-1.5" aria-hidden>
      <div className="my-2 w-px self-stretch bg-white/15" />
    </div>
  );
}

function GripDots() {
  return (
    <div
      className="grid grid-cols-2 gap-x-[5px] gap-y-[3px] self-center"
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/40" />
      ))}
    </div>
  );
}

function DeviceCell({ icon: Glyph }: { icon: typeof Camera }) {
  return (
    <div className="relative flex h-8 items-center gap-0.5 rounded-lg px-1.5">
      <Glyph className="h-[18px] w-[18px] text-white" strokeWidth={2} />
      <ChevronDown className="h-3 w-3 shrink-0 text-white/55" strokeWidth={2} />
    </div>
  );
}

export function ModesIntro() {
  const m = useMessages();
  const { token } = theme.useToken();

  // `target` is where the cursor is heading; `active` is the committed mode. They
  // diverge briefly so the click reads as the cause of the swap.
  const [target, setTarget] = useState(0);
  const [active, setActive] = useState(0);
  const [clicking, setClicking] = useState(false);

  // Read from `offsetLeft`/`offsetWidth` (transform-independent) so the wrapper's
  // fit scale doesn't corrupt the cursor's target coordinates.
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const modeBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [centers, setCenters] = useState<number[]>([]);
  const [barSize, setBarSize] = useState({ w: 0, h: 0 });
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const measure = () => {
      const bar = barRef.current;
      const container = containerRef.current;
      if (!bar || !container) return;
      setCenters(
        modeBtnRefs.current.map((b) =>
          b ? b.offsetLeft + b.offsetWidth / 2 : 0,
        ),
      );
      const w = bar.offsetWidth;
      const h = bar.offsetHeight;
      setBarSize({ w, h });
      setFit(w > 0 ? Math.min(1, (container.clientWidth * 0.9) / w) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
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

  const showDevices = MODES[active].key !== "screenshot";
  const cursorX = centers[target] ?? 0;
  const captionX = centers[active] ?? 0;
  const measured = centers.length === MODES.length;

  return (
    <MarketingSection id="modes" style={{ scrollMarginTop: 24 }}>
      <SectionHeading
        title={
          <>
            {m.modes.headingLine1}
            <br />
            {m.modes.headingLine2}
          </>
        }
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
            className="relative"
            style={{
              width: barSize.w ? barSize.w * fit : undefined,
              height: barSize.h ? barSize.h * fit : undefined,
            }}
          >
            {/* Content-sized so the bar lays out at natural width, then scales
                down as one block. `dir=ltr` keeps cluster order under RTL locales. */}
            <div
              className="absolute left-0 top-0 origin-top-left"
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
                ref={barRef}
                className="relative flex h-[50px] items-center gap-1.5 rounded-2xl bg-[#404040] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
              >
                <div className="ml-0.5 flex items-center self-center rounded-md">
                  <div className="flex items-center justify-center p-1">
                    <X
                      className="h-[18px] w-[18px] text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-[10px] bg-black/20 p-1">
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
                        className={`flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? "bg-white text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                            : "text-white/55"
                        }`}
                      >
                        <Glyph className="h-[18px] w-[18px]" strokeWidth={2} />
                      </button>
                    );
                  })}
                </div>

                <Divider />

                <div className="flex items-center gap-1 rounded-[10px] bg-black/20 p-1">
                  {SOURCES.map((Glyph, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-9 items-center justify-center rounded-lg ${
                        i === 0 ? "bg-white/10 text-white" : "text-white/45"
                      }`}
                    >
                      <Glyph className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="relative flex items-center">
                  <div
                    className={`flex items-center gap-1 ${
                      showDevices ? "" : "invisible"
                    }`}
                  >
                    <DeviceCell icon={Camera} />
                    <DeviceCell icon={Mic} />
                    <DeviceCell icon={Volume2} />
                  </div>
                  {!showDevices && (
                    <span className="absolute inset-0 flex items-center justify-center select-none">
                      <span className="truncate px-1.5 text-[13px] font-normal text-white/45">
                        {m.modes.tabs.screenshot.label}
                      </span>
                    </span>
                  )}
                </div>

                <Divider />

                <div className="flex items-center pr-2.5">
                  <GripDots />
                </div>
              </div>

              {measured && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 z-20 -mt-[20px] -ml-[40px]"
                  animate={{ left: cursorX }}
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
