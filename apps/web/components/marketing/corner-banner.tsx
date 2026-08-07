"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import NextLink from "next/link";
import { X } from "lucide-react";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Chips thrown out of the corner on open: distance and spin per chip, so the
// burst fans out along the two edges instead of landing in one clump.
const CONFETTI = [
  { x: 78, y: 10, turn: 220, delay: 0, size: 6 },
  { x: 62, y: 46, turn: -180, delay: 40, size: 5 },
  { x: 34, y: 74, turn: 260, delay: 20, size: 7 },
  { x: 8, y: 84, turn: -140, delay: 70, size: 5 },
  { x: 92, y: 44, turn: 160, delay: 90, size: 5 },
  { x: 50, y: 96, turn: -240, delay: 110, size: 6 },
] as const;

const CHIP_COLORS = ["#f5a524", "#fcd34d", "#2563eb", "#fafafa"] as const;

export function CornerBanner() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const [open, setOpen] = useState(false);
  // Bumped per open so the burst replays, then cleared so the chips leave the
  // DOM: left mounted at zero opacity, Chromium keeps the last painted frame of
  // one or two of them in the corner.
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

  /*
   * A corner ribbon rather than a bar across the top: the nav already owns the
   * top edge, and the triangle only fills the square to the left of the nav's
   * measure. Hidden below xl, where the logo sits close enough to the viewport
   * edge that the two would collide.
   */
  return (
    <div ref={rootRef} className="fixed top-0 left-0 z-[110] hidden xl:block">
      <button
        type="button"
        aria-label={m.banner.aria}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) setBurst((n) => n + 1);
        }}
        className="relative block h-16 w-16 cursor-pointer overflow-hidden transition-[filter] duration-200 hover:brightness-110 motion-reduce:transition-none"
      >
        <span
          className="absolute inset-0 bg-[#f5a524]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        {/* Rotated about its own centre onto the triangle's short diagonal, so
            the label sits square between the corner and the hypotenuse. */}
        <span className="text-on-inverse absolute top-[15px] -left-[11px] w-16 -rotate-45 text-center text-[9px] leading-3 font-bold tracking-[0.1em] uppercase">
          {m.banner.label}
        </span>
      </button>

      {burst > 0 && (
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
      )}

      {open && (
        <div
          role="dialog"
          aria-label={m.banner.title}
          className="animate-beta-card border-line-strong bg-panel absolute top-[76px] left-6 w-[304px] rounded-2xl border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
        >
          <button
            type="button"
            aria-label={m.banner.close}
            onClick={() => setOpen(false)}
            className="text-fg-subtle hover:text-fg absolute top-3 right-3 cursor-pointer transition-colors motion-reduce:transition-none"
          >
            <X size={16} />
          </button>
          <p className="text-fg pr-6 text-[15px] font-semibold">
            {m.banner.title}
          </p>
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
      )}
    </div>
  );
}
