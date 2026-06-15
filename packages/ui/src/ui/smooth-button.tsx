'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

// Motion-driven sibling of <Button>. Same variant API + a spring-loaded
// tap scale so the press feedback feels physical rather than the flat
// CSS `active:scale` shadcn ships. The `candy` variant is the signature
// gradient flavour callers reach for when they want the chrome to read
// as "primary, but elevated" (Share dialog confirm, the segmented
// Share+Copy chip on the share viewer, etc.).
const smoothButtonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm shadow-blue-900/30 hover:bg-blue-500',
        candy:
          'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white hover:from-sky-300 hover:via-blue-400 hover:to-indigo-500',
        destructive:
          'bg-red-600/90 text-white shadow-sm shadow-red-900/30 hover:bg-red-500',
        outline:
          'border border-line-strong bg-transparent text-fg hover:border-line-strong hover:bg-overlay hover:text-fg-strong',
        secondary:
          'border border-line-strong bg-neutral-900 text-fg hover:border-line-strong hover:bg-overlay hover:text-fg-strong',
        ghost: 'text-fg-muted hover:bg-overlay hover:text-fg',
        link: 'text-fg-muted underline-offset-4 hover:text-fg hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Spring tuned to feel like a physical button click — fast, slightly
// overdamped so it doesn't bounce back past 1.
const TAP_SPRING = { type: 'spring' as const, stiffness: 520, damping: 32 };

type SmoothButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDrag'
> &
  VariantProps<typeof smoothButtonVariants> & {
    // Render as the child element (Radix Slot pattern) — used by
    // anchor-style buttons so a <Link> picks up the variant classes
    // without losing semantic <a>. The animated wrapper is dropped
    // when asChild is true to avoid double-stacking motion props on a
    // host element that may not accept them.
    asChild?: boolean;
  };

const SmoothButton = React.forwardRef<HTMLButtonElement, SmoothButtonProps>(
  function SmoothButton(
    { className, variant, size, asChild = false, ...props },
    ref
  ) {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(smoothButtonVariants({ variant, size }), className)}
          {...props}
        />
      );
    }
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.015 }}
        transition={TAP_SPRING}
        className={cn(smoothButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

export { SmoothButton, smoothButtonVariants };
export type { SmoothButtonProps };
