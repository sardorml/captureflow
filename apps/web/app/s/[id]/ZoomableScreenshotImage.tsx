"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useAppMessages } from "@/components/app-i18n-provider";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ZoomableScreenshotImage({ src, alt, width, height }: Props) {
  const m = useAppMessages();
  return (
    <Zoom
      zoomMargin={48}
      classDialog="screenshot-zoom-dialog"
      a11yNameButtonZoom={m.screenshotView.zoom.expand}
      a11yNameButtonUnzoom={m.screenshotView.zoom.minimize}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-full w-full cursor-zoom-in object-contain"
        draggable={false}
      />
    </Zoom>
  );
}
