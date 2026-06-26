"use client";

import { useEffect, useRef, useState } from "react";
import { Tag, Typography, theme } from "antd";
import { Play, Pause, Check } from "lucide-react";

const SHARE_PATH = "captureflow.xyz/r/8kx2pnq4";

export function RecorderMockup() {
  const { token } = theme.useToken();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [overlayIcon, setOverlayIcon] = useState<"play" | "pause" | null>(null);
  const [prevPlaying, setPrevPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const syncPlaying = () => setPlaying(!v.paused);
    syncPlaying();
    v.addEventListener("play", syncPlaying);
    v.addEventListener("playing", syncPlaying);
    v.addEventListener("pause", syncPlaying);
    v.addEventListener("ended", syncPlaying);
    return () => {
      v.removeEventListener("play", syncPlaying);
      v.removeEventListener("playing", syncPlaying);
      v.removeEventListener("pause", syncPlaying);
      v.removeEventListener("ended", syncPlaying);
    };
  }, []);

  useEffect(() => {
    if (overlayIcon === null) return;
    const t = setTimeout(() => setOverlayIcon(null), 750);
    return () => clearTimeout(t);
  }, [overlayIcon]);

  // Flash the new state's icon in the centre whenever playback toggles.
  if (prevPlaying !== playing) {
    setPrevPlaying(playing);
    setOverlayIcon(playing ? "pause" : "play");
  }

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.ended || v.currentTime >= v.duration) v.currentTime = 0;
      void v.play();
    } else {
      v.pause();
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-6 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[70%] max-w-4xl rounded-[40px] bg-gradient-to-b from-blue-500/25 via-blue-400/10 to-transparent blur-3xl"
      />

      <div
        className="relative aspect-[480/301] w-full overflow-hidden"
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <video
          ref={videoRef}
          src="/demo.mp4"
          poster="/demo-poster.jpg"
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause demo" : "Play demo"}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          />

          <span
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-[10px] ring-blue-600/30 transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.06] sm:h-28 sm:w-28 ${
              playing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <Play className="size-10 translate-x-0.5 fill-white text-white sm:size-11" />
          </span>
        </button>

        {/* Centre flash on toggle. Keyed so back-to-back toggles restart it. */}
        {overlayIcon && playing ? (
          <div
            className="pointer-events-none"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              key={overlayIcon}
              className="animate-recording-icon-pop"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 124,
                height: 124,
                borderRadius: "50%",
                background: "rgba(23, 23, 23, 0.9)",
                color: "#fff",
              }}
            >
              {overlayIcon === "pause" ? (
                <Pause size={40} fill="currentColor" />
              ) : (
                <Play
                  size={40}
                  fill="currentColor"
                  style={{ transform: "translateX(2px)" }}
                />
              )}
            </div>
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute right-4 top-4 hidden transition-opacity duration-300 sm:right-5 sm:top-5 sm:block"
          style={{ opacity: playing ? 0 : 1 }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-2 backdrop-blur-md"
            style={{
              borderRadius: token.borderRadiusLG,
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowSecondary,
            }}
          >
            <Tag
              color="processing"
              style={{
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={12} />
              Link copied
            </Tag>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {SHARE_PATH}
            </Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
}
