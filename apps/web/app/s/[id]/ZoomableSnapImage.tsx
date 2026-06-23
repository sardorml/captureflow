'use client';

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Public viewer image with click-to-zoom. Split out of SnapView so the
// server component stays server-only — Zoom uses portals + state and
// must live in a 'use client' boundary.

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ZoomableSnapImage({ src, alt, width, height }: Props) {
  return (
    <Zoom
      // Match the snap viewer's dark backdrop so the zoom transition
      // doesn't flash white.
      zoomMargin={48}
      classDialog="snap-zoom-dialog"
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
