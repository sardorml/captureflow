// Toggles macOS chrome for a "clean" display recording — currently just
// Finder's desktop icons. We snapshot the live value before mutating so the
// user is restored to their prior setup afterward.
//
// Toggling CreateDesktop requires relaunching Finder (killall), which loses
// any open Finder windows — that's the unavoidable cost of this technique.
import { execFile } from 'child_process'
import { promisify } from 'util'
import { logWarn } from './logger'

const exec = promisify(execFile)

let savedDesktopVisible: boolean | null = null
let desktopOverridden = false

// `defaults read` exits non-zero when the key is missing, which is the
// normal default state where Finder shows the desktop. Treat that case as
// "visible" so a fresh user lands on the right baseline.
async function readDesktopVisible(): Promise<boolean> {
  try {
    const { stdout } = await exec('defaults', ['read', 'com.apple.finder', 'CreateDesktop'])
    return stdout.trim() !== '0'
  } catch {
    return true
  }
}

async function writeDesktopVisible(visible: boolean): Promise<void> {
  await exec('defaults', [
    'write',
    'com.apple.finder',
    'CreateDesktop',
    '-bool',
    visible ? 'true' : 'false'
  ])
  // CreateDesktop is read at Finder launch, so the change only takes effect
  // after a relaunch. killall lets launchd respawn Finder within ~1s.
  try {
    await exec('killall', ['Finder'])
  } catch {
    // Finder wasn't running — `CreateDesktop` will apply on its next launch.
  }
}

export async function applyRecordingDisplayMode(opts: {
  hideDesktopIcons: boolean
}): Promise<void> {
  if (process.platform !== 'darwin') return

  if (opts.hideDesktopIcons && !desktopOverridden) {
    try {
      const current = await readDesktopVisible()
      savedDesktopVisible = current
      if (current) await writeDesktopVisible(false)
      desktopOverridden = true
    } catch (err) {
      logWarn('display-mode', `hide desktop icons failed: ${String(err)}`)
    }
  }
}

export async function restoreRecordingDisplayMode(): Promise<void> {
  if (process.platform !== 'darwin') return

  if (desktopOverridden) {
    const target = savedDesktopVisible ?? true
    try {
      await writeDesktopVisible(target)
    } catch (err) {
      logWarn('display-mode', `restore desktop icons failed: ${String(err)}`)
    }
    desktopOverridden = false
    savedDesktopVisible = null
  }
}

export function hasActiveDisplayModeOverrides(): boolean {
  return desktopOverridden
}
