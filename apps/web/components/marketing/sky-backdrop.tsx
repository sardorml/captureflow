"use client";

import { useEffect, useState } from "react";
import { CloudSky } from "./cloud-sky";
import { NightSky } from "./night-sky";

// A fine sand grain over the sky and its clouds: tiled fractal noise, static so
// it costs nothing per frame. Blended as overlay in light so it textures the
// sky without greying it down the way a plain dark wash does.
export const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.35"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>',
)}")`;

export function SkyGrain() {
  return (
    // In dark the grain thins out towards the bottom, like the stars, so the
    // section ends on the bare canvas rather than a textured edge.
    <div
      className="absolute inset-0 opacity-[0.18] mix-blend-overlay dark:opacity-[0.04] dark:mix-blend-normal dark:invert dark:[mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)]"
      style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
    />
  );
}

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
 * A clear blue sky behind a three.js scene, fading into the page at the
 * bottom so the next section doesn't start on a hard edge.
 */
export function SkyBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#98d5ff_0%,#c3e7ff_45%,#ecf6ff_80%,var(--cf-canvas)_100%)] dark:bg-canvas dark:bg-none"
    >
      <SkyScene />
      <SkyGrain />
      {/* The band blurs what is under it as it fades, so clouds dissolve into
          the page instead of being cut by it. Light only: in dark the page is
          already the canvas, and a translucent canvas gradient over it rounds
          into visible bands, so the stars fade through their own mask instead. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-canvas backdrop-blur-md [mask-image:linear-gradient(to_bottom,transparent,black_60%)] dark:hidden" />
    </div>
  );
}
