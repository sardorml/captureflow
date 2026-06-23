import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icon'
import AnimatedTooltip from './animated-tooltip'

type LabeledSliderProps = {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  ticks?: number
  displayValue?: string
  // When provided, replaces the displayValue badge with a reset button that snaps the slider back to this value. The button dims when already at default.
  defaultValue?: number
  /** Help text shown next to the label via an info icon. */
  tooltip?: ReactNode
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

export function LabeledSlider({
  label,
  value,
  min,
  max,
  step = 1,
  ticks,
  displayValue,
  defaultValue,
  tooltip,
  onChange,
  className,
  disabled = false
}: LabeledSliderProps): React.JSX.Element {
  const range = max - min
  const progress = range > 0 ? ((value - min) / range) * 100 : 0
  const sliderStyle = { '--progress': progress } as CSSProperties
  const [isDragging, setIsDragging] = useState(false)
  const bubbleText = displayValue ?? String(Math.round(value))

  return (
    <div className={cn('w-full', disabled && 'opacity-40 pointer-events-none', className)}>
      {label && (
        <div className="font-normal text-[13px] font-normal text-foreground/90 mb-2 flex items-center gap-1.5">
          <span className="leading-none">{label}</span>
          {tooltip && (
            <AnimatedTooltip content={tooltip} placement="top" delay={150}>
              <button
                type="button"
                aria-label={`What is ${label}?`}
                className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors translate-y-0.5"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="block"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </button>
            </AnimatedTooltip>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1">
          {/* 8px offset matches the macos-slider thumb radius so the bubble stays within the track at 0%/100%. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute z-20 -top-7 mx-2 px-1.5 py-0.5 rounded-md bg-neutral-900/95 border border-white/10 text-[11px] font-normal text-foreground tabular-nums shadow-md transition-opacity duration-150 ${
              isDragging ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ left: `calc(${progress}% - 8px)`, transform: 'translateX(-50%)' }}
          >
            {bubbleText}
          </div>
          <input
            type="range"
            aria-label={label ?? 'Value'}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            onPointerCancel={() => setIsDragging(false)}
            onBlur={() => setIsDragging(false)}
            className="macos-slider w-full relative z-10"
            style={sliderStyle}
          />
          {ticks && ticks > 1 && (
            <div className="macos-slider-track-ticks" aria-hidden="true">
              {Array.from({ length: ticks }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          )}
        </div>
        {defaultValue !== undefined ? (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            disabled={disabled || value === defaultValue}
            aria-label={`Reset ${label ?? 'value'} to default`}
            title="Reset to default"
            className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-default"
          >
            <Icon name="restart_alt" size={16} fill />
          </button>
        ) : (
          displayValue !== undefined && (
            <span className="shrink-0 font-mono text-[11px] font-normal text-foreground tabular-nums min-w-10 text-right">
              {displayValue}
            </span>
          )
        )}
      </div>
    </div>
  )
}
