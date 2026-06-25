"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ZoomableScreenshotImage({ src, alt, width, height }: Props) {
  return (
    <Zoom zoomMargin={48} classDialog="screenshot-zoom-dialog">
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
