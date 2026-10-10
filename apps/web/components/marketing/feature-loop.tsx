"use client";

import { useEffect, useRef, useState } from "react";

export type FeatureLoopName = "recordings" | "screenshots" | "teams";

/*
 * The exports are 1280×928 with the coloured card inset 40px on the page
 * colour. The wrapper crops that margin off and rounds to the card's own 56px
 * corner (as a percentage, so it holds at any width), leaving just the card.
 */
const VIDEO = { width: 1280, height: 928 };
const MARGIN = 40;
const CARD = {
  width: VIDEO.width - MARGIN * 2,
  height: VIDEO.height - MARGIN * 2,
};
const CARD_RADIUS = 56;

const CROP_STYLE = {
  width: `${(VIDEO.width / CARD.width) * 100}%`,
  left: `${(-MARGIN / CARD.width) * 100}%`,
  top: `${(-MARGIN / CARD.height) * 100}%`,
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function FeatureLoop({ name }: { name: FeatureLoopName }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const poster = `/feature-loops/${name}-poster.jpg`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Autoplay can still be refused (e.g. data saver); the poster stays up.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${CARD.width} / ${CARD.height}`,
        borderRadius: `${(CARD_RADIUS / CARD.width) * 100}% / ${(CARD_RADIUS / CARD.height) * 100}%`,
      }}
    >
      {reducedMotion ? (
        <img
          src={poster}
          alt=""
          width={VIDEO.width}
          height={VIDEO.height}
          loading="lazy"
          className="absolute h-auto max-w-none"
          style={CROP_STYLE}
        />
      ) : (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          width={VIDEO.width}
          height={VIDEO.height}
          className="absolute h-auto max-w-none"
          style={CROP_STYLE}
        >
          <source src={`/feature-loops/${name}.webm`} type="video/webm" />
          <source src={`/feature-loops/${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
