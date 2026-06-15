import { useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { ShareFailureState } from '../../../../shared/types'

// Single-state modal: error message + optional salvageable URL + Done.
// The only in-app share surface — success now opens the browser
// directly to captureflow.xyz/shares/<slug>/edit; this modal
// covers init failures, partial uploads, and recorder crashes.
export function ShareFailureModal(): React.JSX.Element {
  const [state, setState] = useState<ShareFailureState | null>(null)

  useEffect(() => {
    const off = window.electronAPI.onShareFailureInit((next) => setState(next))
    return off
  }, [])

  const headline = state ? headlineFor(state.kind) : 'Share didn’t go through'
  const body = state?.message ?? ''
  const url = state?.kind === 'partial' ? state.url : undefined

  const onDone = (): void => window.electronAPI.shareFailureClose()
  const onOpenLink = (): void => {
    if (url) window.electronAPI.shareReadyOpenLink(url)
  }

  return (
    <div className="fixed inset-0 flex items-stretch justify-stretch bg-background text-foreground">
      <div
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="flex w-full flex-col"
      >
        <div className="h-9 shrink-0" />
        <div className="flex flex-1 flex-col gap-3 px-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-semibold leading-tight">{headline}</h2>
              {body ? <p className="text-[13px] text-foreground/70 leading-snug">{body}</p> : null}
            </div>
          </div>
        </div>
        <div
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex shrink-0 items-center justify-end gap-2 border-t border-white/8 px-5 py-3"
        >
          {url ? (
            <button
              type="button"
              onClick={onOpenLink}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-[13px] font-medium text-foreground/85 transition-colors hover:bg-white/[0.10] hover:text-foreground focus:outline-none"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open partial share
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDone}
            className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function headlineFor(kind: ShareFailureState['kind']): string {
  switch (kind) {
    case 'init-failed':
      return 'Couldn’t start a share'
    case 'no-link':
      return 'Couldn’t upload your recording'
    case 'partial':
      return 'Connection dropped — saved what got through'
  }
}
