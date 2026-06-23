'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';

// 3x3 grid of squares pulsing in a diagonal wave; an indeterminate
// loader for "preparing…" states. No portal or layout effects, so it
// is safe in server-rendered shells.

type GridLoaderProps = React.HTMLAttributes<HTMLDivElement> & {
  // Side length of each square in pixels.
  size?: number;
  // Square color; defaults to a neutral tone. Pass e.g. `text-blue-400`
  // to recolor via currentColor.
  className?: string;
};

// Per-cell animation delay step (top-left to bottom-right diagonals),
// so the squares fire in stripes for a smooth wave rather than a
// row-by-row scan.
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
