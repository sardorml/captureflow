#!/usr/bin/env python3
"""Generate the Lemon Squeezy product cover (4:3) for the managed-plan checkout.

Matches the og-image brand treatment (dark navy card, white CaptureFlow
wordmark, slate tagline) plus the app icon and a soft brand-blue glow. Output is
1600x1200 — the LS product-media slot is `aspect-w-4 aspect-h-3`.

    python3 scripts/gen-ls-cover.py

Requires: Pillow. Fonts: macOS SF Pro (falls back to Arial).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "apps/web/public/logo.png"
OUT = ROOT / "marketing/lemonsqueezy-cover.png"

W, H = 1600, 1200
BG = (15, 19, 32)          # #0F1320 — same dark card as og-image.png
WORDMARK = (246, 248, 251)
TAGLINE = (148, 163, 184)  # slate-400
GLOW = (37, 99, 235)       # brand blue #2563eb

WORD = "CaptureFlow"
TAG = "Open-source screen recording with instant shareable links"


def load_font(size: int, bold: bool) -> ImageFont.FreeTypeFont:
    try:
        f = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", size)
        f.set_variation_by_name("Bold" if bold else "Regular")
        return f
    except Exception:
        arial = "Arial Bold.ttf" if bold else "Arial.ttf"
        return ImageFont.truetype(
            f"/System/Library/Fonts/Supplemental/{arial}", size
        )


def main() -> None:
    cx, logo_cy = W // 2, 440
    logo_px = 280

    img = Image.new("RGB", (W, H), BG)

    # Soft brand-blue glow behind the icon.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r = 250
    ImageDraw.Draw(glow).ellipse(
        (cx - r, logo_cy - r, cx + r, logo_cy + r), fill=GLOW + (70,)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

    logo = Image.open(LOGO).convert("RGBA").resize((logo_px, logo_px), Image.LANCZOS)
    img.paste(logo, (cx - logo_px // 2, logo_cy - logo_px // 2), logo)

    draw = ImageDraw.Draw(img)
    draw.text((cx, 720), WORD, font=load_font(150, True), fill=WORDMARK, anchor="mm")
    draw.text((cx, 858), TAG, font=load_font(44, False), fill=TAGLINE, anchor="mm")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT}  ({W}x{H})")


if __name__ == "__main__":
    main()
