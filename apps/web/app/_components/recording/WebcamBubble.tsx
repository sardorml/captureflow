"use client";

import type { CSSProperties, RefObject } from "react";
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
  fluid?: boolean;
  concealed?: boolean;
};

// Where and how big the bubble is, for anything drawn in its place.
export function webcamBubbleLayout(
  webcam: RecordingWebcam,
  fluid: boolean,
): { className: string; style: CSSProperties } {
  return {
    // The skin's base styles stretch every video to the box; the bubble
    // takes its height from the aspect instead.
    className: cn(
      "pointer-events-none absolute aspect-square h-auto rounded-full object-cover",
      !webcam.point && webcamCornerClass(webcam.corner),
    ),
    style: {
      width: webcamSizeCss(webcam.size, fluid),
      ...(webcam.point
        ? webcamPointStyle(webcam.point, webcam.size, fluid)
        : {}),
    },
  };
}

// No z-index: the controls layers stack above it like a real PiP. A hidden
// camera stays mounted since its track carries the mic.
export function WebcamBubble({
  webcam,
  videoRef,
  fluid = false,
  concealed = false,
}: Props) {
  const layout = webcamBubbleLayout(webcam, fluid);
  return (
    <video
      ref={videoRef}
      src={webcam.url}
      className={cn(
        layout.className,
        (webcam.hidden || concealed) && "invisible",
      )}
      style={layout.style}
      playsInline
      preload="auto"
    />
  );
}
