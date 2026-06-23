import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useCallback, useId, useState } from 'react'
import AnimatedTooltip from './animated-tooltip'

export type AnimatedTabItem = {
  id: string
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  tooltip?: string
  disabled?: boolean
  // Dimmed like `disabled` but stays CLICKABLE — fires `onLockedSelect` instead of selecting the tab.
  locked?: boolean
  testId?: string
}

export type AnimatedTabsProps = {
  tabs: AnimatedTabItem[]
  activeTab?: string
  defaultTab?: string
  onChange?: (tabId: string) => void
  // Fired when a `locked` tab is clicked — the tab is NOT selected.
  onLockedSelect?: (tabId: string) => void
  variant?: 'underline' | 'pill' | 'segment'
  iconOnly?: boolean
  layoutId?: string
  className?: string
  // `cn` uses tailwind-merge, so e.g. `bg-white` overrides the variant default.
  indicatorClassName?: string
  activeTabClassName?: string
}

const SPRING = {
  type: 'spring' as const,
  duration: 0.25,
  bounce: 0.05
}

export function AnimatedTabs({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  onLockedSelect,
  variant = 'underline',
  iconOnly = false,
  layoutId: customLayoutId,
  className,
  indicatorClassName,
  activeTabClassName
}: AnimatedTabsProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const generatedId = useId()
  const layoutId = customLayoutId ?? `animated-tabs-${generatedId}`

  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '')

  const isControlled = controlledActiveTab !== undefined
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalActiveTab(tabId)
      }
      onChange?.(tabId)
    },
    [isControlled, onChange]
  )

  // Intentionally no arrow-key roving-tabindex behaviour. The editor uses
  // ←/→ for video seeking; hijacking those keys whenever a tab button held
  // focus made Shift+→ both seek 5s and cycle the sidebar panel.

  const baseContainerStyles = cn(
    'relative inline-flex',
    variant === 'underline' && 'gap-1 border-border border-b',
    variant === 'pill' && 'gap-1 rounded-full bg-muted p-1',
    variant === 'segment' && 'gap-0 rounded-lg bg-white/[0.03]'
  )

  const getTabStyles = (isActive: boolean, isDisabled: boolean, isLocked: boolean): string =>
    cn(
      'relative z-10 flex items-center justify-center gap-2 font-normal text-[13px] transition-colors',
      isDisabled && 'cursor-not-allowed opacity-40',
      isLocked && 'opacity-40',
      // Segment uses tighter vertical padding to fit the recording toolbar slot.
      iconOnly ? 'px-2 py-1.5' : variant === 'segment' ? 'px-3 py-1' : 'px-4 py-2',
      'focus-visible:outline-none',
      variant === 'underline' && [
        'rounded-t-md',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      ],
      variant === 'pill' && [
        'rounded-full',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      ],
      variant === 'segment' && [
        'flex-1 rounded-lg',
        isActive ? 'text-neutral-900' : 'text-white/40 hover:text-foreground'
      ],
      isActive && activeTabClassName
    )

  const getIndicatorStyles = (): string =>
    cn(
      'absolute',
      variant === 'underline' && 'right-0 -bottom-px left-0 h-0.5 bg-[#0a84ff]',
      variant === 'pill' && 'inset-0 rounded-full bg-background shadow-sm',
      variant === 'segment' && 'inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
      indicatorClassName
    )

  return (
    <div aria-label="Tabs" className={cn(baseContainerStyles, className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const isDisabled = tab.disabled === true
        const isLocked = tab.locked === true
        const tooltipContent = tab.tooltip ?? (iconOnly ? tab.label : undefined)

        const button = (
          <button
            aria-disabled={isDisabled || isLocked}
            aria-selected={isActive}
            className={getTabStyles(isActive, isDisabled, isLocked)}
            data-testid={tab.testId}
            disabled={isDisabled}
            id={`${layoutId}-tab-${tab.id}`}
            key={tab.id}
            onClick={() => {
              if (isDisabled) return
              if (isLocked) {
                onLockedSelect?.(tab.id)
                return
              }
              handleTabChange(tab.id)
            }}
            role="tab"
            tabIndex={isDisabled || (!isActive && !isLocked) ? -1 : 0}
            type="button"
          >
            {isActive && !isDisabled && !isLocked && (
              <motion.span
                className={getIndicatorStyles()}
                layout
                layoutId={layoutId}
                style={{ originY: '0px' }}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              />
            )}
            {tab.icon && (
              <span className="relative z-10 inline-flex items-center justify-center leading-none">
                {tab.icon}
              </span>
            )}
            {!iconOnly && <span className="relative z-10">{tab.label}</span>}
            {tab.trailing && (
              <span className="relative z-10 inline-flex items-center justify-center leading-none">
                {tab.trailing}
              </span>
            )}
          </button>
        )

        if (!tooltipContent) return button
        // Segment tabs use `flex-1`, so the tooltip wrapper must take the same
        // flex slot or the tabs distribute unevenly.
        const triggerClassName = variant === 'segment' ? 'flex flex-1' : undefined
        return (
          <AnimatedTooltip
            key={tab.id}
            content={tooltipContent}
            placement="top"
            triggerClassName={triggerClassName}
          >
            {button}
          </AnimatedTooltip>
        )
      })}
    </div>
  )
}
