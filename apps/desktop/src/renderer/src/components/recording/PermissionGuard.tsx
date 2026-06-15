import { useEffect, useRef, useState } from 'react'
import { Monitor, MousePointer2, CheckCircle2 } from 'lucide-react'
import { SmoothButton } from '@/components/ui/smooth-button'
import logoImg from '@/assets/logo.png'

type PermissionStatus = {
  screen: string
  accessibility: boolean
}

type PermissionGuardProps = {
  children: React.ReactNode
}

const ONBOARDING_KEY = 'captureflow-onboarding-complete'

export function PermissionGuard({ children }: PermissionGuardProps): React.JSX.Element {
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null)
  const [checking, setChecking] = useState(true)
  const [onboarded, setOnboarded] = useState(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === '1'
    if (done) {
      window.electronAPI.resizeWindow({ width: 520, height: 720, minWidth: 520, minHeight: 720 })
    }
    return done
  })

  const checkRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    let cancelled = false
    const tick = async (): Promise<void> => {
      const perms = await window.electronAPI.getPermissions()
      if (cancelled) return
      setPermissions({ screen: perms.screen, accessibility: perms.accessibility })
      setChecking(false)
    }
    checkRef.current = tick
    tick()
    const interval = setInterval(tick, 2000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const openScreenRecordingSettings = (): void => {
    window.electronAPI.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
    )
  }

  const requestAccessibility = async (): Promise<void> => {
    await window.electronAPI.requestAccessibility()
    void checkRef.current()
  }

  if (checking) return <>{children}</>

  const screenOk = permissions?.screen === 'granted'
  const accessibilityOk = permissions?.accessibility === true
  const allGranted = screenOk && accessibilityOk

  if (onboarded && allGranted) return <>{children}</>

  const handleContinue = (): void => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    window.electronAPI.resizeWindow({ width: 520, height: 720, minWidth: 520, minHeight: 720 })
    setOnboarded(true)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-10 pb-8">
      {/* Logo */}
      <img src={logoImg} alt="" className="h-14 w-auto mb-8" />

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
        Welcome to CaptureFlow!
      </h2>
      <p className="text-[13px] text-muted-foreground text-center mb-10 max-w-xs">
        Before you can start recording, we need to ask you for a few permissions.
      </p>

      {/* Permission rows */}
      <div className="w-full max-w-md space-y-6">
        <PermissionRow
          icon={<Monitor className="w-5 h-5" />}
          title="Screen Recording"
          description="CaptureFlow needs to capture video of your screen. You might need to restart the app after granting it."
          granted={screenOk}
          buttonLabel="Allow Screen Recording"
          onRequest={openScreenRecordingSettings}
        />

        <PermissionRow
          icon={<MousePointer2 className="w-5 h-5" />}
          title="Accessibility"
          description="CaptureFlow needs accessibility access to track your cursor position and clicks during recording."
          granted={accessibilityOk}
          buttonLabel="Allow Accessibility"
          onRequest={requestAccessibility}
        />
      </div>

      {/* Continue button */}
      <SmoothButton
        variant="candy"
        size="lg"
        disabled={!allGranted}
        onClick={handleContinue}
        className="mt-10 rounded-full px-8 text-[15px] font-semibold"
      >
        Continue
      </SmoothButton>
    </div>
  )
}

function PermissionRow({
  icon,
  title,
  description,
  granted,
  buttonLabel,
  onRequest
}: {
  icon: React.ReactNode
  title: string
  description: string
  granted: boolean
  buttonLabel: string
  onRequest: () => void
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-5">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={granted ? 'text-blue-400' : 'text-muted-foreground'}>{icon}</span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">
        {granted ? (
          <div className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Granted</span>
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="rounded-lg border border-border bg-card px-5 py-2 text-[13px] font-medium text-blue-400 hover:bg-accent transition-colors"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  )
}
