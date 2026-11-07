#!/usr/bin/env bash
# The recorder as production runs it: its image, capped to the instance_type in apps/web/wrangler.jsonc, on the dev port.
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm build
docker build -q -t captureflow-recorder:dev . >/dev/null
music=()
if [[ -n "${RECORDER_MUSIC:-}" && -f "$RECORDER_MUSIC" ]]; then
  music=(-v "$RECORDER_MUSIC:/music/track:ro" -e RECORDER_MUSIC=/music/track)
fi
exec docker run --rm --init --network host --cpus=4 --memory=12g --shm-size=1g \
  -e PORT="${PORT:-8788}" -e RECORDER_SECRET ${music[@]+"${music[@]}"} \
  captureflow-recorder:dev
