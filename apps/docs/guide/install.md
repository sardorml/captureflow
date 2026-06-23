# Install the app

The CaptureFlow recorder is a native **macOS** app (it relies on macOS screen,
window, and cursor APIs via bundled Swift helpers). Apple Silicon and Intel are
both supported.

> [!NOTE]
> Windows/Linux recorders aren't shipped yet. The **web backend, dashboard, and
> share pages are fully cross-platform** — anyone can view and manage recordings
> in a browser on any OS.

## Option A — download a release

If your instance publishes builds, grab the latest `.dmg` from the
[Releases page](https://github.com/sardorml/captureflow/releases), open it, and
drag **CaptureFlow** into `/Applications`. The app auto-updates via
`electron-updater` when new releases are published.

## Option B — build it yourself

From a checkout of the repo:

```bash
pnpm install
pnpm --filter @captureflow/desktop dev     # run the recorder in dev
# or produce a packaged build:
pnpm --filter @captureflow/desktop build
```

See [Build from source](/developer/build) for prerequisites (Node 24, pnpm 10).

## Grant macOS permissions

On first launch macOS will ask for a few permissions. CaptureFlow can't capture
without them — grant each, then relaunch if prompted:

| Permission                          | Why it's needed                                                   |
| ----------------------------------- | ----------------------------------------------------------------- |
| **Screen & System Audio Recording** | Capture the screen (and system audio). Required.                  |
| **Accessibility**                   | Track the cursor and global hotkeys for smooth cursor + controls. |
| **Camera**                          | Only if you enable the webcam bubble.                             |
| **Microphone**                      | Only if you record your voice.                                    |

You can review or re-grant these any time under **System Settings → Privacy &
Security**. If a toggle was already on but capture fails, toggle it off and on
again (a known macOS quirk) and restart the app.

## Sign in

The recorder needs an account on a CaptureFlow backend to upload and create
share links.

- **Managed hosting:** sign in with the account from your provider.
- **Self-hosted:** the desktop app points at `https://captureflow.xyz` by
  default. To target your own deployment, see
  [Point the desktop app at your backend](/self-hosting/desktop).

Signing in happens through your browser and hands the session back to the app
via a `captureflow://` deep link.

Next: [Record your screen](/guide/recording).
