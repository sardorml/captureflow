'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
} from 'lucide-react';
import { useMessages } from './i18n-provider';

// A pixel-faithful, static replica of the desktop app's recording toolbar
// (CaptureFlow's RecordingToolbar / RecordingModeToggle): a dark rounded bar
// with the close button, the capture-mode segment (Share / Snap), the source
// segment (Display / Window / Area), the device cells (camera / mic /
// system-audio) and the drag grip — laid out and styled 1:1 with the real bar.
// Keep the chrome (neutral-700 bar, black/20 inner segments, w-9×h-8 buttons,
// lucide icons @18px) — and the mode set (Share = Link2, Snap = Camera) — in
// sync with the app's RecordingModeToggle. There is no Record/Studio mode: the
// app's toggle is Share + Screenshot only.
//
// The marketing flourish: the app's own cursor floats across the two capture
// modes on a loop, "clicking" each one so the active mode (solid-white button)
// swaps, with a caption that explains what each mode does. Snap mode drops the
// device cells (showing a centred "Snap" hint), exactly as the real bar
// reflows.
const MODES = [
  { key: 'share', icon: Link2 },
  { key: 'screenshot', icon: Camera },
] as const;

// Source segment — mirrors the app's Display / Window / Area picker. Static
// (Display selected); it's part of the real bar so the copy includes it.
const SOURCES = [Monitor, AppWindow, Scan];

// Hairline divider between clusters — matches the app's `Divider`.
function Divider() {
  return (
    <div className="flex items-center self-stretch px-1.5" aria-hidden>
      <div className="my-2 w-px self-stretch bg-white/15" />
    </div>
  );
}

// 2×3 grip-dot pattern — the app's right-edge drag handle.
function GripDots() {
  return (
    <div className="grid grid-cols-2 gap-[3.5px] self-center" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/40" />
      ))}
    </div>
  );
}

// Device cell — icon + caret, matching the app's `DeviceCell` (active = white).
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

  // `target` is where the cursor is heading; `active` is the mode the bar has
  // committed to. They diverge during the brief "cursor arrives → clicks →
  // mode swaps" window so the click reads as the cause of the swap.
  const [target, setTarget] = useState(0);
  const [active, setActive] = useState(0);
  const [clicking, setClicking] = useState(false);

  // Measure each mode button's centre (in bar-local px) so the cursor + caption
  // sit exactly over the real button, plus the bar's natural size + the
  // available width so the whole mockup can scale down to fit narrow screens
  // (the full desktop bar is wider than a phone). Geometry is read from
  // `offsetLeft`/`offsetWidth` — transform-independent — so the fit scale on the
  // wrapper doesn't corrupt the cursor's target coordinates.
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
      // Scale to ~90% of the available width when shrinking, so the bar keeps a
      // margin from the edges rather than filling them exactly.
      setFit(w > 0 ? Math.min(1, (container.clientWidth * 0.9) / w) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
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

  // Snap is a still — the real bar hides the camera/mic/sound cells (they
  // stay `invisible` to reserve width, with a centred hint overlaid).
  const showDevices = MODES[active].key !== 'screenshot';
  const cursorX = centers[target] ?? 0;
  const captionX = centers[active] ?? 0;
  const measured = centers.length === MODES.length;

  return (
    <section
      id="modes"
      className="relative scroll-mt-6 pt-20 pb-20 sm:pt-28 sm:pb-28"
    >
      <div className="mx-auto max-w-7xl px-10">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
            {m.modes.headingLine1}
            <br />
            {m.modes.headingLine2}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
            {m.modes.subtitleLine1}
            <br />
            {m.modes.subtitleLine2}
          </p>
        </div>

        <div ref={containerRef} className="mt-20 flex justify-center sm:mt-24">
          {/* Fit wrapper — reserves the scaled footprint so the bar never
              overflows narrow screens; the inner block is the natural-size bar
              scaled to fit. */}
          <div
            className="relative"
            style={{
              width: barSize.w ? barSize.w * fit : undefined,
              height: barSize.h ? barSize.h * fit : undefined,
            }}
          >
            {/* Absolute + content-sized so the bar lays out at its natural
                (desktop) width — unconstrained by the narrower fit wrapper — and
                is then scaled down as one block. `dir=ltr` so it keeps the app's
                left-to-right cluster order even under RTL locales. */}
            <div
              className="absolute left-0 top-0 origin-top-left"
              dir="ltr"
              style={{ transform: `scale(${fit})` }}
            >
              {/* Caption above the targeted mode — swaps with the active mode,
                aligned over its button (mirrors the app's mode tooltip). */}
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
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                  >
                    {m.modes.tabs[MODES[active].key].caption}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── The bar — 1:1 with the app's RecordingToolbar ───────────── */}
              <div
                ref={barRef}
                className="relative flex h-[50px] items-center gap-1.5 rounded-2xl bg-neutral-700 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
              >
                {/* Close — borderless X */}
                <div className="ml-0.5 flex items-center self-center rounded-md">
                  <div className="flex items-center justify-center p-1">
                    <X
                      className="h-[18px] w-[18px] text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Capture mode: Share · Snap */}
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
                            ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                            : 'text-white/55'
                        }`}
                      >
                        <Glyph className="h-[18px] w-[18px]" strokeWidth={2} />
                      </button>
                    );
                  })}
                </div>

                <Divider />

                {/* Source: Display · Window · Area (Display selected) */}
                <div className="flex items-center gap-1 rounded-[10px] bg-black/20 p-1">
                  {SOURCES.map((Glyph, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-9 items-center justify-center rounded-lg ${
                        i === 0 ? 'bg-white/10 text-white' : 'text-white/45'
                      }`}
                    >
                      <Glyph className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                  ))}
                </div>

                <Divider />

                {/* Devices: camera ▾  mic ▾  system-audio ▾. Hidden (but width-
                  reserved) in Snap mode, with a centred hint. */}
                <div className="relative flex items-center">
                  <div
                    className={`flex items-center gap-1 ${
                      showDevices ? '' : 'invisible'
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

                {/* Drag grip at the right edge */}
                <div className="flex items-center pr-2.5">
                  <GripDots />
                </div>
              </div>

              {/* Cursor — the app's own pointer, springing to the targeted mode
                button's centre and click-bouncing when it "presses". */}
              {measured && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 z-20 -mt-[50px] -ml-[70px]"
                  animate={{ left: cursorX }}
                  transition={{
                    type: 'spring',
                    stiffness: 90,
                    damping: 18,
                    mass: 0.7,
                  }}
                >
                  {/* Press-bounce: dip to 0.7 and back over 300ms with the same
                    parabolic curve the editor renders for real cursor clicks. */}
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
                            ease: 'easeInOut',
                          }
                        : { duration: 0 }
                    }
                    className="text-black drop-shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.501 13.8601L24.884 22.2611C25.937 23.3171 25.19 25.1191 23.699 25.1191L22.475 25.119L23.6908 28.0067C23.9038 28.5127 23.9068 29.0727 23.6998 29.5817C23.4918 30.0917 23.0978 30.4897 22.5898 30.7027C22.3338 30.8097 22.0658 30.8637 21.7918 30.8637C20.9608 30.8637 20.2158 30.3687 19.8938 29.6027L18.616 26.565L17.784 27.3031C16.703 28.2591 15 27.4921 15 26.0481V14.4811C15 13.6971 15.947 13.3051 16.501 13.8601Z"
                      fill="white"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.9995 15.1292C15.9995 14.9982 16.1585 14.9322 16.2505 15.0252L24.1585 22.9502C24.5895 23.3822 24.2835 24.1192 23.6735 24.1192L20.9695 24.1177L22.7691 28.3936C22.9961 28.9336 22.7421 29.5546 22.2031 29.7806C21.6621 30.0076 21.0421 29.7546 20.8161 29.2156L18.9985 24.8917L17.1385 26.5392C16.7225 26.9072 16.0806 26.6507 16.0065 26.1274L15.9995 26.0262V15.1292Z"
                      fill="currentColor"
                    />
                  </motion.svg>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
