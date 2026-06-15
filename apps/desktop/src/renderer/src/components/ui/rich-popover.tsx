import {
  Arrow as PopoverArrow,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger
} from '@radix-ui/react-popover'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export type RichPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The element the popover anchors to — rendered in place via Radix's
  // `asChild`, so pass a single focusable node (e.g. a <button>).
  trigger: React.ReactNode
  title?: string
  icon?: React.ReactNode
  className?: string
  // White card instead of the default dark surface. Pins --muted-foreground to
  // the light-mode mid-gray so muted children stay readable on white.
  light?: boolean
  // macOS-style vibrancy: a translucent surface that blurs whatever sits
  // behind it. Ignored when `light` is set.
  glass?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  // Render a transparent full-window backdrop while open so a click anywhere
  // outside dismisses the popover. Needed when the trigger lives in the
  // Electron title-bar drag region (`-webkit-app-region: drag`), which the OS
  // intercepts before Radix's outside-pointer detection can fire.
  dismissBackdrop?: boolean
  // Shift along the align axis. With align="end", a negative value nudges the
  // card further past the trigger's end edge (i.e. to the right).
  alignOffset?: number
  // Distance (px) from the trigger along the side axis.
  sideOffset?: number
  // When false, Radix won't slide/flip the card to keep it on-screen — it stays
  // pinned to `align`/`side`. Use for a trigger near a viewport edge where the
  // anchored edge matters more than fitting (e.g. left-align under a toolbar
  // button that sits toward the right). Default true (clamp into view).
  avoidCollisions?: boolean
  children: React.ReactNode
}

// Radix-anchored card popover adapted from smoothui's "rich popover": a
// rounded-2xl surface that springs in with a soft blur, capped by an arrow
// tail that Radix keeps pointed at the trigger. Portaled out of the panel so
// it floats freely instead of clipping inside the sidebar. `forceMount` +
// AnimatePresence lets the exit animation play before Radix unmounts.
export function RichPopover({
  open,
  onOpenChange,
  trigger,
  title,
  icon,
  className,
  light = false,
  glass = false,
  side = 'bottom',
  align = 'end',
  alignOffset = 0,
  sideOffset = 8,
  avoidCollisions = true,
  dismissBackdrop = false,
  children
}: RichPopoverProps): React.JSX.Element {
  const reduce = useReducedMotion()
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <AnimatePresence>
        {open && dismissBackdrop && (
          // The backdrop needs its own portal: Radix's PopoverPortal wraps its
          // children in a single Slot (`React.Children.only`), so rendering the
          // backdrop as a sibling of PopoverContent inside one portal throws.
          <PopoverPortal forceMount>
            <div
              className="fixed inset-0 z-40"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              onPointerDown={() => onOpenChange(false)}
            />
          </PopoverPortal>
        )}
        {open && (
          <PopoverPortal forceMount>
            <PopoverContent
              asChild
              align={align}
              alignOffset={alignOffset}
              avoidCollisions={avoidCollisions}
              className="z-50"
              collisionPadding={12}
              side={side}
              sideOffset={sideOffset}
            >
              <motion.div
                // With collision avoidance off the card stays pinned to `align`
                // even near a viewport edge, so cap its width to the space Radix
                // measured (`--radix-popover-content-available-width`) — without
                // this the card keeps its full width and clips off-screen. The
                // `w-[…]` class still wins when there's room (it's the smaller of
                // the two). Only applied when pinned; clamped popovers don't need
                // it. Width only — height keeps the arrow tail from clipping.
                style={
                  avoidCollisions
                    ? undefined
                    : { maxWidth: 'var(--radix-popover-content-available-width)' }
                }
                animate={
                  reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
                }
                exit={
                  reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 5, filter: 'blur(8px)' }
                }
                initial={
                  reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 5, filter: 'blur(8px)' }
                }
                transition={
                  reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }
                }
                className={cn(
                  'relative rounded-xl px-4 py-3 shadow-xl',
                  // Default: matches the editor toolbars (bg-neutral-800) — a
                  // step lighter than the editor's --background so the card
                  // lifts. light: white surface with dark body text; pin
                  // --muted-foreground to the light-mode mid-gray so muted
                  // children stay readable (the dark theme resolves it to a
                  // near-white that vanishes on white).
                  glass &&
                    !light &&
                    'bg-neutral-800/65 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 text-white',
                  light && 'bg-white text-neutral-900 [--muted-foreground:oklch(0.46_0_0)]',
                  !light && !glass && 'bg-neutral-800 text-white',
                  className
                )}
              >
                {title && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {icon}
                    {title}
                  </div>
                )}
                {children}
                <PopoverArrow
                  className={
                    light ? 'fill-white' : glass ? 'fill-neutral-800/65' : 'fill-neutral-800'
                  }
                  height={7}
                  width={14}
                />
              </motion.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </PopoverRoot>
  )
}
