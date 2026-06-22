import { useEffect, useRef, useState } from 'react'
import { Check, CheckCircle2 } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { AnimatedToggle } from '@/components/ui/animated-toggle'
import { setAnalyticsEnabled } from '@/lib/analytics'

const TERMS_URL = 'https://captureflow.xyz/terms'
const PRIVACY_URL = 'https://captureflow.xyz/privacy'

type PermissionStatus = {
  screen: string
  accessibility: boolean
}

export function PermissionsWindow(): React.JSX.Element {
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null)
  const [screenRequested, setScreenRequested] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const checkRef = useRef<() => Promise<void>>(async () => {})

  // Reflect the persisted choices so the toggle + agreement checkbox show the
  // right state on a re-open.
  useEffect(() => {
    void window.electronAPI.getUserPrefs().then((p) => {
      setAnalyticsEnabledState(p.analyticsEnabled)
      setAgreed(p.termsAccepted)
    })
  }, [])

  const toggleAnalytics = async (next: boolean): Promise<void> => {
    setAnalyticsEnabledState(next)
    await window.electronAPI.setUserPref('analyticsEnabled', next)
    // Apply consent immediately in this window; the prefs-changed broadcast
    // updates any others.
    const auth = await window.electronAPI.getShareAuth()
    setAnalyticsEnabled(next, auth)
  }

  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    let cancelled = false
    const tick = async (): Promise<void> => {
      const perms = await window.electronAPI.getPermissions()
      if (!cancelled) setPermissions({ screen: perms.screen, accessibility: perms.accessibility })
    }
    checkRef.current = tick
    tick()
    const interval = setInterval(tick, 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Proceed into the app. Gated behind both permissions + the ToS/Privacy
  // agreement (see the disabled state on the button below). Persists the
  // acceptance so a returning user isn't asked again.
  const handleContinue = async (): Promise<void> => {
    await window.electronAPI.setUserPref('termsAccepted', true)
    await window.electronAPI.permissionsGranted()
  }

  const requestScreenRecording = async (): Promise<void> => {
    // First click: trigger a TCC-protected call so macOS shows its native
    // prompt and registers CaptureFlow in the Screen Recording list. We can't
    // rely on `getMediaAccessStatus('screen')` to tell us whether the prompt
    // will fire — it returns 'denied' for both never-asked and explicitly-
    // denied states, so a status check would skip the call when it shouldn't.
    // Subsequent clicks fall back to opening System Settings, since macOS
    // only shows the prompt once per TCC state.
    if (!screenRequested) {
      setScreenRequested(true)
      await window.electronAPI.probeScreenRecordingPermission()
      return
    }
    window.electronAPI.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
    )
  }

  const requestAccessibility = async (): Promise<void> => {
    await window.electronAPI.requestAccessibility()
    void checkRef.current()
  }

  const screenOk = permissions?.screen === 'granted'
  const accessibilityOk = permissions?.accessibility === true
  const canContinue = screenOk && accessibilityOk && agreed

  return (
    <div className="h-screen flex flex-col items-center px-12 pt-14 pb-10 select-none relative">
      {/* Draggable title bar region */}
      <div
        className="absolute inset-x-0 top-0 h-10"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      <img src={logoImg} alt="" className="h-16 w-auto mb-7 relative" draggable={false} />

      <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-2">
        Welcome to CaptureFlow
      </h1>
      <p className="text-[13px] text-muted-foreground text-center mb-10 max-w-sm">
        CaptureFlow needs a couple of macOS permissions before it can record. Grant them once and
        you&rsquo;re set.
      </p>

      <div className="w-full max-w-md space-y-7">
        <PermissionRow
          title="Screen Recording"
          description="Required to capture your display. macOS may ask you to relaunch CaptureFlow after you allow it."
          granted={screenOk}
          buttonLabel="Allow Screen Recording"
          grantedLabel="Screen recording enabled"
          onRequest={requestScreenRecording}
        />

        <PermissionRow
          title="Accessibility"
          description="Lets CaptureFlow record cursor movement and keystrokes so the editor can show clicks and shortcuts."
          granted={accessibilityOk}
          buttonLabel="Allow Accessibility"
          grantedLabel="Accessibility access enabled"
          onRequest={requestAccessibility}
        />

        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground mb-1">Usage data</h3>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Share anonymous usage data to help improve CaptureFlow. It never includes the content of
              your recordings, and you can change this anytime in Settings.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <AnimatedToggle
              checked={analyticsEnabled}
              onChange={(next) => void toggleAnalytics(next)}
              size="sm"
              label="Usage data"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-9 flex flex-col items-center gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            aria-label="I agree to the Terms of Service and Privacy Policy"
            onClick={() => setAgreed((v) => !v)}
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
              agreed
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-muted-foreground/70 bg-white/[0.04] text-transparent hover:border-muted-foreground hover:bg-white/[0.07]'
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </button>
          <span className="text-[12.5px] text-muted-foreground">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => window.electronAPI.openExternal(TERMS_URL)}
              className="text-foreground underline underline-offset-2 hover:text-blue-300"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => window.electronAPI.openExternal(PRIVACY_URL)}
              className="text-foreground underline underline-offset-2 hover:text-blue-300"
            >
              Privacy Policy
            </button>
            .
          </span>
        </label>

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => void handleContinue()}
          className={`w-full rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors ${
            canContinue
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'cursor-not-allowed bg-card text-muted-foreground/50 border border-border'
          }`}
        >
          Accept and Continue
        </button>
      </div>
    </div>
  )
}

function PermissionRow({
  title,
  description,
  granted,
  buttonLabel,
  grantedLabel,
  onRequest
}: {
  title: string
  description: string
  granted: boolean
  buttonLabel: string
  grantedLabel: string
  onRequest: () => void
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-6">
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0 pt-1">
        {granted ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-medium text-emerald-400">{grantedLabel}</span>
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="rounded-lg border border-border bg-card px-4 py-2 text-[12.5px] font-medium text-foreground hover:bg-accent transition-colors"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  )
}
