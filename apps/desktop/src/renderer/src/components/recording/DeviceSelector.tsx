import { SmoothSelect } from '@/components/ui/smooth-select'

type DeviceSelectorProps = {
  label: string
  devices: { deviceId: string; label: string }[]
  selectedDeviceId: string | null
  onSelect: (deviceId: string | null) => void
  placeholder?: string
  icon?: React.ReactNode
  align?: 'left' | 'right'
}

export function DeviceSelector({
  label,
  devices,
  selectedDeviceId,
  onSelect,
  placeholder = 'None',
  icon,
  align = 'left'
}: DeviceSelectorProps): React.JSX.Element {
  const options = [
    { value: 'none', label: 'None' },
    ...devices.map((device) => ({
      value: device.deviceId,
      label: device.label
    }))
  ]

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <SmoothSelect
        value={selectedDeviceId ?? 'none'}
        onValueChange={(v) => onSelect(v === 'none' ? null : v)}
        options={options}
        placeholder={placeholder}
        align={align}
      />
    </div>
  )
}
