# Point the desktop app at your backend

The desktop recorder talks to the web backend through four **build-time** env
vars. They're inlined into the Electron bundle by `electron.vite.config.ts`, so
you set them **before building** the app.

## Defaults

All four default to `https://captureflow.xyz` (the unified Worker). If you
self-host on that domain, you don't need to set anything.

| Env var                           | Default (prod)                  |
| --------------------------------- | ------------------------------- |
| `CAPTUREFLOW_APP_WEB_API_BASE`    | `https://captureflow.xyz`       |
| `CAPTUREFLOW_APP_WEB_BASE`        | `https://captureflow.xyz`       |
| `CAPTUREFLOW_RECORDING_API_BASE`  | `https://captureflow.xyz/api/r` |
| `CAPTUREFLOW_SCREENSHOT_API_BASE` | `https://captureflow.xyz/api/s` |

In local dev (`pnpm --filter @captureflow/desktop dev`) these default to
`http://localhost:3032`, so the recorder talks to a locally running Worker.

## Target your own host

Set the four vars to your domain, then build. For a deployment at
`https://rec.example.com`:

```bash
export CAPTUREFLOW_APP_WEB_API_BASE="https://rec.example.com"
export CAPTUREFLOW_APP_WEB_BASE="https://rec.example.com"
export CAPTUREFLOW_RECORDING_API_BASE="https://rec.example.com/api/r"
export CAPTUREFLOW_SCREENSHOT_API_BASE="https://rec.example.com/api/s"

pnpm --filter @captureflow/desktop build
```

(Or put them in a desktop `.env` file that `electron-vite` reads at build time.)

## Deep linking

Sign-in completes in the browser and returns to the app via the
`captureflow://` URL scheme. The backend's `APP_DEEP_LINK_SCHEME` var must match
the scheme the desktop app registers (`captureflow`). If you rebrand the scheme,
change it in **both** places in lockstep.

## Desktop-only build extras

These don't affect the web backend but tune the desktop build:

- `POSTHOG_KEY` / `POSTHOG_HOST` — opt-in analytics, dormant when unset.

See `apps/desktop/electron.vite.config.ts` for the full list.
