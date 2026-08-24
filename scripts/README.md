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

**`apple-touch-icon.png` is the Google search-result favicon.** Google picks one
icon per site and has cached this file for `captureflow.dev` — the tab reads
`icon.svg` instead, so the two are independent. It is the round logo
(`disc()`) flattened onto white, not a `bleed_card()`: the card's frame and
shadow left the glyph unreadable at the 16-20px Google renders it at, and the
white flatten is required because iOS composites an apple-touch-icon's
transparency onto black. Google re-crawls favicons on its own schedule, so a
change here takes days to weeks to show in search — check it with
`preview-search-result.py`.

After running, bump the README cache-buster (`logo.png?v=N`) and rebuild the
desktop app (`pnpm build:mac`) if the app icon changed.

## `preview-search-result.py` — how a URL will look in Google

Paste any production URL. It fetches the page, lists every favicon declared,
ranks them the way Google's crawler does, and renders a result row using the
winner — next to the icon Google has cached **today**, so a pending change is
visible as a before/after.

```bash
# against production — shows what is live, not what is in your working tree
python3 scripts/preview-search-result.py https://captureflow.dev

# against the dev server, compared to the real domain's Google cache:
# this is how you preview an icon change before deploying it
python3 scripts/preview-search-result.py http://localhost:3032 --as captureflow.dev
```

**Requirements:** `pip install pillow certifi`.

It reads whatever the URL actually serves. Point it at production and you see
production's icons — an undeployed change will _not_ appear, and the banner will
say the two rows match. Use `--as` to preview local work.

Google publishes no favicon preview tool and no exact algorithm, so the pick is
informed rather than certain. The ranking is calibrated against what Google
actually serves for `captureflow.dev`: the 180px `apple-touch-icon` beat both the
48px `.ico` and the SVG, so raw size outranks the "multiple of 48px" advice in
Google's own docs. If a site is ever observed to contradict the prediction,
recalibrate `rank()` rather than trusting it.

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

## `gen-readme-hero.py` — rebuild the README banner

Draws `.github/assets/readme-hero.png` (2160x1080), the blue tile at the top of
the root README: the recorder panel overlapping the CaptureFlow dashboard, with
the two emoji props.

```bash
cd scripts && python3 gen-readme-hero.py
```

It is `gen-store-assets.py`'s first screenshot, re-laid-out — the module is
imported rather than copied, so the blue, the CSS, and the window/panel markup
have one definition. Three things differ: the canvas is 2:1 rather than 1.6:1,
because a README hero sits in a ~1000px column; there is no headline on it,
because the name and the tagline are already text directly above; and the page
under the panel is our own dashboard rather than the store tiles' neutral mock,
because a README is about us where a listing is about the recorder.

**Requirements:** `pip install pillow websocket-client`, headless Chrome, and
the captures under `scripts/shots/` (see below).

## `cap-readme-dashboard.py` — photograph the dashboard for that banner

Writes `shots/page-dashboard.png`, the signed-in `/recordings` page at 1360x900
in light theme. Light because the panel that lands on top of it is dark and
needs something to sit against, which is the same reason the store tiles put a
light page under theirs.

It signs up its own account, seeds six recordings and their poster JPEGs, takes
the shot, and deletes all of it again — so the banner does not depend on what
happens to be in your dev database, and nothing is left in it afterwards. The
cards read thumbnails from the CDN origin, so the dev server has to be started
with that pointed at the seeded files:

```bash
cd apps/web && NEXT_PUBLIC_R2_PUBLIC_BASE_URL=http://localhost:3032/demo-posters \
  npx next dev -p 3032
# then, in another shell:
cd scripts && python3 cap-readme-dashboard.py && python3 gen-readme-hero.py
```

It refuses to write a shot of the login page or one with missing thumbnails
rather than producing a quietly wrong banner.

## The `shots/` captures

Both `gen-store-assets.py` and `gen-readme-hero.py` compose from PNGs in
`scripts/shots/`, which is gitignored — they are intermediates, not assets.
`page-mock.png` comes from `gen-store-page-mock.py` and `page-dashboard.png`
from `cap-readme-dashboard.py`; the `popup-*.png` panel states are captured off
the built extension by hand over CDP (`cdp.py` is the driver). Regenerate the
page mock with:

```bash
cd scripts && python3 gen-store-page-mock.py
```

Neither generator runs from a clean checkout until those captures are back, and
the panel states are the one piece with no script behind them yet.
