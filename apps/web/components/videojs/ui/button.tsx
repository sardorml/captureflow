'use client';

import '../styles/base.css';
import '../styles/audio/theme.css';
import '../styles/video/captions.css';
import '../styles/video/theme.css';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/resolve-class-name';

/** Shared button carrying the base interactive styles used by media controls. */
export type ButtonProps = ComponentProps<'button'>;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'grid size-media-control min-h-0 shrink-0 touch-manipulation select-none place-items-center rounded-media-control border-0 bg-transparent p-0 text-center text-inherit [corner-shape:var(--media-control-corner-shape)]',
        'cursor-pointer focus-ring-media',
        'will-change-[scale] duration-media-base ease-out [transition-property:background-color,color,outline-offset,scale]',
        'media-highlighted:highlight-media',
        'not-aria-disabled:hover:highlight-media',
        'focus-visible:outline-media-ring focus-visible:outline-offset-2',
        'not-aria-disabled:active:scale-[0.97]',
        'motion-reduce:scale-100 motion-reduce:will-change-auto motion-reduce:[transition-property:background-color,color]',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
