import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SPRING_DEFAULT = { type: 'spring' as const, stiffness: 300, damping: 25 }
const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 400, damping: 30 }
const DURATION_INSTANT = { duration: 0 }

const CHEVRON_ROTATION = 180
const DROPDOWN_OFFSET = 4
const STAGGER_DELAY = 0.02
const ITEM_HOVER_X = 2

export type SelectOptionProps = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectGroupOption = {
  label: string
  options: SelectOptionProps[]
}

export type SmoothSelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  options?: SelectOptionProps[]
  groups?: SelectGroupOption[]
  className?: string
  contentClassName?: string
  size?: 'sm' | 'default'
  align?: 'left' | 'right'
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function SmoothSelect({
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  name,
  options,
  groups,
  className,
  contentClassName,
  size = 'default',
  align = 'left',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}: SmoothSelectProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue

  const allOptions: SelectOptionProps[] = (() => {
    const flat: SelectOptionProps[] = []
    if (options) {
      for (const opt of options) {
        flat.push(opt)
      }
    }
    if (groups) {
      for (const group of groups) {
        for (const opt of group.options) {
          flat.push(opt)
        }
      }
    }
    return flat
  })()

  const selectedLabel = allOptions.find((opt) => opt.value === selectedValue)?.label

  const handleSelect = useCallback(
    (opt: SelectOptionProps) => {
      if (opt.disabled) return
      if (controlledValue === undefined) {
        setInternalValue(opt.value)
      }
      onValueChange?.(opt.value)
      setIsOpen(false)
      setFocusedIndex(-1)
      triggerRef.current?.focus()
    },
    [controlledValue, onValueChange]
  )

  const handleToggle = useCallback(() => {
    if (disabled) return
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + DROPDOWN_OFFSET,
        left: rect.left,
        width: rect.width
      })
    }
    setIsOpen((prev) => !prev)
    setFocusedIndex(-1)
  }, [disabled, isOpen])

  useEffect(() => {
    if (!(isOpen && triggerRef.current)) return

    const updatePosition = (): void => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + DROPDOWN_OFFSET,
          left: rect.left,
          width: rect.width
        })
      }
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isOpen) {
        if (
          (event.key === 'Enter' || event.key === ' ') &&
          document.activeElement === triggerRef.current
        ) {
          event.preventDefault()
          handleToggle()
        }
        return
      }

      if (event.key === 'Escape') {
        setIsOpen(false)
        setFocusedIndex(-1)
        triggerRef.current?.focus()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex((prev) => (prev < allOptions.length - 1 ? prev + 1 : 0))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allOptions.length - 1))
      } else if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault()
        const opt = allOptions[focusedIndex]
        if (opt) handleSelect(opt)
      } else if (event.key === 'Home') {
        event.preventDefault()
        setFocusedIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        setFocusedIndex(allOptions.length - 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allOptions, focusedIndex, handleSelect, handleToggle])

  const renderItem = (opt: SelectOptionProps, idx: number): React.JSX.Element => {
    const isSelected = opt.value === selectedValue
    const isFocused = idx === focusedIndex

    return (
      <motion.div
        key={opt.value}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
        exit={
          shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -8 }
        }
        transition={
          shouldReduceMotion ? DURATION_INSTANT : { ...SPRING_SNAPPY, delay: idx * STAGGER_DELAY }
        }
        whileHover={shouldReduceMotion ? {} : { x: ITEM_HOVER_X }}
      >
        <button
          aria-selected={isSelected}
          className={cn(
            'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-left text-sm outline-hidden select-none',
            'transition-colors',
            opt.disabled
              ? 'pointer-events-none opacity-50'
              : 'hover:bg-accent hover:text-accent-foreground',
            isFocused && 'bg-accent text-accent-foreground',
            isSelected && 'font-medium'
          )}
          disabled={opt.disabled}
          onClick={() => handleSelect(opt)}
          onMouseEnter={() => setFocusedIndex(idx)}
          role="option"
          type="button"
        >
          <span className="flex-1 truncate">{opt.label}</span>
          <span className="absolute right-2 flex size-3.5 items-center justify-center">
            <AnimatePresence>
              {isSelected && (
                <motion.span
                  animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { scale: 0, opacity: 0 }
                  }
                  initial={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
                  transition={
                    shouldReduceMotion
                      ? DURATION_INSTANT
                      : { type: 'spring', stiffness: 300, damping: 20, duration: 0.2 }
                  }
                >
                  <Check className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </motion.div>
    )
  }

  let globalIndex = 0

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <div ref={portalRef}>
          <motion.div
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            className={cn(
              'fixed z-50 origin-top overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
              contentClassName
            )}
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.15 } }
            }
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: -4 }}
            role="listbox"
            style={{
              top: `${position.top}px`,
              ...(align === 'right'
                ? {
                    right: `${window.innerWidth - position.left - position.width}px`,
                    maxWidth: `${position.left + position.width - 8}px`
                  }
                : {
                    left: `${position.left}px`,
                    maxWidth: `${window.innerWidth - position.left - 8}px`
                  }),
              minWidth: `${position.width}px`,
              width: 'max-content'
            }}
            transition={shouldReduceMotion ? DURATION_INSTANT : SPRING_DEFAULT}
          >
            <div className="max-h-60 overflow-y-auto p-1">
              {options &&
                options.length > 0 &&
                (() => {
                  const items = options.map((opt) => {
                    const idx = globalIndex
                    globalIndex += 1
                    return renderItem(opt, idx)
                  })
                  return items
                })()}

              {groups &&
                groups.map((group, groupIdx) => {
                  const groupItems = group.options.map((opt) => {
                    const idx = globalIndex
                    globalIndex += 1
                    return renderItem(opt, idx)
                  })

                  return (
                    <div key={group.label}>
                      {groupIdx > 0 && (
                        <div className="bg-border pointer-events-none -mx-1 my-1 h-px" />
                      )}
                      <div className="text-muted-foreground px-2 py-1.5 text-xs">{group.label}</div>
                      {groupItems}
                    </div>
                  )
                })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="relative inline-block w-full" ref={wrapperRef}>
        {name && (
          <input
            aria-hidden="true"
            name={name}
            required={required}
            tabIndex={-1}
            type="hidden"
            value={selectedValue}
          />
        )}

        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-required={required || undefined}
          role="combobox"
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-[13px] whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            size === 'default' ? 'h-10' : 'h-8',
            className
          )}
          data-placeholder={!selectedLabel || undefined}
          disabled={disabled}
          onClick={handleToggle}
          ref={triggerRef}
          type="button"
        >
          <span
            className={cn(
              'line-clamp-1 flex items-center gap-2 text-left',
              !selectedLabel && 'text-muted-foreground'
            )}
          >
            {selectedLabel ?? placeholder}
          </span>

          <motion.div
            animate={{ rotate: isOpen ? CHEVRON_ROTATION : 0 }}
            className="shrink-0"
            transition={
              shouldReduceMotion
                ? DURATION_INSTANT
                : { type: 'spring', duration: 0.25, bounce: 0.05 }
            }
          >
            <ChevronDown className="size-4 opacity-50" />
          </motion.div>
        </button>
      </div>

      {typeof window !== 'undefined' ? createPortal(dropdownContent, document.body) : null}
    </>
  )
}
