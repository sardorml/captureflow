import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Building2, ChevronDown, ExternalLink, LogIn, User } from 'lucide-react'
import AnimatedTooltip from '@/components/ui/animated-tooltip'
import logoRound from '@/assets/logo-round.png'
import type { ShareAuthState, ShareUsageState, WorkspacesState } from '../../../../shared/types'

const APP_WEB_URL = 'https://captureflow.xyz'

// Trailing icon button's role, set by nudge state:
//   - signin → sign-in deep-link flow
//   - upgrade → web dashboard to free up / upgrade (storage cap hit)
//   - dashboard → web dashboard
type NudgeAction = 'signin' | 'upgrade' | 'dashboard'

// Floating status pill in the transparent band above the recording bar,
// for an ambient sign-in / quota nudge that doesn't compete with the bar
// buttons.
//
// Click-through stays intact: the main-process cursor poll only flips
// ignore-mouse off over `[data-toolbar-hit]` regions, and the empty area
// of this nudge isn't one, so those clicks pass through underneath.
//
// Renders nothing unless idle and there's something worth saying.

type NudgeTone = 'info' | 'warn' | 'alert'

type Nudge = {
  text: string
  tone: NudgeTone
  action: NudgeAction
}

const WARN_THRESHOLD = 0.8

function formatStorage(b: number): string {
  // Switch to GB past 1 GB so the cap doesn't read as "51200 MB". Under
  // 10 of the chosen unit, keep 1 decimal so small usages still move.
  const mb = b / (1024 * 1024)
  if (mb >= 1024) {
    const gb = mb / 1024
    if (gb >= 10) return `${Math.round(gb)} GB`
    return `${Math.round(gb * 10) / 10} GB`
  }
  if (mb >= 10) return `${Math.round(mb)} MB`
  return `${Math.round(mb * 10) / 10} MB`
}

function computeNudge(auth: ShareAuthState, usage: ShareUsageState): Nudge | null {
  if (auth.kind === 'signed_out') {
    // Spell out the payoff (a public share link) rather than a bare
    // "Sign in to share", which reads as pure friction.
    return {
      text: 'Sign in to get a public share link',
      tone: 'info',
      action: 'signin'
    }
  }
  // Signed in: surface the live storage figure when we have a real
  // (non-dev) usage reading. Tone escalates as the ratio approaches the
  // cap: muted by default, amber from 80%, alert reserved for capReached.
  if (usage.kind === 'known' && !usage.isDev) {
    // At the cap, prompt the upgrade; below it, just surface live usage.
    if (usage.capReached) {
      return {
        text: 'Storage full — upgrade to share more',
        tone: 'alert',
        action: 'upgrade'
      }
    }
    if (usage.limitBytes > 0) {
      const ratio = usage.usedBytes / usage.limitBytes
      const tone: NudgeTone = ratio >= WARN_THRESHOLD ? 'warn' : 'info'
      return {
        text: `${formatStorage(usage.usedBytes)} of ${formatStorage(usage.limitBytes)} cloud used`,
        tone,
        action: 'dashboard'
      }
    }
  }
  // Fall back to a neutral indicator (boot probe running, dev build, or no
  // quota yet) so the toolbar never goes blank in Share mode.
  return {
    text: 'Share mode · instant link',
    tone: 'info',
    action: 'dashboard'
  }
}

function actionDetails(action: NudgeAction): {
  tooltip: string
  ariaLabel: string
  icon: React.ReactNode
  onClick: () => void
} {
  if (action === 'signin') {
    return {
      tooltip: 'Sign in',
      ariaLabel: 'Sign in to CaptureFlow',
      icon: <LogIn className="h-3.5 w-3.5" strokeWidth={2} />,
      onClick: () => {
        window.electronAPI.signInShareAuth().catch(() => {})
      }
    }
  }
  if (action === 'upgrade') {
    // Route to the dashboard, not the Lemon Squeezy checkout: it offers
    // both the upgrade CTA and the "free up space by deleting shares"
    // path, the more common fix at this point in the funnel.
    return {
      tooltip: 'Manage storage',
      ariaLabel: 'Manage storage on CaptureFlow dashboard',
      icon: <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />,
      onClick: () => {
        window.electronAPI.openExternal(APP_WEB_URL).catch(() => {})
      }
    }
  }
  return {
    tooltip: 'Open dashboard',
    ariaLabel: 'Open CaptureFlow dashboard',
    icon: <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />,
    onClick: () => {
      window.electronAPI.openExternal(APP_WEB_URL).catch(() => {})
    }
  }
}

function toneColor(tone: NudgeTone): string {
  // White for info; amber tones escalate cleanly into the alert state.
  if (tone === 'alert') return 'rgba(251, 191, 36, 0.95)' // amber-400
  if (tone === 'warn') return 'rgba(252, 211, 77, 0.9)' // amber-300
  return 'rgb(255, 255, 255)'
}

export function ToolbarStatusNudge({
  visible
}: {
  visible: boolean
}): React.JSX.Element | null {
  const [auth, setAuth] = useState<ShareAuthState>({ kind: 'signed_out' })
  const [usage, setUsage] = useState<ShareUsageState>({ kind: 'unknown' })
  const [workspaces, setWorkspaces] = useState<WorkspacesState>({ kind: 'unknown' })

  useEffect(() => {
    void window.electronAPI.getShareAuth().then(setAuth)
    return window.electronAPI.onShareAuthChanged(setAuth)
  }, [])

  useEffect(() => {
    void window.electronAPI.getShareUsage().then(setUsage)
    return window.electronAPI.onShareUsageChanged(setUsage)
  }, [])

  useEffect(() => {
    void window.electronAPI.getWorkspaces().then(setWorkspaces)
    return window.electronAPI.onWorkspacesChanged(setWorkspaces)
  }, [])

  if (!visible) return null
  const nudge = computeNudge(auth, usage)
  if (!nudge) return null

  // Workspace chip: visible when signed-in and the main process has
  // populated the workspaces list. Hidden during the boot probe so a
  // stale paint doesn't flash the wrong workspace name.
  const showWorkspaceChip =
    auth.kind === 'signed_in' &&
    workspaces.kind === 'known' &&
    workspaces.workspaces.length > 0

  const { tooltip, ariaLabel, icon, onClick } = actionDetails(nudge.action)

  return (
    <motion.div
      // In flow directly above the bar (RecordingToolbar's centered column
      // with `items-start`), so the pill's left edge lines up with the bar's.
      className="select-none flex items-center gap-1.5"
      initial={false}
      animate={{ opacity: 1, pointerEvents: 'auto' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* CaptureFlow round mark, sized to the pill height. */}
      <img
        src={logoRound}
        alt=""
        draggable={false}
        className="h-7 w-7 shrink-0 rounded-full select-none"
      />
      {/* data-toolbar-hit keeps the main-process cursor poll's ignore-mouse
          off over the pill; without it the icon button below would never
          see clicks (the window defaults to ignore-mouse). */}
      <span
        data-toolbar-hit
        className="flex h-7 items-center gap-1.5 rounded-full bg-neutral-700 pl-2.5 pr-1 text-[13px] font-normal tracking-tight whitespace-nowrap ring-1 ring-white/10"
        style={{ color: toneColor(nudge.tone) }}
      >
        <span aria-hidden className="toolbar-nudge-twinkle">
          ✦
        </span>
        <span>{nudge.text}</span>
        <AnimatedTooltip content={tooltip} placement="top">
          <button
            type="button"
            onClick={onClick}
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={ariaLabel}
          >
            {icon}
          </button>
        </AnimatedTooltip>
      </span>
      {showWorkspaceChip && workspaces.kind === 'known' && <WorkspaceChip state={workspaces} />}
    </motion.div>
  )
}

// Right-side chip: the workspace new shares + snaps land in. Uses a native
// <select> overlay because the custom motion dropdown got clipped and lost
// click-through inside the toolbar BrowserWindow; the OS picker also gives
// free keyboard nav + voiceover.
function WorkspaceChip({
  state
}: {
  state: Extract<WorkspacesState, { kind: 'known' }>
}): React.JSX.Element {
  const active = state.workspaces.find((w) => w.id === state.activeId) ?? state.workspaces[0]
  const onlyOne = state.workspaces.length === 1
  const Icon = active.kind === 'team' ? Building2 : User

  // Long names get a hard truncate so the chip doesn't bulldoze the
  // bar on accounts with verbose workspace names.
  const labelText = active.name.length > 22 ? `${active.name.slice(0, 21)}…` : active.name

  return (
    <div
      data-toolbar-hit
      className="relative flex h-7 items-center gap-1.5 rounded-full bg-neutral-700 pl-2.5 pr-3 text-[13px] font-normal tracking-tight whitespace-nowrap text-white ring-1 ring-white/10"
    >
      <Icon className="h-4 w-4 shrink-0 text-white/55" strokeWidth={2} />
      <span className="pointer-events-none">{labelText}</span>
      {!onlyOne && (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/45" strokeWidth={2.25} />
      )}
      {/* Transparent native <select> sits over the styled chip: the user
          reads the content underneath while the <select> takes the clicks
          and the OS draws the picker. */}
      <select
        aria-label="Active workspace"
        value={active.id}
        disabled={onlyOne}
        onChange={(e) => {
          const id = e.target.value
          if (id !== active.id) {
            window.electronAPI.selectWorkspace(id).catch(() => {})
          }
        }}
        className="absolute inset-0 cursor-pointer rounded-full opacity-0 disabled:cursor-default"
      >
        {state.workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  )
}
