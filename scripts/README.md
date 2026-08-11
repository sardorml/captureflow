# scripts

## `gen-brand-icons.py` — regenerate all brand logos from the `.icon`

The CaptureFlow logo lives as an **Icon Composer `.icon` bundle** (blue squircle

- yin-yang). This script is the single source of truth: give it the `.icon` and
  it regenerates every prod raster asset across web, desktop, and docs.

```bash
# after editing/exporting the .icon in Icon Composer:
python3 scripts/gen-brand-icons.py [~/Downloads/captureflow.icon]   # default path shown
git diff --stat        # review the ~20 changed PNGs
```

**Requirements:** macOS with Xcode (`actool`, `iconutil`) + `pip install pillow numpy`.

**Master source:** for the crispest result, also export the flat PNG from Icon
Composer (File ▸ Export → iOS 1024) to
`~/Downloads/captureflow-iOS-Default-1024x1024@1x.png`. The script uses that PNG
as the master when it's at least as fresh as the `.icon`; otherwise it falls
back to `actool`, which renders the `.icon` to a 256px macOS squircle and
upscales it (the full-res render lives only in `Assets.car` — used by the
packaged app via electron-builder `mac.icon` — and isn't CLI-extractable).

**How it works:** the master is normalised to a full-bleed 1024 squircle, then
everything is derived from it: square logos, round/disc logos, maskable +
apple-touch cards, tray discs, favicons, `build/captureflow.icon` (copied from
the `.icon`) + the pre-26 fallback `icon.icns`, and the logo is swapped into
`og-image.png` in place. Pass an explicit path (`.icon` or `.png`) as the first
arg to override the defaults.

**Not touched:** `apps/desktop/resources/icon-dev.png` (the amber dev-build icon).

After running, bump the README cache-buster (`logo.png?v=N`) and rebuild the
desktop app (`pnpm build:mac`) if the app icon changed.

## `gen-og-image.py` — rebuild the marketing OG card

Redraws `apps/web/public/og-image.png` (3200x1680, the 1.91:1 ratio Open Graph
and Twitter both want, at 2x) from scratch: app icon over a soft brand-blue
glow, white wordmark, slate tagline.

```bash
python3 scripts/gen-og-image.py
```

**Requirements:** `pip install pillow`. Fonts: macOS SF Pro (falls back to Arial).

Reach for this when the wording, type, or layout changes. For a logo-only
refresh use `gen-brand-icons.py` — its `swap_og()` pastes the new icon over the
old one in place, which needs the tile this script draws to already be there.
Both are kept in sync by hand; if you move the icon here, re-run the brand
script afterwards to confirm it still finds it.
