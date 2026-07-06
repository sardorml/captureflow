#!/usr/bin/env bash
# Builds the macOS sidecars into native/mac/<name>/bin/ and prints the
# lipo/minos summary (guards the minos-26 Xcode regression).
# Usage: scripts/build-native.sh [--universal]
set -euo pipefail
cd "$(dirname "$0")/.."

UNIVERSAL=0
[[ "${1:-}" == "--universal" ]] && UNIVERSAL=1

build() {
  local name="$1"
  shift
  local dir="native/mac/$name"
  local out="$dir/bin/$name"
  local srcs=()
  for s in "$@"; do srcs+=("$dir/$s"); done
  mkdir -p "$dir/bin"
  if [[ "$UNIVERSAL" == "1" ]]; then
    swiftc -O -target arm64-apple-macos13.2 "${srcs[@]}" -o "$out.arm64"
    swiftc -O -target x86_64-apple-macos13.2 "${srcs[@]}" -o "$out.x86_64"
    lipo -create "$out.arm64" "$out.x86_64" -output "$out"
    rm "$out.arm64" "$out.x86_64"
  else
    swiftc -O -target arm64-apple-macos13.2 "${srcs[@]}" -o "$out"
  fi
  lipo -info "$out"
  vtool -show-build "$out" | grep -m1 minos
}

build screen-recorder main.swift RecordingWriter.swift spikes/RecordingTapSpike.swift
build window-detector WindowDetector.swift
