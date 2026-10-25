"use client";

import { FadeInImage } from "@/components/ui/fade-in-image";

// The poster over its blur, so the sharp frame fades in whole instead of
// painting strip by strip. Shared by the player's skin and the shell that
// stands in for the player while its chunk loads.
export function PosterLayer({
  posterUrl,
  posterBlur,
}: {
  posterUrl: string;
  posterBlur?: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {posterBlur ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterBlur}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-105 object-contain blur-md"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-950" />
      )}
      {/* Lazy on purpose: eager would be hoisted into <head> ahead of the
          stylesheet and hold first paint behind the whole poster. */}
      <FadeInImage
        src={posterUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain"
      />
    </div>
  );
}
