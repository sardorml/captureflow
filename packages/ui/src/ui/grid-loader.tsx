"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "../lib/cn";

type GridLoaderProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: number;
  className?: string;
};

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
        className={cn("inline-grid grid-cols-3 text-neutral-300", className)}
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
              ease: "easeInOut",
              delay: step * STAGGER,
            }}
          />
        ))}
      </div>
    );
  },
);

export { GridLoader };
export type { GridLoaderProps };
