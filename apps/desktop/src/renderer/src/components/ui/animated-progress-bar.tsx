import { motion, useReducedMotion } from 'motion/react'

export type AnimatedProgressBarProps = {
  value: number
  label?: string
  color?: string
  className?: string
  barClassName?: string
  labelClassName?: string
}

const MIN_PROGRESS_VALUE = 0
const MAX_PROGRESS_VALUE = 100

const SPRING = {
  type: 'spring' as const,
  damping: 10,
  mass: 0.75,
  stiffness: 100,
  duration: 0.25
}

export function AnimatedProgressBar({
  value,
  label,
  color = '#2563eb',
  className = '',
  barClassName = '',
  labelClassName = ''
}: AnimatedProgressBarProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const clamped = Math.max(MIN_PROGRESS_VALUE, Math.min(MAX_PROGRESS_VALUE, value))

  // Outlined capsule with an inset gradient fill, Instagram-story style.
  const fillBackground = `linear-gradient(90deg, #3b82f6 0%, ${color} 60%, #1d4ed8 100%)`

  return (
    <div className={`w-full ${className}`}>
      {label && <div className={`mb-1 font-medium text-sm ${labelClassName}`}>{label}</div>}
      <div className="relative h-4 w-full rounded-full border-2" style={{ borderColor: color }}>
        <div className="absolute inset-0.5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${clamped}%` }}
            className={`h-full rounded-full ${barClassName}`}
            initial={{ width: MIN_PROGRESS_VALUE }}
            style={{ background: fillBackground }}
            transition={shouldReduceMotion ? { duration: 0 } : SPRING}
          />
        </div>
      </div>
    </div>
  )
}
