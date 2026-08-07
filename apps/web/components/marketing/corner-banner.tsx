"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import NextLink from "next/link";
import { X } from "lucide-react";
import { useLocalizedHref, useMessages } from "./i18n-provider";

/*
 * EXPERIMENT — one switch drives where the beta badge lives, so the three
 * placements can be compared without three copies of the popover:
 *   "corner" — amber triangle in the viewport's top-left corner (as shipped)
 *   "nav"    — chip inside the nav, beside the wordmark
 *   "strip"  — full-width bar above the nav
 * Collapse this to the chosen one before it ships.
 */
export const BETA_PLACEMENT: "corner" | "nav" | "strip" = "strip";

const AMBER = "#f5a524";
// The strip runs the full width, where the badge's amber reads twice as loud —
// same hue, a step down in saturation so it stops shouting at the page.
const AMBER_SOFT = "#cfa732";
const AMBER_INK = "#6f4210";
// Written as literals because the strip is gold under either theme: a token
// that flips with the theme would turn the text near-white on gold in light
// mode. 8:1 on the fill.
const STRIP_INK = "#1f2126";

// Chips thrown out on open: distance and spin per chip, so the burst fans out
// along the two edges instead of landing in one clump.
const CONFETTI = [
  { x: 78, y: 10, turn: 220, delay: 0, size: 6 },
  { x: 62, y: 46, turn: -180, delay: 40, size: 5 },
  { x: 34, y: 74, turn: 260, delay: 20, size: 7 },
  { x: 8, y: 84, turn: -140, delay: 70, size: 5 },
  { x: 92, y: 44, turn: 160, delay: 90, size: 5 },
  { x: 50, y: 96, turn: -240, delay: 110, size: 6 },
] as const;

const CHIP_COLORS = ["#f5a524", "#fcd34d", "#2563eb", "#fafafa"] as const;

// Open/close, the burst counter, and the dismiss listeners — one hook so each
// placement only has to draw its own trigger.
function useBetaNote() {
  const [open, setOpen] = useState(false);
  // Cleared once the burst ends so the chips leave the DOM: left mounted at
  // zero opacity, Chromium keeps the last painted frame of one or two of them.
  const [burst, setBurst] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(0), 1400);
    return () => window.clearTimeout(timer);
  }, [burst]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return {
    open,
    burst,
    rootRef,
    toggle: () => {
      setOpen(!open);
      if (!open) setBurst((n) => n + 1);
    },
    close: () => setOpen(false),
  };
}

function Confetti({ burst }: { burst: number }) {
  if (!burst) return null;
  return (
    <span key={burst} aria-hidden className="pointer-events-none">
      {CONFETTI.map((chip, i) => (
        <span
          key={i}
          className="animate-beta-confetti absolute top-7 left-7 block rounded-[2px]"
          style={
            {
              width: chip.size,
              height: chip.size,
              background: CHIP_COLORS[i % CHIP_COLORS.length],
              animationDelay: `${chip.delay}ms`,
              "--cf-burst-x": `${chip.x}px`,
              "--cf-burst-y": `${chip.y}px`,
              "--cf-burst-turn": `${chip.turn}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

function BetaNote({
  onClose,
  className,
}: {
  onClose: () => void;
  className: string;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <div
      role="dialog"
      aria-label={m.banner.title}
      className={`animate-beta-card border-line-strong bg-panel absolute w-[304px] rounded-2xl border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] ${className}`}
    >
      <button
        type="button"
        aria-label={m.banner.close}
        onClick={onClose}
        className="text-fg-subtle hover:text-fg absolute top-3 right-3 cursor-pointer transition-colors motion-reduce:transition-none"
      >
        <X size={16} />
      </button>
      <p className="text-fg pr-6 text-[15px] font-semibold">{m.banner.title}</p>
      <p className="text-fg-muted mt-1.5 text-[13px] leading-relaxed">
        {m.banner.body}
      </p>
      <NextLink
        href={lh("/suggest-feature")}
        className="text-accent hover:text-accent-strong mt-3 inline-block text-[13px] font-medium transition-colors motion-reduce:transition-none"
      >
        {m.banner.cta}
      </NextLink>
    </div>
  );
}

/*
 * A corner ribbon rather than a bar across the top: the nav already owns the
 * top edge, and the triangle only fills the square to the left of the nav's
 * measure. Hidden below xl, where the logo sits close enough to the viewport
 * edge that the two would collide.
 */
function CornerTriangle() {
  const m = useMessages();
  const { open, burst, rootRef, toggle, close } = useBetaNote();
  return (
    <div ref={rootRef} className="fixed top-0 left-0 z-[110] hidden xl:block">
      <button
        type="button"
        aria-label={m.banner.aria}
        aria-expanded={open}
        onClick={toggle}
        className="relative block h-16 w-16 cursor-pointer overflow-hidden transition-[filter] duration-200 hover:brightness-110 motion-reduce:transition-none"
      >
        <span
          className="absolute inset-0"
          style={{
            background: AMBER,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        {/* Rotated about its own centre onto the triangle's short diagonal, so
            the label sits square between the corner and the hypotenuse. The
            colour is a literal for the same reason the fill is: the triangle is
            amber in both themes, so a theme-flipping token turned the label
            near-white on amber in light mode. Bold buys the ink to carry it
            this light at 9px — 4.5:1 on the fill is the floor for text this
            size. */}
        <span
          className="absolute top-[15px] -left-[11px] w-16 -rotate-45 text-center text-[9px] leading-3 font-bold tracking-[0.1em] uppercase"
          style={{ color: AMBER_INK }}
        >
          {m.banner.label}
        </span>
      </button>
      <Confetti burst={burst} />
      {open && <BetaNote onClose={close} className="top-[76px] left-6" />}
    </div>
  );
}

// Rides in the nav's own lockup, so it scales and moves with the bar instead of
// pinning itself to a corner the bar has already left.
export function NavBetaChip() {
  const m = useMessages();
  const { open, burst, rootRef, toggle, close } = useBetaNote();
  if (BETA_PLACEMENT !== "nav") return null;
  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-label={m.banner.aria}
        aria-expanded={open}
        onClick={toggle}
        className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold tracking-[0.08em] uppercase transition-[filter] duration-200 hover:brightness-110 motion-reduce:transition-none"
        style={{ background: AMBER, color: AMBER_INK }}
      >
        {m.banner.label}
      </button>
      <Confetti burst={burst} />
      {open && <BetaNote onClose={close} className="top-9 -left-2" />}
    </div>
  );
}

// Full-width bar above the nav: the one placement that can carry a sentence
// rather than a word, at the cost of the page's first 36px.
function BetaStrip() {
  const m = useMessages();
  return (
    <div
      className="flex w-full items-center justify-center gap-2 px-5 py-2 text-[14px]"
      style={{ background: AMBER_SOFT, color: STRIP_INK }}
    >
      {/* The sentence names the beta itself, so the tag alongside it would say
          the same word twice. */}
      <span className="shrink-0 text-[14px] leading-none" aria-hidden>
        🚒
      </span>
      <span className="truncate font-medium">{m.banner.strip}</span>
    </div>
  );
}

export function CornerBanner() {
  if (BETA_PLACEMENT === "strip") return <BetaStrip />;
  if (BETA_PLACEMENT === "corner") return <CornerTriangle />;
  return null;
}
