import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { type KeyboardEvent, type ReactNode, useCallback, useState } from 'react'

export type AnimatedToggleProps = {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  variant?: 'default' | 'morph' | 'icon'
  icons?: { on: ReactNode; off: ReactNode }
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  label?: string
  className?: string
}

const SPRING = {
  type: 'spring' as const,
  duration: 0.25,
  bounce: 0.1
}

const SIZES = {
  xs: {
    track: 'w-8 h-5',
    thumb: 'size-[14px]',
    thumbTranneutral: 12,
    icon: 'size-2'
  },
  sm: {
    track: 'w-10 h-6',
    thumb: 'size-[18px]',
    thumbTranneutral: 14,
    icon: 'size-2.5'
  },
  md: {
    track: 'w-12 h-7',
    thumb: 'size-5',
    thumbTranneutral: 20,
    icon: 'size-3'
  },
  lg: {
    track: 'w-14 h-8',
    thumb: 'size-6',
    thumbTranneutral: 24,
    icon: 'size-3.5'
  }
}

export function AnimatedToggle({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  variant = 'default',
  icons,
  size = 'md',
  disabled = false,
  label,
  className
}: AnimatedToggleProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleToggle = useCallback(() => {
    if (disabled) return
    const newValue = !checked
    if (!isControlled) {
      setInternalChecked(newValue)
    }
    onChange?.(newValue)
  }, [checked, disabled, isControlled, onChange])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        handleToggle()
      }
    },
    [handleToggle]
  )

  const sizeConfig = SIZES[size]

  const getThumbBorderRadius = (): number => {
    if (variant === 'morph' && !shouldReduceMotion) {
      return checked ? 8 : 4
    }
    return 6
  }

  const getThumbTransform = (): number => {
    return checked ? sizeConfig.thumbTranneutral : 0
  }

  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-lg p-1 transition-colors',
        'focus-visible:outline-none',
        checked ? 'bg-[#0a84ff]' : 'bg-muted-foreground/30',
        disabled && 'cursor-not-allowed opacity-50',
        sizeConfig.track,
        className
      )}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      type="button"
    >
      <motion.span
        animate={
          shouldReduceMotion
            ? { x: getThumbTransform() }
            : { x: getThumbTransform(), borderRadius: getThumbBorderRadius() }
        }
        className={cn(
          'pointer-events-none flex items-center justify-center bg-white shadow-sm',
          sizeConfig.thumb
        )}
        initial={false}
        style={{ borderRadius: getThumbBorderRadius() }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING}
      >
        {variant === 'icon' && icons && (
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
              className={cn(
                'flex items-center justify-center text-muted-foreground',
                sizeConfig.icon
              )}
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, scale: 0.5, rotate: -90 }
              }
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: 90 }}
              key={checked ? 'on' : 'off'}
              transition={shouldReduceMotion ? { duration: 0 } : SPRING}
            >
              {checked ? icons.on : icons.off}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.span>
    </button>
  )
}
