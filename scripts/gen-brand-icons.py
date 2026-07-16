#!/usr/bin/env python3
"""CaptureFlow brand-asset generator (from an Icon Composer .icon bundle).

Single source of truth for every prod logo / icon / favicon / OG image.
Give it the `.icon` exported from Icon Composer and it regenerates all ~20
raster assets so a colour/art change is one command instead of hand-editing
PNGs.

    python3 scripts/gen-brand-icons.py [path/to/captureflow.icon]
    # default source: ~/Downloads/captureflow.icon

Pipeline (macOS only — needs Xcode's actool + iconutil):
  1. actool compiles the .icon for macOS and emits an .icns; iconutil
     extracts its largest render (256px — the faithful macOS squircle, with
     the system's automatic-gradient + the yin-yang baked in). The full-res
     render lives in Assets.car (used by the packaged app via electron-builder
     `mac.icon`), but is not extractable via CLI, so 256 is the master source.
  2. Crop that render to the squircle's bounds -> a full-bleed squircle
     (matching how the web logos are framed) and upscale to a 1024 master.
  3. Derive every asset from the master: square logos, round logos (inscribed
     disc), maskable / apple-touch (gradient card + floating squircle), tray
     discs, favicons, and the OG image (logo swapped in place over the dark
     card). Also copy the .icon into the desktop build dir and rebuild the
     pre-26 fallback .icns.

NOT touched: apps/desktop/resources/icon-dev.png (the amber dev-build icon).

Requires: Pillow, numpy  (pip install pillow numpy)
"""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "apps/web/public"
DRES = ROOT / "apps/desktop/resources"
DASSETS = ROOT / "apps/desktop/src/renderer/src/assets"
DBUILD = ROOT / "apps/desktop/build"
DOCS = ROOT / "apps/docs/public"
EXT = ROOT / "apps/extension/public/icon"

ACTOOL = "/Applications/Xcode.app/Contents/Developer/usr/bin/actool"


def log(msg):
    print(f"  {msg}")


# Icon Composer's flat PNG export (File ▸ Export). When present and fresh it's
# the crisp 1024 master; otherwise we fall back to actool's 256 render upscaled.
PNG_EXPORT = Path.home() / "Downloads/captureflow-iOS-Default-1024x1024@1x.png"


def master_from_png(png: Path) -> Image.Image:
    """A flat 1024 Icon Composer export — already a full-bleed squircle. Just
    crop to its opaque bounds (paranoia) and normalise to 1024."""
    im = Image.open(png).convert("RGBA")
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > 8)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    side = max(x1 - x0 + 1, y1 - y0 + 1)
    cx, cy = (x0 + x1 + 1) // 2, (y0 + y1 + 1) // 2
    crop = im.crop((cx - side // 2, cy - side // 2,
                    cx - side // 2 + side, cy - side // 2 + side))
    return crop.resize((1024, 1024), Image.LANCZOS)


# ── 1 + 2. Render the .icon -> full-bleed 1024 master (fallback) ─────────────
def build_master(icon_src: Path, tmp: Path) -> Image.Image:
    work = tmp / "captureflow.icon"
    shutil.copytree(icon_src, work)
    out = tmp / "out"
    out.mkdir()
    actool = ACTOOL if Path(ACTOOL).exists() else "actool"
    subprocess.run(
        [actool, str(work), "--compile", str(out), "--app-icon", "captureflow",
         "--platform", "macosx", "--minimum-deployment-target", "11.0",
         "--output-partial-info-plist", str(out / "p.plist"),
         "--output-format", "human-readable-text"],
        cwd=tmp, check=True, capture_output=True, text=True,
    )
    iconset = tmp / "r.iconset"
    subprocess.run(["iconutil", "--convert", "iconset",
                    str(out / "captureflow.icns"), "--output", str(iconset)],
                   check=True, capture_output=True, text=True)
    ren = Image.open(iconset / "icon_128x128@2x.png").convert("RGBA")  # 256px
    a = np.array(ren)[..., 3]
    ys, xs = np.where(a > 8)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    side = max(x1 - x0 + 1, y1 - y0 + 1)
    cx, cy = (x0 + x1 + 1) // 2, (y0 + y1 + 1) // 2
    crop = ren.crop((cx - side // 2, cy - side // 2,
                     cx - side // 2 + side, cy - side // 2 + side))
    return crop.resize((1024, 1024), Image.LANCZOS)


# ── shape helpers ───────────────────────────────────────────────────────────
def square(master, size):
    return master.resize((size, size), Image.LANCZOS)


def disc(master, size, inset=0.06):
    """Inscribed circular crop (round logo / tray). Inset keeps the disc inside
    the squircle's rounded corners so no transparent bites show."""
    n = master.width
    R = int(n / 2 * (1 - inset))
    cx = cy = n // 2
    crop = master.crop((cx - R, cy - R, cx + R, cy + R))
    m = crop.width
    yy, xx = np.mgrid[0:m, 0:m]
    rr = m / 2.0
    mask = ((((xx - rr + 0.5) ** 2 + (yy - rr + 0.5) ** 2) <= (rr - 0.5) ** 2) * 255).astype("uint8")
    alpha = np.minimum(np.array(crop.split()[-1]), mask)
    crop.putalpha(Image.fromarray(alpha, "L"))
    return crop.resize((size, size), Image.LANCZOS)


def _blend(c, other, t):
    return tuple(round(c[i] * (1 - t) + other[i] * t) for i in range(3))


def bleed_card(master, size):
    """Maskable / apple-touch: a full gradient square (fills the corners so
    masking never reveals transparency) with the squircle floating in the safe
    zone over a soft shadow. Opaque RGBA."""
    big = master.resize((1024, 1024), Image.LANCZOS)
    # Sample the icon's dominant saturated blue (robust to the macOS render's
    # bright top highlight + the white yin-yang) and build a light->deep blue
    # card gradient from it, so the floating squircle reads on top.
    a3 = np.array(big.convert("RGB")).reshape(-1, 3).astype(float)
    al = np.array(big.split()[-1]).reshape(-1)
    r, g, b = a3[:, 0], a3[:, 1], a3[:, 2]
    mx = np.maximum.reduce([r, g, b])
    mn = np.minimum.reduce([r, g, b])
    sat = (mx - mn) / (mx + 1e-6)
    blue = (al > 200) & (b > 120) & (sat > 0.4) & (b >= r) & (b >= g)
    base = tuple(a3[blue].mean(axis=0).round().astype(int))
    bg_tl = _blend(base, (255, 255, 255), 0.22)  # lighter top-left
    bg_br = _blend(base, (0, 0, 0), 0.12)         # deeper bottom-right
    # diagonal gradient (top-left -> bottom-right)
    yy, xx = np.mgrid[0:1024, 0:1024]
    t = ((xx + yy) / (2 * 1023.0))[..., None]
    grad = (np.array(bg_tl) * (1 - t) + np.array(bg_br) * t).astype("uint8")
    card = Image.fromarray(np.dstack([grad, np.full((1024, 1024), 255, "uint8")]), "RGBA")
    # floating squircle (safe zone ~0.82) + soft drop shadow
    fg = master.resize((round(1024 * 0.82),) * 2, Image.LANCZOS)
    off = (1024 - fg.width) // 2
    shadow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    sh = Image.new("RGBA", fg.size, (0, 0, 0, 0))
    sh.putalpha(fg.split()[-1].point(lambda v: int(v * 0.34)))
    shadow.alpha_composite(sh, (off, off + 14))
    from PIL import ImageFilter
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    card.alpha_composite(shadow)
    card.alpha_composite(fg, (off, off))
    return card.resize((size, size), Image.LANCZOS)


def save_ico(master, path, sizes=((16, 16), (32, 32), (48, 48))):
    src = square(master, 256)
    src.save(path, format="ICO", sizes=list(sizes))


# ── 3. Generate every asset ─────────────────────────────────────────────────
def generate(master, icon_src):
    # Web
    square(master, 512).save(WEB / "logo.png")
    square(master, 512).save(WEB / "icon-512.png")
    square(master, 192).save(WEB / "icon-192.png")
    disc(master, 512).save(WEB / "logo-round.png")
    bleed_card(master, 512).convert("RGB").save(WEB / "icon-512-maskable.png")
    bleed_card(master, 192).convert("RGB").save(WEB / "icon-192-maskable.png")
    bleed_card(master, 180).convert("RGB").save(WEB / "apple-touch-icon.png")
    save_ico(master, WEB / "favicon.ico")
    log("web/ logos, maskable, apple-touch, favicon")

    # OG image — swap the logo in place, keep the dark card + text + shadow.
    swap_og(master, WEB / "og-image.png")
    log("web/og-image.png (logo swapped in place)")

    # Desktop recorder  (icon-dev.png deliberately left amber)
    square(master, 1024).save(DRES / "icon.png")
    square(master, 512).save(DRES / "logo.png")
    disc(master, 22).save(DRES / "trayIcon.png")
    disc(master, 44).save(DRES / "trayIcon@2x.png")
    square(master, 1024).save(DASSETS / "logo.png")
    disc(master, 512).save(DASSETS / "logo-round.png")
    log("desktop resources + renderer assets + tray")

    # Desktop build: ship the .icon source + rebuild the pre-26 fallback .icns
    dst_icon = DBUILD / "captureflow.icon"
    if dst_icon.exists():
        shutil.rmtree(dst_icon)
    shutil.copytree(icon_src, dst_icon)
    build_icns(master, DBUILD / "icon.icns")
    log("desktop build/captureflow.icon + icon.icns")

    # Docs
    square(master, 512).save(DOCS / "logo.png")
    save_ico(master, DOCS / "favicon.ico")
    log("docs logo + favicon")

    # Browser extension (WXT wires public/icon/<size>.png into the manifest)
    for size in (16, 32, 48, 128):
        square(master, size).save(EXT / f"{size}.png")
    log("extension public/icon 16/32/48/128")


def swap_og(master, og_path):
    og = Image.open(og_path).convert("RGBA")
    arr = np.array(og).astype(float)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn) / (mx + 1e-6)
    body = (sat > 0.35) & (mx > 80)        # the saturated blue logo on the dark card
    ys, xs = np.where(body)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    side = max(x1 - x0 + 1, y1 - y0 + 1)
    cx, cy = (x0 + x1 + 1) // 2, (y0 + y1 + 1) // 2
    box = (cx - side // 2, cy - side // 2)
    logo = master.resize((side, side), Image.LANCZOS)
    og.alpha_composite(logo, box)
    og.convert("RGB").save(og_path)


def build_icns(master, out_icns):
    with tempfile.TemporaryDirectory() as td:
        iconset = Path(td) / "cf.iconset"
        iconset.mkdir()
        for size, name in [(16, "icon_16x16.png"), (32, "icon_16x16@2x.png"),
                           (32, "icon_32x32.png"), (64, "icon_32x32@2x.png"),
                           (128, "icon_128x128.png"), (256, "icon_128x128@2x.png"),
                           (256, "icon_256x256.png"), (512, "icon_256x256@2x.png"),
                           (512, "icon_512x512.png"), (1024, "icon_512x512@2x.png")]:
            square(master, size).save(iconset / name)
        subprocess.run(["iconutil", "--convert", "icns", str(iconset),
                        "--output", str(out_icns)], check=True)


def main():
    # Arg may be a .icon bundle OR a flat PNG export; default to ~/Downloads.
    arg = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    icon_src = arg if (arg and arg.suffix == ".icon") else Path.home() / "Downloads/captureflow.icon"
    if not icon_src.is_dir():
        sys.exit(f"icon bundle not found: {icon_src}")

    # Pick the raster master source: a flat PNG export (crisp) if it's at least
    # as fresh as the .icon, else actool's render of the .icon (upscaled).
    png = arg if (arg and arg.suffix == ".png") else (
        PNG_EXPORT if PNG_EXPORT.is_file()
        and PNG_EXPORT.stat().st_mtime >= icon_src.stat().st_mtime else None)

    with tempfile.TemporaryDirectory() as td:
        if png:
            print(f"Master: {png}  (crisp PNG export)")
            master = master_from_png(png)
        else:
            print(f"Master: {icon_src}  (actool render — export a 1024 PNG for max sharpness)")
            master = build_master(icon_src, Path(td))
        print(f".icon source for build/: {icon_src}")
        generate(master, icon_src)
    print("✓ done — review `git diff --stat`, then rebuild the desktop app if needed.")


if __name__ == "__main__":
    main()
