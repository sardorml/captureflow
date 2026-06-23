import { useRecordingStore } from '@/stores/recording-store'
import { Camera, Link2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { RecordingMode } from '../../../../shared/types'
import AnimatedTooltip from '@/components/ui/animated-tooltip'

const MODES: {
  id: RecordingMode
  icon: LucideIcon
  label: string
  tooltip: string
}[] = [
  {
    id: 'share',
    icon: Link2,
    label: 'Share',
    tooltip: 'Short clip with an instant share link'
  },
  {
    id: 'screenshot',
    icon: Camera,
    label: 'Screenshot',
    tooltip: 'One-shot screenshot with a share link'
  }
]

/**
 * Segmented control for the capture mode (Share / Screenshot) in the recording
 * toolbar. Both modes are free: CaptureFlow is open-core, so capture is never
 * feature-gated — the managed-hosting tier is the paid offering, not the
 * recorder. Mode is persisted via recording-store → localStorage.
 */
export function RecordingModeToggle(): React.JSX.Element {
  const mode = useRecordingStore((s) => s.recordingMode)
  const setMode = useRecordingStore((s) => s.setRecordingMode)

  const handleChange = (m: (typeof MODES)[number]): void => {
    setMode(m.id)
    // Screenshot mode hides the device cells; the bar reflows to match.
    window.electronAPI.toolbarResizeForMode(m.id)
  }

  return (
    <div
      className="flex items-center gap-1 rounded-[10px] bg-black/20 p-1"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {MODES.map((m) => {
        const { id, icon: Icon, label, tooltip } = m
        const active = mode === id
        return (
          <AnimatedTooltip key={id} content={tooltip} placement="bottom">
            <button
              onClick={() => handleChange(m)}
              aria-label={label}
              aria-pressed={active}
              className={`relative flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${
                active
                  ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                  : 'text-white/55 hover:text-white/85 hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </AnimatedTooltip>
        )
      })}
    </div>
  )
}
