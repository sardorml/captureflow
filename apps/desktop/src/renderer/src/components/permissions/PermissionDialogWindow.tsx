import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import logoImg from '@/assets/logo.png'
import type { PermissionDialogInitPayload } from '../../../../shared/types'

const COPY: Record<
  PermissionDialogInitPayload['kind'],
  Record<PermissionDialogInitPayload['variant'], { title: string; body: string; primary: string }>
> = {
  camera: {
    'first-time': {
      title: 'Camera access required',
      body: 'To include your webcam in this recording, CaptureFlow needs access. macOS will show a prompt next.',
      primary: 'Continue'
    },
    denied: {
      title: 'Camera access is turned off',
      body: 'CaptureFlow can’t reach your webcam. Enable it for CaptureFlow under Privacy & Security to keep recording.',
      primary: 'Open Privacy Settings'
    }
  },
  microphone: {
    'first-time': {
      title: 'Microphone access required',
      body: 'To capture audio from this mic, CaptureFlow needs access. macOS will show a prompt next.',
      primary: 'Continue'
    },
    denied: {
      title: 'Microphone access is turned off',
      body: 'CaptureFlow can’t reach your microphone. Enable it for CaptureFlow under Privacy & Security to keep recording.',
      primary: 'Open Privacy Settings'
    }
  }
}

export function PermissionDialogWindow(): React.JSX.Element | null {
  const [payload, setPayload] = useState<PermissionDialogInitPayload | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return window.electronAPI.onPermissionDialogInit((p) => setPayload(p))
  }, [])

  useEffect(() => {
    const prevBodyBg = document.body.style.background
    const prevHtmlBg = document.documentElement.style.background
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.background = 'rgba(0, 0, 0, 0.40)'
    document.documentElement.style.background = 'transparent'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.background = prevBodyBg
      document.documentElement.style.background = prevHtmlBg
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [])

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || !payload) return
    let lastH = 0
    const measure = (): void => {
      const h = Math.ceil(el.scrollHeight)
      if (h === lastH) return
      lastH = h
      window.electronAPI.fitWindowToContent({ width: 260, height: h })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [payload])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') window.electronAPI.respondToPermissionDialog(false)
      if (e.key === 'Enter') window.electronAPI.respondToPermissionDialog(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!payload) return null
  const copy = COPY[payload.kind][payload.variant]

  return (
    <div
      ref={rootRef}
      className="permission-dialog"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <img src={logoImg} alt="" className="permission-dialog__icon" draggable={false} />
      <h2 className="permission-dialog__title">{copy.title}</h2>
      <p className="permission-dialog__body">{copy.body}</p>

      <div
        className="permission-dialog__buttons"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          type="button"
          autoFocus
          className="permission-dialog__btn permission-dialog__btn--primary"
          onClick={() => window.electronAPI.respondToPermissionDialog(true)}
        >
          {copy.primary}
        </button>
        <button
          type="button"
          className="permission-dialog__btn"
          onClick={() => window.electronAPI.respondToPermissionDialog(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
