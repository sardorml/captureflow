"use client";

import { useEffect, useState } from "react";
import { TOKENS } from "./tokens";
import { Play } from "lucide-react";

const VIDEO_ID = "cAuDQoav608";

// A short muted loop cut from the demo stands in until someone hits play; the
// YouTube iframe only loads then. Reduced motion gets the loop's first frame.
export function RecorderMockup() {
  const token = TOKENS;
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[1172px] px-5 pb-24 pt-6 sm:px-8">
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{ borderRadius: token.borderRadiusLG }}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title="CaptureFlow demo"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <>
            {reducedMotion ? (
              <img
                src="/demo-loop-poster.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/demo-loop-poster.jpg"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/demo-loop.webm" type="video/webm" />
                <source src="/demo-loop.mp4" type="video/mp4" />
              </video>
            )}

            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play demo"
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"
              />

              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-[10px] ring-blue-600/30 transition-transform duration-200 ease-out group-hover:scale-[1.06] sm:h-28 sm:w-28">
                <Play className="size-10 translate-x-0.5 fill-white text-white sm:size-11" />
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
