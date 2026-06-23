import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

type DropdownItem = {
  key: string
  label: string
  icon?: ReactNode
  /** Right-aligned content (e.g. a keyboard shortcut). */
  trailing?: ReactNode
  onSelect?: () => void
  disabled?: boolean
  disabledReason?: string
  /** Tailwind classes applied to the hover-bg overlay (e.g. 'bg-blue-500/15'). */
  hoverClassName?: string
}

function DropdownMenuItem({
  item,
  onActivate
}: {
  item: DropdownItem
  onActivate: () => void
}): React.JSX.Element {
  const rootRef = useRef<HTMLButtonElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  const getOrigin = useCallback((e: React.MouseEvent): string => {
    if (!rootRef.current) return '50% 50%'
    const rect = rootRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    return `${x}% ${y}%`
  }, [])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent): void => {
      if (item.disabled || !bgRef.current) return
      const bg = bgRef.current
      bg.style.transformOrigin = getOrigin(e)
      bg.style.transition = 'none'
      bg.style.transform = 'scale(0.3)'
      bg.style.opacity = '0'
      void bg.offsetHeight
      bg.style.transition = 'transform 150ms ease-out, opacity 80ms ease-out'
      bg.style.transform = 'scale(1)'
      bg.style.opacity = '1'
    },
    [getOrigin, item.disabled]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent): void => {
      if (item.disabled || !bgRef.current) return
      const bg = bgRef.current
      bg.style.transformOrigin = getOrigin(e)
      bg.style.transition = 'transform 100ms cubic-bezier(0.5, 0, 0.75, 0), opacity 100ms ease-in'
      bg.style.transform = 'scale(0.3)'
      bg.style.opacity = '0'
    },
    [getOrigin, item.disabled]
  )

  return (
    <button
      ref={rootRef}
      disabled={item.disabled}
      onClick={() => {
        if (item.disabled) return
        onActivate()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={item.disabled ? item.disabledReason : undefined}
      className={cn(
        'relative overflow-hidden flex items-center gap-3 mx-1.5 px-3 py-2.5 text-sm font-medium rounded-md',
        item.disabled ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-300 cursor-pointer'
      )}
      style={{ width: 'calc(100% - 0.75rem)' }}
    >
      {!item.disabled && (
        <div
          ref={bgRef}
          aria-hidden
          className={cn(
            'absolute inset-0 rounded-md pointer-events-none',
            item.hoverClassName ?? 'bg-foreground/6'
          )}
          style={{ transform: 'scale(0.3)', opacity: 0 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
        {item.icon}
        {item.label}
      </span>
      {item.trailing && <span className="relative z-10 ml-4 shrink-0">{item.trailing}</span>}
    </button>
  )
}

type AnimatedDropdownProps = {
  trigger: ReactNode
  items: DropdownItem[]
  disabled?: boolean
  className?: string
  placement?: 'bottom' | 'top'
}

const POP = { duration: 0.075, ease: [0, 0, 0.2, 1] as [number, number, number, number] }

export function AnimatedDropdown({
  trigger,
  items,
  disabled,
  className,
  placement = 'bottom'
}: AnimatedDropdownProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => !disabled && setOpen(!open)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, transition: { duration: 0.06 } }
            }
            transition={shouldReduceMotion ? { duration: 0 } : POP}
            className={cn(
              'absolute left-0 w-full z-50 rounded-lg bg-card shadow-lg py-1 overflow-hidden',
              placement === 'top' ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'
            )}
          >
            {items.map((item) => (
              <DropdownMenuItem
                key={item.key}
                item={item}
                onActivate={() => {
                  item.onSelect?.()
                  setOpen(false)
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
