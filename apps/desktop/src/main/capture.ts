import { desktopCapturer, systemPreferences } from 'electron'
import { CaptureSource } from '../shared/types'

export async function getSources(): Promise<CaptureSource[]> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 }
    })

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnailDataUrl: source.thumbnail.toDataURL(),
      displayId: source.display_id
    }))
  } catch (error) {
    console.warn('Failed to get sources (screen recording permission may be needed):', error)
    return []
  }
}

// Minimal TCC-protected probe used by the welcome gate to:
//   1. fire macOS's native Screen Recording prompt on first call, and
//   2. register the app in System Settings → Privacy → Screen Recording
//      so the user has something to toggle on.
//
// Skips thumbnails and limits to one display so macOS only fires a single
// TCC request — `getSources()` above passes `['screen', 'window']` plus a
// thumbnail size, which can re-fire the prompt when the user opens System
// Settings (macOS treats it as a still-pending permission negotiation).
export async function probeScreenRecordingPermission(): Promise<void> {
  try {
    await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 0, height: 0 } })
  } catch {
    /* ignore — the side effect (prompt + registration) is what we want */
  }
}

export function getScreenPermissionStatus(): string {
  return systemPreferences.getMediaAccessStatus('screen')
}

export function getMicPermissionStatus(): string {
  return systemPreferences.getMediaAccessStatus('microphone')
}

export function getCameraPermissionStatus(): string {
  return systemPreferences.getMediaAccessStatus('camera')
}

export async function requestMicPermission(): Promise<boolean> {
  return systemPreferences.askForMediaAccess('microphone')
}

export async function requestCameraPermission(): Promise<boolean> {
  return systemPreferences.askForMediaAccess('camera')
}

export function getAccessibilityStatus(): boolean {
  return systemPreferences.isTrustedAccessibilityClient(false)
}

export function requestAccessibility(): boolean {
  return systemPreferences.isTrustedAccessibilityClient(true)
}

export function getAllPermissions(): {
  screen: string
  microphone: string
  camera: string
  accessibility: boolean
} {
  return {
    screen: getScreenPermissionStatus(),
    microphone: getMicPermissionStatus(),
    camera: getCameraPermissionStatus(),
    accessibility: getAccessibilityStatus()
  }
}
