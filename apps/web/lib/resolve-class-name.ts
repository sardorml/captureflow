import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export type ClassName<State> = ClassValue | ((state: State) => ClassValue);

export function resolveClassName<State>(className: ClassName<State>, state: State): ClassValue {
  return typeof className === 'function' ? className(state) : className;
}

/** The `media` keys from the Skin Tailwind theme, by tailwind-merge theme group. Tests keep it equal to `styles/tailwind.css`. */
export const mediaTheme = {
  blur: ['media-hidden', 'media-hidden-popup'],
  color: [
    'media-accent',
    'media-background',
    'media-border',
    'media-controls',
    'media-controls-foreground',
    'media-foreground',
    'media-live',
    'media-muted',
    'media-muted-foreground',
    'media-popover',
    'media-popover-foreground',
    'media-primary',
    'media-primary-foreground',
    'media-ring',
    'media-backdrop',
  ],
  container: [
    'media-280',
    'media-xs',
    'media-360',
    'media-sm',
    'media-md',
    'media-lg',
    'media-xl',
    'media-2xl',
    'media-dialog',
  ],
  'drop-shadow': ['media-icon'],
  radius: [
    'media-control',
    'media-controls',
    'media-dialog',
    'media-menu-item',
    'media-pill',
    'media-player',
    'media-popup',
  ],
  shadow: ['media-hairline', 'media-separator', 'media-thumb', 'media-tooltip'],
  spacing: [
    'media-icon-sm',
    'media-icon',
    'media-icon-lg',
    'media-icon-xl',
    'media-control',
    'media-dialog-width',
    'media-hidden-offset',
    'media-hidden-indicator-offset',
    'media-hidden-preview-offset',
    'media-hidden-seek-offset',
  ],
  text: ['media-xs', 'media-sm', 'media', 'media-lg', 'media-xl'],
  'text-shadow': ['media', 'media-dialog'],
};

const twMerge = extendTailwindMerge({ extend: { theme: mediaTheme } });

/** Merges Skin class names so `text-media` merges as a font size instead of replacing a `text-media-*` color. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
