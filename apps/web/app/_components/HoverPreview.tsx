"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  webcamUrl?: string | null;
  active: boolean;
};

// The camera's place on the thumbnail the extension bakes for the card, as
// shares of the frame, so the loop's bubble sits exactly over the still's.
const CARD_CAMERA = { width: "20%", left: "2.5%", bottom: "4%" };

// Sweeping the pointer across the grid must not fetch anything, so the
// elements only mount once the card has been hovered this long.
const DWELL_MS = 250;

// The camera loop follows the screen loop; past this gap it is pulled back.
const SYNC_SLACK_S = 0.3;

// Only the opening seconds play, so the browser never fetches the rest.
const PREVIEW_S = 6;

// A muted loop of the recording's opening seconds, camera bubble included,
// over its thumbnail while the card is hovered. Nothing loads until the first dwell; after that
// the elements stay so a second hover plays from the buffer.
export function HoverPreview({ src, webcamUrl, active }: Props) {
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const camRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active || started) return;
    const id = window.setTimeout(() => setStarted(true), DWELL_MS);
    return () => window.clearTimeout(id);
  }, [active, started]);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const cam = camRef.current;
    if (active) {
      screen.currentTime = 0;
      void screen.play().catch(() => {});
      if (cam) {
        cam.currentTime = 0;
        void cam.play().catch(() => {});
      }
    } else {
      screen.pause();
      cam?.pause();
      setPlaying(false);
    }
  }, [active, started]);

  const onScreenTime = () => {
    const screen = screenRef.current;
    if (!screen) return;
    const cam = camRef.current;
    if (screen.currentTime >= PREVIEW_S) {
      screen.currentTime = 0;
      if (cam) cam.currentTime = 0;
      return;
    }
    if (cam && Math.abs(cam.currentTime - screen.currentTime) > SYNC_SLACK_S) {
      cam.currentTime = screen.currentTime;
    }
  };

  if (!started) return null;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-200",
        playing && active ? "opacity-100" : "opacity-0",
      )}
    >
      <video
        ref={screenRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setPlaying(true)}
        onTimeUpdate={onScreenTime}
        className="h-full w-full object-cover"
      />
      {webcamUrl ? (
        <video
          ref={camRef}
          src={webcamUrl}
          muted
          loop
          playsInline
          preload="auto"
          className="absolute aspect-square h-auto rounded-full object-cover"
          style={CARD_CAMERA}
        />
      ) : null}
    </div>
  );
}
