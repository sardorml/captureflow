'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';

// Motion-driven dropdown menu. Radix owns state/keyboard/focus; we only
// animate the content children on mount, keeping the trigger wiring
// untouched. Avoid the AnimatePresence + asChild + Portal combo that
// broke a prior iteration (Content never opened because Radix lost its
// anchor when Portal rendered conditionally). No exit animation on
// purpose: dropdowns close fast enough that the missing fade reads as
// snappy, not abrupt.

const SmoothDropdownMenu = DropdownMenuPrimitive.Root;
const SmoothDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const SmoothDropdownMenuGroup = DropdownMenuPrimitive.Group;
const SmoothDropdownMenuPortal = DropdownMenuPrimitive.Portal;

const CONTENT_SPRING = {
  type: 'spring' as const,
  stiffness: 480,
  damping: 28,
  mass: 0.7,
};

const SmoothDropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function SmoothDropdownMenuContent(
  { className, sideOffset = 6, side, align, children, ...props },
  ref
) {
  const origin = originForSide(side);
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        side={side}
        align={align}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-lg border border-line-strong bg-neutral-900 p-1 text-sm text-neutral-200 shadow-xl shadow-black/50',
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={CONTENT_SPRING}
          style={{ transformOrigin: origin }}
        >
          {children}
        </motion.div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});

function originForSide(
  side: 'top' | 'right' | 'bottom' | 'left' | undefined
): string {
  switch (side) {
    case 'top':
      return 'bottom center';
    case 'left':
      return 'right center';
    case 'right':
      return 'left center';
    case 'bottom':
    default:
      return 'top center';
  }
}

const SmoothDropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(function SmoothDropdownMenuItem({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-neutral-300 outline-none transition-colors focus:bg-overlay focus:text-neutral-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
});

const SmoothDropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function SmoothDropdownMenuLabel({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500',
        className
      )}
      {...props}
    />
  );
});

const SmoothDropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function SmoothDropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-overlay-strong', className)}
      {...props}
    />
  );
});

export {
  SmoothDropdownMenu,
  SmoothDropdownMenuTrigger,
  SmoothDropdownMenuGroup,
  SmoothDropdownMenuPortal,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuLabel,
  SmoothDropdownMenuSeparator,
};
