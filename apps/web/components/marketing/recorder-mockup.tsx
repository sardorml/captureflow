"use client";

import { useState } from "react";
import { TOKENS } from "./tokens";
import { Play } from "lucide-react";

const VIDEO_ID = "cAuDQoav608";

// Poster facade first; the YouTube iframe only loads once someone hits play.
export function RecorderMockup() {
  const token = TOKENS;
  const [playing, setPlaying] = useState(false);

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
            <img
              src="/demo-poster.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play demo"
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-black/40"
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
