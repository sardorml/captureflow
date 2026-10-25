"use client";

import type { RefObject } from "react";
import type {
  RecordingCameraCorner,
  RecordingCameraPoint,
  RecordingCameraSize,
} from "@/lib/recording-config";
import { cn } from "@/lib/utils";
import { webcamCornerClass, webcamPointStyle, webcamSizeCss } from "./layout";

export type RecordingWebcam = {
  url: string;
  corner: RecordingCameraCorner;
  point: RecordingCameraPoint | null;
  size: RecordingCameraSize;
  hidden: boolean;
};

type Props = {
  webcam: RecordingWebcam;
  videoRef: RefObject<HTMLVideoElement | null>;
};

// No z-index: the controls layers stack above it like a real PiP. A hidden
// camera stays mounted since its track carries the mic.
export function WebcamBubble({ webcam, videoRef }: Props) {
  return (
    <video
      ref={videoRef}
      src={webcam.url}
      className={cn(
        // The skin's base styles stretch every video to the box; the bubble
        // takes its height from the aspect instead.
        "pointer-events-none absolute aspect-square h-auto rounded-full object-cover",
        !webcam.point && webcamCornerClass(webcam.corner),
        webcam.hidden && "invisible",
      )}
      style={{
        width: webcamSizeCss(webcam.size),
        ...(webcam.point ? webcamPointStyle(webcam.point, webcam.size) : {}),
      }}
      playsInline
      preload="auto"
    />
  );
}
