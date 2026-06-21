'use client';

import { useEffect, useRef } from 'react';

// Soft "halo" background: large solid-colour circles that ease to a new random
// position every `speed` seconds, read as a drifting glow. Performance notes:
//   • the blur is applied ONCE to the container (not per circle) — blurring many
//     moving elements individually re-rasterises each every frame and tanks FPS;
//   • positions are mutated directly on the DOM (no React state / re-renders);
//   • transforms use translate3d so the compositor handles the motion;
//   • the drift loop pauses whenever the effect scrolls out of view.
// Anti-clustering WITHOUT a rigid grid: positions are picked by best-candidate
// (blue-noise) sampling — each circle tries several random spots and keeps the
// one farthest from the already-placed ones. The layout stays organic and
// varied (with breathing room) but the blobs never bunch into one spot.
// Colours are interleaved so the hues stay mixed spatially.
// Honours prefers-reduced-motion (renders a single static scatter).
type ColorSet = { count: number; color: string };

type HaloEffectProps = {
  sets?: ColorSet[];
  size?: number;
  speed?: number;
  blur?: number;
  // CSS selector for the element the halo must NOT cover (the hero copy). Its
  // live bounding box is measured each placement so the keep-clear region
  // tracks the real layout at every breakpoint.
  clearSelector?: string;
};

// Mixed soft pastels — pink, cyan, light blue, lavender. Kept very faint so the
// halo stays a gentle wash rather than a strong colour field.
const DEFAULT_SETS: ColorSet[] = [
  { count: 11, color: '#FCE6F2' }, // pink
  { count: 11, color: '#E3F6F8' }, // cyan
  { count: 11, color: '#E7EEFF' }, // light blue
  { count: 11, color: '#EFEAFF' }, // lavender
];

export function HaloEffect({
  sets = DEFAULT_SETS,
  size = 220,
  speed = 4,
  blur = 50,
  clearSelector = '#hero-content',
}: HaloEffectProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Interleave colours (round-robin) so neighbouring grid cells get different
    // hues — keeps the palette mixed across the frame.
    const colors: string[] = [];
    const remaining = sets.map((s) => s.count);
    let added = true;
    while (added) {
      added = false;
      for (let s = 0; s < sets.length; s++) {
        if (remaining[s] > 0) {
          colors.push(sets[s].color);
          remaining[s]--;
          added = true;
        }
      }
    }

    const els: HTMLDivElement[] = [];
    for (const color of colors) {
      const el = document.createElement('div');
      el.style.cssText =
        `position:absolute;top:0;left:0;width:${size}px;height:${size}px;` +
        `border-radius:50%;background:${color};will-change:transform;` +
        `transition:transform ${speed}s ease-in-out;`;
      host.appendChild(el);
      els.push(el);
    }

    // Best-candidate (blue-noise) placement, biased AROUND the hero: candidate
    // centres inside a central keep-clear ellipse (where the headline + buttons
    // sit) are rejected, so the blobs ring the content and the middle stays
    // readable — an organic halo that frames the hero instead of covering it.
    const place = (): void => {
      const hostRect = host.getBoundingClientRect();
      const w = hostRect.width || host.clientWidth || window.innerWidth;
      const h = hostRect.height || host.clientHeight || window.innerHeight;
      const mx = size * 0.2;
      const my = size * 0.2;
      // Blob's effective radius — half its box plus the container blur halo.
      // The keep-clear test uses this so it's the visible EDGE of the blob,
      // not just its centre, that's held off the text.
      const R = size / 2 + blur;
      const gap = R * 0.15;

      // Keep-clear rectangle = the LIVE bounding box of the hero copy, read
      // from the DOM each placement so it tracks the real layout at every
      // breakpoint (no hard-coded guesses about where the headline sits).
      // Falls back to a centred box if the target can't be found.
      const target = clearSelector
        ? (document.querySelector(clearSelector) as HTMLElement | null)
        : null;
      let rx0: number, ry0: number, rx1: number, ry1: number;
      if (target) {
        const t = target.getBoundingClientRect();
        rx0 = t.left - hostRect.left;
        ry0 = t.top - hostRect.top;
        rx1 = t.right - hostRect.left;
        ry1 = t.bottom - hostRect.top;
      } else {
        rx0 = w * 0.12;
        rx1 = w * 0.88;
        ry0 = h * 0.08;
        ry1 = h * 0.78;
      }

      // Proper circle/rect intersection: a blob of radius R centred at (x,y)
      // overlaps the keep-clear rect.
      const hitsClear = (x: number, y: number): boolean => {
        const qx = x < rx0 ? rx0 : x > rx1 ? rx1 : x;
        const qy = y < ry0 ? ry0 : y > ry1 ? ry1 : y;
        const dx = x - qx;
        const dy = y - qy;
        return dx * dx + dy * dy < R * R;
      };
      const clampX = (x: number): number => Math.max(mx, Math.min(w - mx, x));
      const clampY = (y: number): number => Math.max(my, Math.min(h - my, y));

      // Deterministic RING placement: blobs are spread evenly by angle on an
      // ellipse that hugs the copy box (its half-extents + R + gap), so they
      // always render and always sit OUTSIDE the text. Rejection-sampling was
      // dropped because at narrow widths the copy box leaves almost no valid
      // area, so every blob would collapse into one off-screen pile. A small
      // per-placement angular jitter keeps the drift organic. If clamping a
      // ring point back into the host pulls it over the copy (no side room on
      // a narrow viewport), the blob falls to the open band above/below the
      // copy instead of overlapping the text.
      const ecx = (rx0 + rx1) / 2;
      const ecy = (ry0 + ry1) / 2;
      const ax = (rx1 - rx0) / 2 + R + gap;
      const ay = (ry1 - ry0) / 2 + R + gap;
      const n = els.length;
      for (let i = 0; i < n; i++) {
        const jitter = (Math.random() - 0.5) * ((Math.PI * 2) / n);
        const theta = (i / n) * Math.PI * 2 + jitter;
        const x = clampX(ecx + ax * Math.cos(theta));
        let y = clampY(ecy + ay * Math.sin(theta));
        if (hitsClear(x, y)) {
          // No room on this side — sit in the band above or below the copy.
          const goTop = Math.sin(theta) < 0;
          y = clampY(goTop ? ry0 - R - gap : ry1 + R + gap);
        }
        els[i].style.transform =
          `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      }
    };

    // initial layout without a transition, then enable easing next frame
    for (const el of els) el.style.transition = 'none';
    place();
    const raf = requestAnimationFrame(() => {
      for (const el of els)
        el.style.transition = `transform ${speed}s ease-in-out`;
      if (!reduce) place();
    });

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = (): void => {
      if (reduce || interval) return;
      interval = setInterval(place, speed * 1000);
    };
    const stop = (): void => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      stop();
      io.disconnect();
      for (const el of els) el.remove();
    };
  }, [sets, size, speed, blur, clearSelector]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ filter: `blur(${blur}px)` }}
    />
  );
}
