"use client";

import { useEffect, useState } from "react";
import { CloudSky } from "./cloud-sky";
import { NightSky } from "./night-sky";

// A fine sand grain over the sky and its clouds: tiled fractal noise, static so
// it costs nothing per frame.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.35"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>',
)}")`;

// One three.js scene at a time: clouds in light mode, stars in dark. Each
// unmounts, and frees its GPU resources, when the theme flips.
export function SkyScene() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.dataset.theme !== "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  if (dark === null) return null;
  return dark ? <NightSky /> : <CloudSky />;
}

/*
 * A sky gradient behind a three.js scene, fading into the page at the bottom
 * so the next section doesn't start on a hard edge.
 */
export function SkyBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_34%_at_74%_0%,rgb(255_178_98/0.72),transparent_70%),linear-gradient(180deg,#a3c9ef_0%,#c2dbf4_45%,#e2eefa_100%)] dark:bg-canvas dark:bg-none"
    >
      <div className="absolute inset-0 bg-canvas/50 dark:hidden" />
      <SkyScene />
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] dark:invert"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />
      {/* Dark mode eases out over a taller band, so the stars thin away
          rather than stopping at a line. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-canvas dark:h-[34rem] dark:bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--cf-canvas)_25%,transparent)_30%,color-mix(in_srgb,var(--cf-canvas)_70%,transparent)_60%,var(--cf-canvas)_92%)]" />
    </div>
  );
}
