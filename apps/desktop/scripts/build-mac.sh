#!/usr/bin/env bash
# Sign + (optionally) notarize the macOS build — local artifacts only.
#
# CaptureFlow is open source: you build and sign the app with YOUR OWN Apple
# Developer ID. No signing material lives in the repo — point the script at
# your identity and notary profile via env vars:
#
#   APPLE_SIGNING_IDENTITY   "Developer ID Application: NAME (TEAMID)"
#   APPLE_KEYCHAIN_PROFILE   notarytool keychain profile (default: captureflow-notary)
#
# Usage:
#   APPLE_SIGNING_IDENTITY="Developer ID Application: …" scripts/build-mac.sh
#   scripts/build-mac.sh --no-notarize     # signed only, ~30-45s (skips Apple TSA)
#
# One-time notary credential setup (stores creds in your login keychain so the
# build is non-interactive). Generate the app-specific password at
# https://account.apple.com → Sign-In & Security → App-Specific Passwords:
#   xcrun notarytool store-credentials captureflow-notary \
#     --apple-id <apple-id-email> --team-id <TEAMID> --password <app-specific-password>
#
# A "Developer ID Application" cert must be installed in your login keychain
# (verify: `security find-identity -v -p codesigning`). If native modules fail
# to load in the packaged app, rebuild them for Electron's ABI first:
#   pnpm exec electron-builder install-app-deps
#
# Auto-update uses a generic provider on the CDN (R2 captureflow-releases →
# dl.captureflow.xyz); this script only emits dist/*.{zip,dmg,blockmap} +
# latest-mac.yml, which you upload to the bucket afterwards.
#
# Output is tee'd to build.log — `tail -f build.log` from another shell.

set -euo pipefail
cd "$(dirname "$0")/.."

NOTARIZE=true
for arg in "$@"; do
  case "$arg" in
    --no-notarize) NOTARIZE=false ;;
    *) echo "unknown arg: $arg (use --no-notarize)" >&2; exit 2 ;;
  esac
done

APPLE_KEYCHAIN_PROFILE="${APPLE_KEYCHAIN_PROFILE:-captureflow-notary}"

if $NOTARIZE; then
  # electron-builder's notarize step reads notary creds from the keychain
  # profile in this env var; the DMG codesign below uses the identity.
  : "${APPLE_SIGNING_IDENTITY:?set APPLE_SIGNING_IDENTITY to your \"Developer ID Application: NAME (TEAMID)\" — or pass --no-notarize}"
  export APPLE_KEYCHAIN_PROFILE
fi

rm -rf dist

# Compile main + preload + renderer before packaging — electron-builder would
# otherwise package whatever stale JS is left in out/.
pnpm exec electron-vite build 2>&1 | tee build.log

if $NOTARIZE; then
  pnpm exec electron-builder --mac --config.mac.notarize=true --publish never 2>&1 | tee -a build.log
else
  pnpm exec electron-builder --mac --publish never 2>&1 | tee -a build.log
fi

# electron-builder notarizes the .app but leaves the DMG container unsigned and
# unticketed — Gatekeeper rejects it as "no usable signature" until we sign,
# notarize, and staple the DMG itself. Sign first (changes the hash), then
# submit, then staple. Skipped when --no-notarize.
if $NOTARIZE; then
  shopt -s nullglob
  for dmg in dist/*.dmg; do
    {
      echo "• post-build: signing dmg $dmg"
      codesign --sign "$APPLE_SIGNING_IDENTITY" --timestamp "$dmg"
      echo "• post-build: notarizing dmg $dmg"
      xcrun notarytool submit "$dmg" --keychain-profile "$APPLE_KEYCHAIN_PROFILE" --wait
      echo "• post-build: stapling dmg $dmg"
      xcrun stapler staple "$dmg"
      spctl -a -vv -t install "$dmg"
    } 2>&1 | tee -a build.log
  done
fi

echo ""
echo "✅ build complete — artifacts in dist/ (build.log has the full transcript)"
