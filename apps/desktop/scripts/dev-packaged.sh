#!/usr/bin/env bash
# Build a signed (NOT notarized) macOS .app and launch it.
#
# Same bundle ID, Developer ID signature, hardened runtime, entitlements and
# TCC identity as the production build — only notarization (the ~5 min Apple
# TSA round trip) is skipped, so this finishes in ~30-45s. Use it to test
# anything that depends on prod-like signing: TCC permission prompts (screen /
# camera / mic), hardened-runtime entitlement issues, signing-related crashes,
# or anything that misbehaves under `pnpm dev` because the unsigned Electron
# binary in node_modules has a different identity.
#
# Usage: pnpm dev:packaged
#   Set APPLE_SIGNING_IDENTITY for a real Developer ID signature; without it
#   electron-builder falls back to ad-hoc signing (fine for most local tests,
#   but TCC prompts behave differently than a real signed build).

set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
pnpm exec electron-vite build
pnpm exec electron-builder --mac --dir --config.mac.notarize=false

APP="dist/mac-arm64/CaptureFlow.app"
if [[ ! -d "$APP" ]]; then
  echo "Build did not produce $APP" >&2
  exit 1
fi

# Strip the quarantine xattr so Gatekeeper doesn't silently block the
# unnotarized binary on launch.
xattr -cr "$APP" || true

echo ""
echo "Launching $APP"
open "$APP"
