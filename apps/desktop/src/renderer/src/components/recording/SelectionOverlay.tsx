import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Camera, Circle, Lock, Sparkles, WifiOff } from 'lucide-react'
import { track } from '../../lib/analytics'
import type {
  ShareAuthState,
  ShareConnectivityState,
  ShareUsageState,
  SelectionOverlayMode,
  WindowBounds,
  CaptureSource
} from '../../../../shared/types'

const OVERLAY_BG = 'bg-gray-800/50'
const RECORD_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg ' +
  'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.985] ' +
  'text-white text-base font-semibold transition-colors select-none ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

// Reads the recording mode set by the toolbar via localStorage. Same
// origin → same storage area, so the overlay (loaded as a separate
// BrowserWindow under the same renderer build) sees the value the
// toolbar wrote when the user toggled Share / Screenshot.
function readRecordingMode(): 'share' | 'screenshot' {
  try {
    const v = localStorage.getItem('captureflow-mode')
    if (v === 'screenshot') return 'screenshot'
    return 'share'
  } catch {
    return 'share'
  }
}

// Reactive form of `readRecordingMode`. The toolbar writes
// `captureflow-mode` on every toggle and storage events fire cross-window
// (same origin), so the overlay re-renders whenever the user flips
// Share / Screenshot in the toolbar — keeps "Start recording" vs
// "Capture" copy and the snap-vs-record overlay variants in sync
// without an explicit IPC message.
function useRecordingMode(): 'share' | 'screenshot' {
  const [mode, setMode] = useState<'share' | 'screenshot'>(readRecordingMode)
  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (e.key === 'captureflow-mode') setMode(readRecordingMode())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  return mode
}

// Hook: current share-auth + connectivity + usage + recording-mode +
// a derived `locked` flag. Locked iff the user picked Share mode AND
// any of (a) no captureflow.xyz session, (b) can't reach
// captureflow.xyz, (c) per-device storage cap reached.
// `lockReason` lets the button + modal differ between "sign in",
// "no internet", and "quota reached" while sharing the lock affordance.
// Screenshot mode bypasses the gate — it has its own snap pipeline.
type LockReason = 'auth' | 'offline' | 'quota' | null

function useShareLockState(): {
  locked: boolean
  lockReason: LockReason
  auth: ShareAuthState
  usage: ShareUsageState
  reloadAuth: () => void
} {
  const [auth, setAuth] = useState<ShareAuthState>({ kind: 'signed_out' })
  const [connectivity, setConnectivity] = useState<ShareConnectivityState>('online')
  const [usage, setUsage] = useState<ShareUsageState>({ kind: 'unknown' })
  const [mode, setMode] = useState<'share' | 'screenshot'>(readRecordingMode)

  useEffect(() => {
    void window.electronAPI.getShareAuth().then(setAuth)
    const unsub = window.electronAPI.onShareAuthChanged(setAuth)
    return unsub
  }, [])

  useEffect(() => {
    void window.electronAPI.getShareConnectivity().then(setConnectivity)
    const unsub = window.electronAPI.onShareConnectivityChanged(setConnectivity)
    return unsub
  }, [])

  useEffect(() => {
    // Pull the current snapshot AND kick a fresh probe in parallel —
    // main also refreshes on overlay open, but issuing one from here
    // guarantees a flip when the overlay is reused inside the same
    // window (no SELECTION_OVERLAY_INIT event needed).
    void window.electronAPI.getShareUsage().then(setUsage)
    void window.electronAPI.refreshShareUsage()
    const unsub = window.electronAPI.onShareUsageChanged(setUsage)
    return unsub
  }, [])

  useEffect(() => {
    // The toolbar writes 'captureflow-mode' on every toggle. Storage events
    // fire only on cross-window writes (same origin) — perfect for our
    // toolbar → overlay handoff.
    const onStorage = (e: StorageEvent): void => {
      if (e.key === 'captureflow-mode') setMode(readRecordingMode())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const reloadAuth = useCallback(() => {
    void window.electronAPI.getShareAuth().then(setAuth)
  }, [])

  // Offline takes precedence over auth and quota — if the network is
  // down none of the other states are actionable. Auth comes next so a
  // signed-out user sees the sign-in prompt instead of a quota message
  // they couldn't act on without the dashboard anyway. Screenshot
  // mode uploads via the same account-scoped quota as Share, so the
  // same three locks apply.
  let lockReason: LockReason = null
  if (mode === 'share' || mode === 'screenshot') {
    if (connectivity === 'offline') lockReason = 'offline'
    else if (auth.kind === 'signed_out') lockReason = 'auth'
    else if (usage.kind === 'known' && usage.capReached) lockReason = 'quota'
  }

  return {
    locked: lockReason !== null,
    lockReason,
    auth,
    usage,
    reloadAuth
  }
}

type LockableRecordButtonProps = {
  loading: boolean
  disabled?: boolean
  onStart: () => void | Promise<void>
  // Forwarded so the area-overlay can paint the button inside a
  // pointer-events container without rebuilding the wrapper here.
  style?: React.CSSProperties
  // Switches the button's idle label + icon between the recording
  // pipeline and screenshot capture. Lock states (auth/offline/quota)
  // override both — they share the same upgrade / sign-in flow.
  variant?: 'record' | 'snap'
}

// Shared button used by every overlay variant. When `locked` it paints
// a Lock (auth) or WifiOff (offline) icon + matching copy and
// intercepts the click to open the appropriate modal — the underlying
// `onStart` never fires from the locked state, so the caller's
// recording handler doesn't have to know about auth or connectivity.
function LockableRecordButton(props: LockableRecordButtonProps): React.JSX.Element {
  const { locked, lockReason, usage } = useShareLockState()
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [offlinePromptOpen, setOfflinePromptOpen] = useState(false)
  const [quotaPromptOpen, setQuotaPromptOpen] = useState(false)
  const variant = props.variant ?? 'record'

  const handleClick = (e: React.MouseEvent): void => {
    // Window overlay listens for clicks on the surrounding cutout div
    // to (re)lock the selected window. The record button sits inside
    // that div, so the click would re-trigger selection on the way up
    // without an explicit stop.
    e.stopPropagation()
    if (lockReason === 'offline') {
      setOfflinePromptOpen(true)
      return
    }
    if (lockReason === 'auth') {
      setAuthPromptOpen(true)
      return
    }
    if (lockReason === 'quota') {
      setQuotaPromptOpen(true)
      return
    }
    void props.onStart()
  }

  const idleLabel = variant === 'snap' ? 'Capture' : 'Start recording'
  const idleAria = variant === 'snap' ? 'Capture screenshot' : 'Start recording'
  const label = props.loading
    ? variant === 'snap'
      ? 'Capturing…'
      : 'Preparing...'
    : lockReason === 'offline'
      ? 'No internet'
      : lockReason === 'auth'
        ? variant === 'snap'
          ? 'Sign in to capture'
          : 'Sign in to record'
        : lockReason === 'quota'
          ? 'Storage limit reached'
          : idleLabel
  const ariaLabel =
    lockReason === 'offline'
      ? variant === 'snap'
        ? 'Cannot capture while offline'
        : 'Cannot record while offline'
      : lockReason === 'auth'
        ? variant === 'snap'
          ? 'Sign in to capture a screenshot'
          : 'Sign in to start recording'
        : lockReason === 'quota'
          ? 'Storage limit reached — upgrade or delete a share to keep capturing'
          : idleAria

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={props.loading || props.disabled}
        className={RECORD_BUTTON_CLASS}
        style={props.style}
        aria-label={ariaLabel}
      >
        {props.loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x="7"
                y="1"
                width="2"
                height="4"
                rx="1"
                fill="white"
                opacity={0.15 + (i / 8) * 0.85}
                transform={`rotate(${i * 45} 8 8)`}
              />
            ))}
          </svg>
        ) : lockReason === 'offline' ? (
          <WifiOff className="w-4 h-4" />
        ) : locked ? (
          <Lock className="w-4 h-4" />
        ) : variant === 'snap' ? (
          <Camera className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4 fill-current" />
        )}
        {label}
      </button>
      {authPromptOpen ? <LoginPromptModal onClose={() => setAuthPromptOpen(false)} /> : null}
      {offlinePromptOpen ? <NoInternetModal onClose={() => setOfflinePromptOpen(false)} /> : null}
      {quotaPromptOpen ? (
        <QuotaReachedModal usage={usage} onClose={() => setQuotaPromptOpen(false)} />
      ) : null}
    </>
  )
}

// Painted on top of the dim selection overlay when the device is at
// or above the per-device storage cap. Two CTAs: "Upgrade to Pro"
// opens the Lemon Squeezy checkout (the route is baked at build
// time), "Manage shares" punts to captureflow.xyz where the user
// can delete existing recordings to free up the cap. Either action
// drops the overlay so the user can interact with the browser.
function QuotaReachedModal({
  usage,
  onClose
}: {
  usage: ShareUsageState
  onClose: () => void
}): React.JSX.Element {
  const [pendingUpgrade, setPendingUpgrade] = useState(false)
  const [pendingManage, setPendingManage] = useState(false)

  const handleUpgrade = async (): Promise<void> => {
    if (pendingUpgrade) return
    setPendingUpgrade(true)
    try {
      track('pro_upgrade_clicked', { source: 'selection_overlay' })
      await window.electronAPI.openShareUpgradeCheckout()
      await window.electronAPI.closeSelectionOverlay()
    } finally {
      setPendingUpgrade(false)
      onClose()
    }
  }

  const handleManage = async (): Promise<void> => {
    if (pendingManage) return
    setPendingManage(true)
    try {
      await window.electronAPI.openExternal('https://captureflow.xyz')
      await window.electronAPI.closeSelectionOverlay()
    } finally {
      setPendingManage(false)
      onClose()
    }
  }

  const usedLabel = usage.kind === 'known' ? formatBytes(usage.usedBytes) : null
  const limitLabel = usage.kind === 'known' ? formatBytes(usage.limitBytes) : null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[440px] rounded-2xl bg-neutral-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
            <Sparkles className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">
            You&apos;ve reached the storage limit
          </h2>
        </div>
        {usedLabel && limitLabel ? (
          <p className="text-sm leading-relaxed text-white/70">
            Your free share storage is full ({usedLabel} of {limitLabel}). Upgrade to Pro to keep
            recording without limits, or delete an old share to free up room.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-white/70">
            Your free share storage is full. Upgrade to Pro to keep recording without limits, or
            delete an old share to free up room.
          </p>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white disabled:opacity-60"
            onClick={handleManage}
            disabled={pendingManage}
          >
            {pendingManage ? 'Opening…' : 'Manage shares'}
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            onClick={handleUpgrade}
            disabled={pendingUpgrade}
          >
            {pendingUpgrade ? 'Opening…' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

// Three-second countdown surfaced before sendSelectionResult fires.
// Replaces the old "give H.264 encoder time to release" silent sleep
// with a visible cue so the user can finish positioning their cursor
// (or switch app) before the recording actually starts. The hook
// resolves AFTER the final tick AND after the renderer has committed
// the cleared-countdown frame — without that wait the overlay window
// would hide mid-paint and re-open later showing a stale "1".
function useRecordCountdown(): {
  countdown: number | null
  runCountdown: () => Promise<{ ok: boolean }>
  cancelCountdown: () => void
} {
  const [countdown, setCountdown] = useState<number | null>(null)
  // Mutable cancel flag so an in-flight countdown can short-circuit
  // before its caller fires sendSelectionResult. Without this, the
  // setTimeout chain keeps running after the overlay window is
  // hidden (Escape, cancelled by main) and the recording starts
  // 1–3 s after the user thought they cancelled.
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false })

  const runCountdown = useCallback(async (): Promise<{ ok: boolean }> => {
    cancelRef.current = { cancelled: false }
    for (let n = 3; n >= 1; n -= 1) {
      if (cancelRef.current.cancelled) {
        setCountdown(null)
        return { ok: false }
      }
      setCountdown(n)
      // 1s per tick — slow enough to read, fast enough that the user
      // doesn't lose patience. Total 3s matches the H.264 encoder
      // settle time we were sleeping for silently before, so this
      // doesn't add net latency to the recording start.
      await new Promise((r) => setTimeout(r, 1000))
    }
    if (cancelRef.current.cancelled) {
      setCountdown(null)
      return { ok: false }
    }
    setCountdown(null)
    // Wait two animation frames so React commits the null-state
    // unmount to the WebContents framebuffer before the caller hides
    // the overlay window. Hidden BrowserWindows preserve their last
    // paint, and on the next open the stale paint is shown until
    // React re-renders — the user sees a flash of "1" when they
    // open the picker again after a recording.
    await new Promise((r) => requestAnimationFrame(() => r(undefined)))
    await new Promise((r) => requestAnimationFrame(() => r(undefined)))
    return { ok: true }
  }, [])

  const cancelCountdown = useCallback((): void => {
    cancelRef.current.cancelled = true
    setCountdown(null)
  }, [])

  return { countdown, runCountdown, cancelCountdown }
}

// Giant spring-scaled digit painted over the selection overlay. Each
// tick keys a fresh <motion.span> so AnimatePresence cross-fades the
// old digit out as the new one springs in — gives the count a
// cinematic "punch" instead of a flat re-render. The container
// ignores pointer events so any underlying picker still receives
// hover/leave updates while the count runs.
//
// Unmounts synchronously when `value` is null. Letting AnimatePresence
// play an exit animation on the final digit would keep "1" painted
// for the duration of its fade-out — the overlay window hides during
// that fade, freezing the partial digit in the WebContents, and the
// next overlay open flashes it. The very last exit is invisible to
// the user anyway (window is already on its way out), so dropping it
// costs nothing visually and fixes the flash.
function CountdownOverlay({ value }: { value: number | null }): React.JSX.Element | null {
  if (value === null) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" style={{ backdropFilter: 'blur(6px)' }} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1.85, opacity: 0, filter: 'blur(28px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0.55, opacity: 0, filter: 'blur(16px)' }}
          transition={{
            scale: { type: 'spring', stiffness: 240, damping: 18, mass: 0.9 },
            opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          }}
          className="relative font-semibold text-white tabular-nums select-none"
          style={{
            fontSize: 'min(38vw, 38vh)',
            lineHeight: 1,
            textShadow: '0 12px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.45)'
          }}
          aria-live="polite"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// Painted on top of the dim selection overlay when the user tries to
// record while captureflow.xyz is unreachable. Recording
// without a network round-trip would just leave them at the
// share-ready modal's failed state with a cryptic "fetch failed", so
// we block earlier here. The connectivity probe ticks every 15s
// (validateShareAuth in main) — once the network comes back the lock
// clears and the modal can stay dismissed.
function NoInternetModal({ onClose }: { onClose: () => void }): React.JSX.Element {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-2xl bg-neutral-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
            <WifiOff className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">No internet connection</h2>
        </div>
        <p className="text-sm leading-relaxed text-white/70">
          CaptureFlow couldn&apos;t reach captureflow.xyz, so a share link can&apos;t be created right
          now.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Check your Wi-Fi or wired connection. The lock will clear automatically once we&apos;re
          back online.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal painted on top of the dim selection overlay. Explains why an
// account is required and routes the user to captureflow.xyz via
// the main process (which opens it in the default browser). Once the
// browser flow finishes, the captureflow:// deep link fires SHARE_AUTH_CHANGED
// and the lock icon clears on its own — no modal state needs to follow
// the flow back; the user just clicks Start again.
function LoginPromptModal({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [pending, setPending] = useState(false)
  const handleSignIn = async (): Promise<void> => {
    if (pending) return
    setPending(true)
    try {
      await window.electronAPI.signInShareAuth()
      // Drop the selection overlay so the user can interact with the
      // browser — the overlay window sits at screen-saver level + is
      // visible across Spaces, which obscures Chrome/Safari otherwise.
      // The user picks Share again after signing in; the lock will
      // already be cleared because SHARE_AUTH_CHANGED fired in the
      // toolbar window via the deep-link handler.
      await window.electronAPI.closeSelectionOverlay()
    } finally {
      setPending(false)
      onClose()
    }
  }
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-2xl bg-neutral-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
            <Lock className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">Sign in to share a recording</h2>
        </div>
        <p className="text-sm leading-relaxed text-white/70">
          A CaptureFlow account lets you manage your share links — rename them, set visibility, and
          delete the ones you no longer need.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          We&apos;ll open <span className="text-white">captureflow.xyz</span> in your browser.
          After you sign in or create an account, the desktop app will reconnect automatically.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            disabled={pending}
            onClick={handleSignIn}
          >
            {pending ? 'Opening…' : 'Open browser to sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

type OverlayInit = {
  mode: SelectionOverlayMode
  displayName: string
  displayWidth: number
  displayHeight: number
  displayRefreshRate: number
  sources: CaptureSource[]
  hasCamera: boolean
  hasMic: boolean
}

/**
 * Verify camera/mic permissions before the user commits to recording.
 * The macOS TCC pane is opened via the existing requestMediaPermission
 * dialog when access has been revoked since the device was selected.
 * Returns false if the user cancels or permission still isn't granted.
 *
 * Closes the selection overlay before raising any dialog so the user
 * isn't looking at a dim screen behind the alert.
 */
async function ensureRecordingPermissions(init: OverlayInit): Promise<boolean> {
  if (!init.hasCamera && !init.hasMic) return true
  const perms = await window.electronAPI.getPermissions()
  const needsCamera = init.hasCamera && perms.camera !== 'granted'
  const needsMic = init.hasMic && perms.microphone !== 'granted'
  if (!needsCamera && !needsMic) return true

  // Hide the dimmed picker before the native dialog appears.
  await window.electronAPI.closeSelectionOverlay()

  if (needsCamera) {
    const ok = await window.electronAPI.requestMediaPermission('camera')
    if (!ok) return false
  }
  if (needsMic) {
    const ok = await window.electronAPI.requestMediaPermission('microphone')
    if (!ok) return false
  }
  return true
}

type HoveredWindow = {
  id: number
  name: string
  owner: string
  pid: number
  bounds: WindowBounds
  cornerRadius?: number
  iconBase64?: string
}

// Per-display toggles persist across sessions: most users keep the same
// preference once they've decided whether they want a clean desktop. Stored
// as '1' / '0' strings to match how the recording-store handles bools.
const HIDE_DESKTOP_STORAGE_KEY = 'captureflow-hide-desktop'

function loadBoolPref(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function savePref(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // localStorage unavailable — preference will reset next launch, harmless.
  }
}

function CleanRecordingToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={
        'group flex items-center gap-3 px-4 py-2.5 rounded-lg w-72 text-left ' +
        'bg-black/70 hover:bg-black/80 transition-colors select-none'
      }
    >
      <span
        className={
          'relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ' +
          (checked ? 'bg-blue-500' : 'bg-white/20')
        }
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
      <span className="flex flex-col">
        <span className="text-white text-sm font-medium leading-tight">{label}</span>
        <span className="text-white/55 text-xs leading-tight mt-0.5">{description}</span>
      </span>
    </button>
  )
}

function DisplayOverlay({ init }: { init: OverlayInit }): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [hideDesktopIcons, setHideDesktopIcons] = useState(() =>
    loadBoolPref(HIDE_DESKTOP_STORAGE_KEY)
  )
  const { countdown, runCountdown, cancelCountdown } = useRecordCountdown()
  const sourcesReady = init.sources.length > 0
  const isSnap = useRecordingMode() === 'screenshot'

  // Cancel any in-flight countdown the moment main signals overlay
  // reset (Escape, cancelSelectionOverlay) so the recording doesn't
  // fire after the user thought they bailed.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlayReset(() => {
      cancelCountdown()
      setLoading(false)
    })
  }, [cancelCountdown])

  const handleHideDesktopChange = (next: boolean): void => {
    setHideDesktopIcons(next)
    savePref(HIDE_DESKTOP_STORAGE_KEY, next)
  }

  const handleRecord = async (): Promise<void> => {
    if (loading || !sourcesReady) return
    // Permission gate runs first so the user sees the deep-link dialog
    // before the loading spinner kicks in.
    if (!(await ensureRecordingPermissions(init))) return
    setLoading(true)
    const screenSource = init.sources.find((s) => s.displayId !== '')
    if (!screenSource) return

    // Screenshot mode short-circuits the recording flow: no countdown,
    // no sendSelectionResult — just capture the chosen display now
    // and let main handle upload + notification.
    if (isSnap) {
      const displayIdNum = parseInt(screenSource.displayId, 10)
      if (Number.isFinite(displayIdNum)) {
        await window.electronAPI.captureScreenshot({
          kind: 'display',
          displayId: displayIdNum
        })
      }
      return
    }

    // Fire share-prep BEFORE the countdown so shareStart + system
    // audio acquisition can overlap with the visible 3 s wait. By the
    // time the countdown reaches 0 the share session is ready and
    // the native recorder starts immediately — no post-countdown
    // "preparing share…" delay. Screenshot mode ignores this signal in
    // the toolbar's useRecorder hook.
    window.electronAPI.notifySharePrepStart()

    // 3-second countdown doubles as the H.264 encoder release window
    // (the recorder needs ~1s; we get 3 for free, visibly).
    const result = await runCountdown()
    if (!result.ok) {
      window.electronAPI.notifySharePrepCancel()
      setLoading(false)
      return
    }
    window.electronAPI.sendSelectionResult({
      ...screenSource,
      hideDesktopIcons
    })
  }

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Fade the picker chrome out under the countdown so the giant
  // number is the only thing the user sees in the final seconds.
  const counting = countdown !== null

  return (
    <div
      className={`h-screen w-screen flex flex-col items-center justify-center ${OVERLAY_BG}`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 100ms ease-out' }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          opacity: counting ? 0 : 1,
          transform: counting ? 'scale(0.96)' : 'scale(1)',
          transition: 'opacity 220ms ease-out, transform 220ms ease-out'
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">{init.displayName}</h1>
        <p className="text-lg text-white mb-6">
          {isSnap
            ? `${init.displayWidth}×${init.displayHeight}`
            : `${init.displayWidth}×${init.displayHeight} · ${init.displayRefreshRate}FPS`}
        </p>
        {!isSnap && (
          <div className="flex flex-col gap-2 mb-8">
            <CleanRecordingToggle
              label="Hide desktop items"
              description="Hides files and folders on the desktop"
              checked={hideDesktopIcons}
              onChange={handleHideDesktopChange}
            />
          </div>
        )}
        <LockableRecordButton
          loading={loading}
          disabled={!sourcesReady}
          onStart={handleRecord}
          variant={isSnap ? 'snap' : 'record'}
        />
      </div>
      <CountdownOverlay value={countdown} />
    </div>
  )
}

function WindowOverlay({ init }: { init: OverlayInit }): React.JSX.Element {
  const [hovered, setHovered] = useState<HoveredWindow | null>(null)
  const [locked, setLocked] = useState<HoveredWindow | null>(null)
  const [loading, setLoading] = useState(false)
  const { countdown, runCountdown, cancelCountdown } = useRecordCountdown()
  const lastQueryRef = useRef(0)
  const isSnap = useRecordingMode() === 'screenshot'

  // Same cancellation path as DisplayOverlay — Escape / overlay
  // cancellation by main should abort the pending countdown so the
  // recording doesn't fire after the user thought they bailed.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlayReset(() => {
      cancelCountdown()
      setLoading(false)
    })
  }, [cancelCountdown])

  const queryIdRef = useRef(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Once a window is locked in by a click, ignore further hover updates
      // so moving the cursor toward the Start button can't change selection.
      if (locked) return
      const now = Date.now()
      if (now - lastQueryRef.current < 80) return
      lastQueryRef.current = now

      const id = ++queryIdRef.current
      const screenX = e.screenX
      const screenY = e.screenY

      window.electronAPI.getWindowAtPoint(screenX, screenY).then((result) => {
        // Ignore stale responses from cancelled queries
        if (id !== queryIdRef.current) return
        setHovered(result)
      })
    },
    [locked]
  )

  const target = locked ?? hovered

  const handleSelect = (e: React.MouseEvent): void => {
    // Click on the highlighted window area locks the selection; further
    // hover events are ignored until the user unlocks (click background).
    e.stopPropagation()
    if (!hovered || locked) return
    setLocked(hovered)
  }

  const handleUnlock = (): void => {
    if (locked && !loading) setLocked(null)
  }

  const sourcesReady = init.sources.length > 0

  const handleStart = async (): Promise<void> => {
    // stopPropagation was historically here to keep the cutout's
    // onClick from re-locking the already-locked target on the same
    // click. LockableRecordButton now stops propagation in its own
    // onClick, so this handler can stay event-agnostic.
    if (!target || loading || !sourcesReady) return
    // Permission gate runs before the loading state so any deep-link
    // dialog shows immediately on click.
    if (!(await ensureRecordingPermissions(init))) return
    setLoading(true)
    // Find matching source from desktopCapturer by matching window name + owner
    const matchingSource = init.sources.find((s) => {
      if (s.displayId !== '') return false
      return s.name === target.name || s.name === target.owner
    })
    if (matchingSource) {
      // Screenshot mode: fire captureScreenshot with the window id;
      // skip countdown + sendSelectionResult entirely.
      if (isSnap) {
        const windowIdNum = parseInt(matchingSource.id.split(':')[1] ?? '', 10)
        if (Number.isFinite(windowIdNum)) {
          await window.electronAPI.captureScreenshot({
            kind: 'window',
            windowId: windowIdNum
          })
        }
        return
      }

      // Kick off share prep in parallel with the countdown — see the
      // display-picker handleRecord above for the rationale.
      window.electronAPI.notifySharePrepStart()
      // 3-second visible countdown also covers the H.264 encoder's
      // settle window from a prior session.
      const result = await runCountdown()
      if (!result.ok) {
        window.electronAPI.notifySharePrepCancel()
        setLoading(false)
        return
      }
      // Include the full window bounds (with title bar) for the dim overlay
      window.electronAPI.sendSelectionResult({
        ...matchingSource,
        windowBounds: target.bounds,
        ownerName: target.owner,
        cornerRadius: target.cornerRadius,
        pid: target.pid
      })
    }
  }

  // Overlay window's own position for coordinate conversion. The overlay
  // fills the screen, so bounds.x/y = display.bounds.x/y; client coords =
  // screen coords - overlay position. Sampled lazily at mount time since the
  // overlay window doesn't move while the picker is open.
  const [overlayBounds] = useState(() => ({
    x: window.screenX || 0,
    y: window.screenY || 0
  }))

  // Keep last known bounds in state so we can hold the cutout in place during
  // the fade-out frame after target clears. Updated inline during render via
  // the prev-state pattern when target is non-null.
  const [lastBounds, setLastBounds] = useState(
    target?.bounds ?? { x: 0, y: 0, width: 0, height: 0 }
  )
  if (target && target.bounds !== lastBounds) {
    setLastBounds(target.bounds)
  }
  const bounds = target ? target.bounds : lastBounds

  const cutoutLeft = bounds.x - overlayBounds.x
  const cutoutTop = bounds.y - overlayBounds.y
  const counting = countdown !== null

  return (
    <div
      className="h-screen w-screen relative cursor-crosshair"
      onMouseMove={handleMouseMove}
      onClick={handleUnlock}
    >
      {/* Full-screen dim — always visible */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      {/* Blue overlay on hovered/locked window */}
      {target && (
        <div
          className={`absolute ${OVERLAY_BG} flex flex-col items-center justify-center transition-shadow`}
          style={{
            left: cutoutLeft,
            top: cutoutTop,
            width: bounds.width,
            height: bounds.height,
            borderRadius: target?.cornerRadius ?? 10,
            cursor: locked ? 'default' : 'pointer',
            boxShadow: locked ? 'inset 0 0 0 2px rgba(255,255,255,0.85)' : 'none'
          }}
          onClick={handleSelect}
        >
          <div
            className="flex flex-col items-center"
            style={{
              opacity: counting ? 0 : 1,
              transition: 'opacity 220ms ease-out'
            }}
          >
            {target.iconBase64 && (
              <img
                key={target.id}
                src={`data:image/png;base64,${target.iconBase64}`}
                alt=""
                className="w-24 h-24 drop-shadow-lg animate-[icon-sway_3.5s_ease-in-out_infinite] mb-3"
              />
            )}
            <p className="text-white text-3xl font-semibold drop-shadow-lg mb-3">{target.owner}</p>
            {locked && (
              <LockableRecordButton
                loading={loading}
                disabled={!sourcesReady}
                onStart={() => handleStart()}
                variant={isSnap ? 'snap' : 'record'}
              />
            )}
          </div>
        </div>
      )}

      {/* Hint text */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: counting ? 0 : 1,
          transition: 'opacity 220ms ease-out'
        }}
      >
        <p className="text-white/50 text-sm">
          {locked
            ? isSnap
              ? 'Click "Capture" — or click outside to pick a different window'
              : 'Click "Start recording" — or click outside to pick a different window'
            : hovered
              ? 'Click the window to select it'
              : 'Hover over a window to select it'}
        </p>
      </div>
      <CountdownOverlay value={countdown} />
    </div>
  )
}

type Rect = { x: number; y: number; width: number; height: number }

const AREA_MIN_PX = 80

function AreaOverlay({ init }: { init: OverlayInit }): React.JSX.Element {
  const isSnap = useRecordingMode() === 'screenshot'
  if (isSnap) {
    return <SnapAreaOverlay init={init} />
  }
  return <RecordAreaOverlay init={init} />
}

function RecordAreaOverlay({ init }: { init: OverlayInit }): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const { countdown, runCountdown, cancelCountdown } = useRecordCountdown()

  // Same cancellation path as the other overlays — Escape / overlay
  // cancellation by main should abort the pending countdown so the
  // recording doesn't fire after the user thought they bailed.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlayReset(() => {
      cancelCountdown()
      setLoading(false)
    })
  }, [cancelCountdown])
  // Default selection: 60% of screen, centered. Stored in CSS pixels — the
  // overlay window matches the display so this is also the screen-coords frame.
  const [rect, setRect] = useState<Rect>(() => {
    const w = Math.round(window.innerWidth * 0.6)
    const h = Math.round(window.innerHeight * 0.6)
    return {
      x: Math.round((window.innerWidth - w) / 2),
      y: Math.round((window.innerHeight - h) / 2),
      width: w,
      height: h
    }
  })
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const startDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    mode: 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
  ): void => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startRect = rect
    const W = window.innerWidth
    const H = window.innerHeight
    const onMove = (ev: PointerEvent): void => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let { x, y, width, height } = startRect
      if (mode === 'move') {
        x = Math.max(0, Math.min(W - width, startRect.x + dx))
        y = Math.max(0, Math.min(H - height, startRect.y + dy))
      } else {
        if (mode.includes('e')) {
          width = Math.max(AREA_MIN_PX, Math.min(W - startRect.x, startRect.width + dx))
        }
        if (mode.includes('s')) {
          height = Math.max(AREA_MIN_PX, Math.min(H - startRect.y, startRect.height + dy))
        }
        if (mode.includes('w')) {
          const newW = Math.max(
            AREA_MIN_PX,
            Math.min(startRect.x + startRect.width, startRect.width - dx)
          )
          x = startRect.x + startRect.width - newW
          width = newW
        }
        if (mode.includes('n')) {
          const newH = Math.max(
            AREA_MIN_PX,
            Math.min(startRect.y + startRect.height, startRect.height - dy)
          )
          y = startRect.y + startRect.height - newH
          height = newH
        }
      }
      setRect({ x, y, width, height })
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const sourcesReady = init.sources.length > 0

  const handleStart = async (): Promise<void> => {
    if (loading || !sourcesReady) return
    // Permission gate runs before the loading state so any deep-link
    // dialog shows immediately on click.
    if (!(await ensureRecordingPermissions(init))) return
    setLoading(true)
    const screenSource = init.sources.find((s) => s.displayId !== '')
    if (!screenSource) return

    // Convert CSS-pixel area rect to screen coordinates by adding the overlay
    // window's origin (which is also the display origin).
    const originX = window.screenX || 0
    const originY = window.screenY || 0
    const windowBounds = {
      x: rect.x + originX,
      y: rect.y + originY,
      width: rect.width,
      height: rect.height
    }

    // Kick off share prep in parallel with the countdown — see the
    // display-picker handleRecord above for the rationale.
    window.electronAPI.notifySharePrepStart()
    // 3-second visible countdown also covers the H.264 encoder's
    // settle window from a prior session.
    const result = await runCountdown()
    if (!result.ok) {
      window.electronAPI.notifySharePrepCancel()
      setLoading(false)
      return
    }
    window.electronAPI.sendSelectionResult({
      ...screenSource,
      windowBounds
    })
  }

  // Four non-overlapping dim strips around the selection so corners aren't
  // double-darkened (same trick as the editor's CropWindow).
  return (
    <div
      className="h-screen w-screen relative cursor-crosshair"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 100ms ease-out' }}
    >
      <div className="absolute left-0 right-0 top-0 bg-black/45" style={{ height: rect.y }} />
      <div
        className="absolute left-0 right-0 bg-black/45"
        style={{ top: rect.y + rect.height, bottom: 0 }}
      />
      <div
        className="absolute left-0 bg-black/45"
        style={{ top: rect.y, height: rect.height, width: rect.x }}
      />
      <div
        className="absolute right-0 bg-black/45"
        style={{ top: rect.y, height: rect.height, left: rect.x + rect.width }}
      />

      {/* Selection rectangle: drag to move, with 8 handles to resize. */}
      <div
        className="absolute border border-white/80 cursor-move"
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          borderWidth: '0.5px',
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.35)'
        }}
        onPointerDown={(e) => startDrag(e, 'move')}
      >
        {/* Corner handles */}
        {(['nw', 'ne', 'sw', 'se'] as const).map((c) => (
          <div
            key={c}
            onPointerDown={(e) => startDrag(e, c)}
            className="absolute h-3 w-3 bg-white rounded-xs shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
            style={{
              left: c.includes('w') ? -6 : undefined,
              right: c.includes('e') ? -6 : undefined,
              top: c.includes('n') ? -6 : undefined,
              bottom: c.includes('s') ? -6 : undefined,
              cursor: c === 'nw' || c === 'se' ? 'nwse-resize' : 'nesw-resize'
            }}
          />
        ))}
        {/* Edge handles */}
        {(['n', 's', 'e', 'w'] as const).map((d) => (
          <div
            key={d}
            onPointerDown={(e) => startDrag(e, d)}
            className="absolute bg-white/70"
            style={{
              left: d === 'n' || d === 's' ? '50%' : d === 'w' ? -1 : undefined,
              right: d === 'e' ? -1 : undefined,
              top: d === 'e' || d === 'w' ? '50%' : d === 'n' ? -1 : undefined,
              bottom: d === 's' ? -1 : undefined,
              transform: d === 'n' || d === 's' ? 'translateX(-50%)' : 'translateY(-50%)',
              width: d === 'n' || d === 's' ? 24 : 2,
              height: d === 'e' || d === 'w' ? 24 : 2,
              cursor: d === 'n' || d === 's' ? 'ns-resize' : 'ew-resize'
            }}
          />
        ))}
        {/* Live size readout */}
        <div
          className="absolute -top-7 left-0 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono tabular-nums select-none pointer-events-none"
          aria-hidden
        >
          {rect.width} × {rect.height}
        </div>
      </div>

      {/* Start button — anchored to the selection so it tracks the area.
          Default below; flip above when the selection is dragged near the
          bottom edge, otherwise the button would clip off-screen. */}
      {(() => {
        const BTN_H = 48
        const GAP = 16
        const belowTop = rect.y + rect.height + GAP
        const aboveTop = rect.y - GAP - BTN_H
        const fitsBelow = belowTop + BTN_H <= window.innerHeight
        const fitsAbove = aboveTop >= 0
        const buttonTop = fitsBelow
          ? belowTop
          : fitsAbove
            ? aboveTop
            : Math.max(8, window.innerHeight - BTN_H - 8)
        return (
          <div
            className="absolute flex justify-center"
            style={{
              left: rect.x,
              top: buttonTop,
              width: rect.width,
              pointerEvents: 'none',
              opacity: countdown !== null ? 0 : 1,
              transition: 'opacity 220ms ease-out'
            }}
          >
            <LockableRecordButton
              loading={loading}
              disabled={!sourcesReady}
              onStart={() => handleStart()}
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        )
      })()}
      <CountdownOverlay value={countdown} />
    </div>
  )
}

// Screenshot-mode area picker. Unlike RecordAreaOverlay (which paints
// a resizable frame so the user can refine before clicking Start),
// this one is a single-shot drag: press, drag, release → capture
// fires immediately on pointer-up. Mirrors the macOS screenshot UX
// (cmd-shift-4) so users don't have to second-guess a stale rectangle.
function SnapAreaOverlay({ init }: { init: OverlayInit }): React.JSX.Element {
  const [drag, setDrag] = useState<Rect | null>(null)
  const [capturing, setCapturing] = useState(false)
  const lockState = useShareLockState()
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [offlinePromptOpen, setOfflinePromptOpen] = useState(false)
  const [quotaPromptOpen, setQuotaPromptOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const fireCapture = useCallback(
    async (cropRect: { x: number; y: number; width: number; height: number }) => {
      if (capturing) return
      // Lock gates run before the network call. Reusing the existing
      // modal components keeps copy + visuals consistent with the
      // record path.
      if (lockState.lockReason === 'offline') {
        setOfflinePromptOpen(true)
        return
      }
      if (lockState.lockReason === 'auth') {
        setAuthPromptOpen(true)
        return
      }
      if (lockState.lockReason === 'quota') {
        setQuotaPromptOpen(true)
        return
      }
      const screenSource = init.sources.find((s) => s.displayId !== '')
      if (!screenSource) return
      const displayIdNum = parseInt(screenSource.displayId, 10)
      if (!Number.isFinite(displayIdNum)) return
      setCapturing(true)
      const originX = window.screenX || 0
      const originY = window.screenY || 0
      await window.electronAPI.captureScreenshot({
        kind: 'area',
        displayId: displayIdNum,
        cropRect: {
          x: cropRect.x + originX,
          y: cropRect.y + originY,
          width: cropRect.width,
          height: cropRect.height
        }
      })
    },
    [capturing, init.sources, lockState.lockReason]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (capturing) return
    // Modal cancels the drag — let the modal layer eat the event.
    if (authPromptOpen || offlinePromptOpen || quotaPromptOpen) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    setDrag({ x: startX, y: startY, width: 0, height: 0 })
    const onMove = (ev: PointerEvent): void => {
      const x = Math.min(startX, ev.clientX)
      const y = Math.min(startY, ev.clientY)
      const width = Math.abs(ev.clientX - startX)
      const height = Math.abs(ev.clientY - startY)
      setDrag({ x, y, width, height })
    }
    const onUp = (ev: PointerEvent): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const x = Math.min(startX, ev.clientX)
      const y = Math.min(startY, ev.clientY)
      const width = Math.abs(ev.clientX - startX)
      const height = Math.abs(ev.clientY - startY)
      // Click-without-drag (or sub-minimum drag) shouldn't fire a
      // capture — the user almost certainly missed the canvas. Reset
      // and wait for another attempt.
      if (width < AREA_MIN_PX || height < AREA_MIN_PX) {
        setDrag(null)
        return
      }
      void fireCapture({ x, y, width, height })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      className="h-screen w-screen relative cursor-crosshair"
      onPointerDown={handlePointerDown}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 100ms ease-out' }}
    >
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      {drag && drag.width > 0 && drag.height > 0 && (
        <div
          className="absolute border border-white/80 pointer-events-none"
          style={{
            left: drag.x,
            top: drag.y,
            width: drag.width,
            height: drag.height,
            background: 'rgba(255,255,255,0.06)',
            borderWidth: '1px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.45)'
          }}
        >
          <div
            className="absolute -top-7 left-0 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono tabular-nums select-none"
            aria-hidden
          >
            {drag.width} × {drag.height}
          </div>
        </div>
      )}
      {!drag && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm text-white/90 shadow-lg">
            <Camera className="h-4 w-4" />
            <span>Drag to capture an area</span>
          </div>
        </div>
      )}
      {authPromptOpen ? <LoginPromptModal onClose={() => setAuthPromptOpen(false)} /> : null}
      {offlinePromptOpen ? <NoInternetModal onClose={() => setOfflinePromptOpen(false)} /> : null}
      {quotaPromptOpen ? (
        <QuotaReachedModal usage={lockState.usage} onClose={() => setQuotaPromptOpen(false)} />
      ) : null}
    </div>
  )
}

export function SelectionOverlay(): React.JSX.Element {
  const [init, setInit] = useState<OverlayInit | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
  }, [])

  useEffect(() => {
    return window.electronAPI.onSelectionOverlayInit((data) => {
      setInit(data)
      setKey((k) => k + 1)
    })
  }, [])

  // Main fires this whenever the overlay is being hidden — we drop the mode
  // component so its hover/lock state can't be visible on the next open
  // before the new INIT arrives.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlayReset(() => {
      setInit(null)
    })
  }, [])

  // Sources arrive after init so the overlay can render immediately without
  // waiting on desktopCapturer. Merge into the existing state so the mode
  // sub-component sees them on next render.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlaySources((sources) => {
      setInit((prev) => (prev ? { ...prev, sources } : prev))
    })
  }, [])

  if (!init) {
    return <div className="h-screen w-screen" />
  }

  if (init.mode === 'display') {
    return <DisplayOverlay key={key} init={init} />
  }

  if (init.mode === 'area') {
    return <AreaOverlay key={key} init={init} />
  }

  return <WindowOverlay key={key} init={init} />
}
