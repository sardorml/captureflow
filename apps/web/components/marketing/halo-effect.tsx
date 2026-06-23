"use client";

import { useEffect, useRef } from "react";

type ColorSet = { count: number; color: string };

type HaloEffectProps = {
  sets?: ColorSet[];
  size?: number;
  speed?: number;
  blur?: number;
  clearSelector?: string;
};

const DEFAULT_SETS: ColorSet[] = [
  { count: 11, color: "#FCE6F2" },
  { count: 11, color: "#E3F6F8" },
  { count: 11, color: "#E7EEFF" },
  { count: 11, color: "#EFEAFF" },
];

export function HaloEffect({
  sets = DEFAULT_SETS,
  size = 220,
  speed = 4,
  blur = 50,
  clearSelector = "#hero-content",
}: HaloEffectProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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
      const el = document.createElement("div");
      el.style.cssText =
        `position:absolute;top:0;left:0;width:${size}px;height:${size}px;` +
        `border-radius:50%;background:${color};will-change:transform;` +
        `transition:transform ${speed}s ease-in-out;`;
      host.appendChild(el);
      els.push(el);
    }

    const place = (): void => {
      const hostRect = host.getBoundingClientRect();
      const w = hostRect.width || host.clientWidth || window.innerWidth;
      const h = hostRect.height || host.clientHeight || window.innerHeight;
      const mx = size * 0.2;
      const my = size * 0.2;
      const R = size / 2 + blur;
      const gap = R * 0.15;

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

      const hitsClear = (x: number, y: number): boolean => {
        const qx = x < rx0 ? rx0 : x > rx1 ? rx1 : x;
        const qy = y < ry0 ? ry0 : y > ry1 ? ry1 : y;
        const dx = x - qx;
        const dy = y - qy;
        return dx * dx + dy * dy < R * R;
      };
      const clampX = (x: number): number => Math.max(mx, Math.min(w - mx, x));
      const clampY = (y: number): number => Math.max(my, Math.min(h - my, y));

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
          const goTop = Math.sin(theta) < 0;
          y = clampY(goTop ? ry0 - R - gap : ry1 + R + gap);
        }
        els[i].style.transform =
          `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      }
    };

    for (const el of els) el.style.transition = "none";
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
