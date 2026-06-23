import * as React from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Command as CommandPrimitive } from 'cmdk'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>

export const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-2xl text-popover-foreground',
        className
      )}
      {...props}
    />
  )
)
Command.displayName = CommandPrimitive.displayName

type CommandDialogProps = {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export function CommandDialog({
  children,
  open,
  onOpenChange,
  title = 'Command palette'
}: CommandDialogProps): React.JSX.Element | null {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cmd-backdrop"
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            key="cmd-content"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.07] bg-neutral-800/95 backdrop-blur-md shadow-[0_18px_50px_-16px_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]"
            initial={
              shouldReduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.96, y: -8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.97, y: -6, transition: { duration: 0.12 } }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', damping: 24, stiffness: 340, mass: 0.7 }
            }
          >
            <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5">
              {children}
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-white/8 px-4" {...{ 'cmdk-input-wrapper': '' }}>
    <Search className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      autoFocus
      className={cn(
        'flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, onScroll, ...props }, ref) => {
  const [scrolling, setScrolling] = React.useState(false)
  const hideTimer = React.useRef<number | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    onScroll?.(e)
    setScrolling(true)
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setScrolling(false), 700)
  }

  React.useEffect(() => {
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    }
  }, [])

  return (
    <CommandPrimitive.List
      ref={ref}
      onScroll={handleScroll}
      data-scrolling={scrolling || undefined}
      className={cn(
        'max-h-80 overflow-y-auto overflow-x-hidden p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:transition-colors data-[scrolling]:[&::-webkit-scrollbar-thumb]:bg-white/20',
        className
      )}
      {...props}
    />
  )
})
CommandList.displayName = CommandPrimitive.List.displayName

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-muted-foreground"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn('overflow-hidden text-foreground', className)}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors aria-selected:bg-white/[0.10] aria-selected:text-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground aria-selected:[&_svg]:text-foreground",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

export function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}
