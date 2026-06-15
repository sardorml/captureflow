import { AnimatedToggle } from './animated-toggle'

type ToggleSwitchProps = {
  label: string
  value: boolean
  onChange: () => void
  disabled?: boolean
}

export function ToggleSwitch({
  label,
  value,
  onChange,
  disabled
}: ToggleSwitchProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-300">{label}</span>
      <AnimatedToggle
        checked={value}
        onChange={onChange}
        disabled={disabled}
        size="xs"
        label={label}
      />
    </div>
  )
}
