'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';

// 3x3 grid of squares that pulse in a diagonal wave — the smoothui
// "grid loader" pattern. Used in place of CSS spinners for any
// indeterminate "preparing…" state (share upload, snap upload, video
// transcode, etc.). Renders deterministically: no portal, no layout
// effects, safe in server-rendered shells.

type GridLoaderProps = React.HTMLAttributes<HTMLDivElement> & {
  // Side length of each square in pixels. Default 8px → 32px overall
  // (plus gaps) — sits comfortably next to a label.
  size?: number;
  // Color of the squares. Defaults to a neutral tone that reads on
  // dark backgrounds; pass `text-blue-400` etc. to recolor.
  className?: string;
};

// Diagonal wave order — the index in the 3x3 grid each cell occupies
// in the animation sequence. Reading by row, the squares fire in
// stripes from top-left to bottom-right which produces a smooth wave
// rather than a jittery row-by-row scan.
const WAVE_ORDER = [0, 1, 2, 1, 2, 3, 2, 3, 4];
const STAGGER = 0.09;
const CYCLE = 1.2;

const GridLoader = React.forwardRef<HTMLDivElement, GridLoaderProps>(
  function GridLoader({ size = 8, className, style, ...props }, ref) {
    const gap = Math.max(2, Math.round(size * 0.5));
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('inline-grid grid-cols-3 text-neutral-300', className)}
        style={{ gap, ...style }}
        {...props}
      >
        {WAVE_ORDER.map((step, i) => (
          <motion.span
            key={i}
            className="block rounded-[2px] bg-current"
            style={{ width: size, height: size }}
            initial={{ opacity: 0.18, scale: 0.82 }}
            animate={{ opacity: [0.18, 1, 0.18], scale: [0.82, 1, 0.82] }}
            transition={{
              duration: CYCLE,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: step * STAGGER,
            }}
          />
        ))}
      </div>
    );
  }
);

export { GridLoader };
export type { GridLoaderProps };
