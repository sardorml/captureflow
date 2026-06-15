/// <reference types="vite/client" />

// Build-time constant injected via electron-vite `define` (see
// electron.vite.config.ts). True when package.json#version carries the
// `-beta` suffix.
declare const __IS_BETA__: boolean

// Build-time constants injected via electron-vite `define`. The app version
// (from package.json) and the opt-in PostHog usage-analytics config. The key
// is empty when analytics aren't configured, which keeps the client dormant.
declare const __APP_VERSION__: string
declare const __POSTHOG_KEY__: string
declare const __POSTHOG_HOST__: string
