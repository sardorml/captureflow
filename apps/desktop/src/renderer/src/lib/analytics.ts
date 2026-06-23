import posthog from "posthog-js";
import type { ShareAuthState } from "../../../shared/types";

/*
 * The key is a write-only ingest key, safe in a client bundle.
 * `typeof` guards keep this import-safe under vitest, where electron-vite's
 * `define` replacements don't run.
 */
const KEY = typeof __POSTHOG_KEY__ !== "undefined" ? __POSTHOG_KEY__ : "";
const HOST =
  typeof __POSTHOG_HOST__ !== "undefined"
    ? __POSTHOG_HOST__
    : "https://us.i.posthog.com";
const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "unknown";

export type AnalyticsEvent =
  | "app_opened"
  | "recording_started"
  | "recording_completed"
  | "export_completed"
  | "pro_upgrade_clicked";

let started = false;
let enabled = false;

function applyConsent(on: boolean): void {
  if (!started) return;
  if (on) posthog.opt_in_capturing();
  else posthog.opt_out_capturing();
}

function identify(auth: ShareAuthState): void {
  if (!started || !enabled) return;
  if (auth.kind === "signed_in") {
    // Key on email so desktop + web events join the same person; web also identifies by email.
    posthog.identify(auth.email ?? auth.tokenId, {
      email: auth.email ?? undefined,
      label: auth.label ?? undefined,
      token_id: auth.tokenId,
    });
  } else {
    posthog.reset();
  }
}

export function initAnalytics(opts: {
  enabled: boolean;
  auth: ShareAuthState;
}): void {
  enabled = opts.enabled;
  if (!KEY) return;

  if (!started) {
    posthog.init(KEY, {
      api_host: HOST,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      // No /decide round-trip: keeps the CSP surface to ingest-only.
      advanced_disable_decide: true,
      persistence: "localStorage",
      opt_out_capturing_by_default: !opts.enabled,
    });
    posthog.register({ app_version: APP_VERSION, platform: "macos" });
    started = true;
  }

  applyConsent(opts.enabled);
  identify(opts.auth);
}

export function setAnalyticsEnabled(on: boolean, auth: ShareAuthState): void {
  if (!started && on) {
    initAnalytics({ enabled: true, auth });
    return;
  }
  enabled = on;
  applyConsent(on);
  if (on) identify(auth);
}

export function setAnalyticsIdentity(auth: ShareAuthState): void {
  identify(auth);
}

export function track(
  event: AnalyticsEvent,
  props?: Record<string, unknown>,
): void {
  if (!started || !enabled) return;
  posthog.capture(event, props);
}
