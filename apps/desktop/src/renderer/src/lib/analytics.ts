import posthog from 'posthog-js'
import type { ShareAuthState } from '../../../shared/types'

// Opt-in usage analytics, backed by PostHog. Privacy-first by design:
//
//  - Dormant unless a project key is baked in (__POSTHOG_KEY__) AND the user
//    has turned on "Usage data" in the welcome gate. With either missing,
//    every call here is a no-op and no network request is made.
//  - We never autocapture DOM events, never record sessions, and never load
//    the toolbar/surveys — only the explicit events below are sent, and never
//    the content of a recording.
//  - Consent is enforced two ways: PostHog's own opt-in/opt-out flag, and our
//    `enabled` guard around every capture. Flipping the toggle off stops
//    capture immediately and clears the queued/stored identity.
//
// The key is a write-only ingest key (safe in a client bundle); see
// electron.vite.config.ts for how it's injected.

// `typeof` guards so this module is import-safe under vitest, where the
// electron-vite `define` replacements don't run. In real builds esbuild still
// substitutes the token, so the guard collapses to the baked value.
const KEY = typeof __POSTHOG_KEY__ !== 'undefined' ? __POSTHOG_KEY__ : ''
const HOST = typeof __POSTHOG_HOST__ !== 'undefined' ? __POSTHOG_HOST__ : 'https://us.i.posthog.com'
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown'

// Named so call sites read as a closed vocabulary — add events here, not as
// free-form strings, so the PostHog dashboard stays clean.
export type AnalyticsEvent =
  | 'app_opened'
  | 'recording_started'
  | 'recording_completed'
  | 'export_completed'
  | 'pro_upgrade_clicked'

let started = false // posthog.init has run
let enabled = false // the user's current consent

function applyConsent(on: boolean): void {
  if (!started) return
  if (on) posthog.opt_in_capturing()
  else posthog.opt_out_capturing()
}

function identify(auth: ShareAuthState): void {
  if (!started || !enabled) return
  if (auth.kind === 'signed_in') {
    // Key on email when we have it so desktop + web events join the same
    // person (the web client identifies by email too); fall back to the
    // token id for accounts without an email on file.
    posthog.identify(auth.email ?? auth.tokenId, {
      email: auth.email ?? undefined,
      label: auth.label ?? undefined,
      token_id: auth.tokenId
    })
  } else {
    // Drop any prior identity so a signed-out session is anonymous again.
    posthog.reset()
  }
}

// Boot (or re-evaluate) the analytics client. Safe to call repeatedly — it
// initializes PostHog at most once, then just re-applies consent + identity.
// Called at renderer startup and whenever the toggle or sign-in state changes.
export function initAnalytics(opts: { enabled: boolean; auth: ShareAuthState }): void {
  enabled = opts.enabled
  if (!KEY) return // not configured — stay completely dormant

  if (!started) {
    posthog.init(KEY, {
      api_host: HOST,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      // No /decide round-trip: we don't use feature flags or surveys, so this
      // avoids an extra request and keeps the CSP surface to ingest-only.
      advanced_disable_decide: true,
      persistence: 'localStorage',
      // Honor consent from the very first call rather than capturing once
      // before opt_in/opt_out lands.
      opt_out_capturing_by_default: !opts.enabled
    })
    posthog.register({ app_version: APP_VERSION, platform: 'macos' })
    started = true
  }

  applyConsent(opts.enabled)
  identify(opts.auth)
}

// Flip consent at runtime (welcome-gate toggle, preferences). Initializes the
// client lazily if it wasn't started yet (e.g. toggled on after boot).
export function setAnalyticsEnabled(on: boolean, auth: ShareAuthState): void {
  if (!started && on) {
    initAnalytics({ enabled: true, auth })
    return
  }
  enabled = on
  applyConsent(on)
  if (on) identify(auth)
}

// Re-identify after the share account signs in/out, without touching consent.
export function setAnalyticsIdentity(auth: ShareAuthState): void {
  identify(auth)
}

// Capture an event. No-op unless analytics are both configured and enabled.
export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (!started || !enabled) return
  posthog.capture(event, props)
}
