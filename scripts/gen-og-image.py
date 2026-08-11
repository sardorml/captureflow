#!/usr/bin/env python3
"""Generate the marketing OG card (`apps/web/public/og-image.png`).

Dark navy card: app icon over a soft brand-blue glow, white CaptureFlow
wordmark, slate tagline. Output is 3200x1680 — the 1.91:1 ratio Open Graph and
Twitter summary_large_image both want, at 2x for retina timelines.

    python3 scripts/gen-og-image.py

Requires: Pillow. Fonts: macOS SF Pro (falls back to Arial).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "apps/web/public/logo.png"
OUT = ROOT / "apps/web/public/og-image.png"

W, H = 3200, 1680
BG = (15, 19, 32)          # #0F1320
WORDMARK = (255, 255, 255)
TAGLINE = (148, 163, 184)  # slate-400
GLOW = (37, 99, 235)       # brand blue #2563eb

WORD = "CaptureFlow"
TAG = "Open-source screen recording with instant shareable links"

# Type sizes solved against the previous hand-made card so the wordmark and
# tagline keep their exact measure: 1361px and 2208px wide respectively.
WORD_SIZE, TAG_SIZE = 234, 91

LOGO_PX = 360
LOGO_GAP = 90    # icon bottom to wordmark cap
WORD_GAP = 131   # wordmark descender to tagline cap — carried over from the original


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


def draw_ink(draw: ImageDraw.ImageDraw, text, font, fill, cx: int, top: int) -> int:
    """Draw `text` with its *ink* box centred on cx and starting at `top`.

    PIL anchors on the font's line box, which carries leading the glyphs never
    reach; anchoring on the ink instead is what lets the measured bands above be
    reproduced exactly. Returns the ink height.
    """
    x0, y0, x1, y1 = draw.textbbox((0, 0), text, font=font)
    draw.text((cx - (x0 + x1) // 2, top - y0), text, font=font, fill=fill)
    return y1 - y0


def main() -> None:
    cx = W // 2
    word_font, tag_font = load_font(WORD_SIZE, True), load_font(TAG_SIZE, False)

    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))

    def ink_height(text, font: ImageFont.FreeTypeFont) -> int:
        _, y0, _, y1 = probe.textbbox((0, 0), text, font=font)
        return y1 - y0

    word_h, tag_h = ink_height(WORD, word_font), ink_height(TAG, tag_font)

    stack = LOGO_PX + LOGO_GAP + word_h + WORD_GAP + tag_h
    top = (H - stack) // 2

    img = Image.new("RGB", (W, H), BG)

    # Soft glow so the saturated tile sits in the card instead of on top of it.
    logo_cy = top + LOGO_PX // 2
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    r = 320
    ImageDraw.Draw(glow).ellipse(
        (cx - r, logo_cy - r, cx + r, logo_cy + r), fill=GLOW + (55,)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(170))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

    logo = Image.open(LOGO).convert("RGBA").resize(
        (LOGO_PX, LOGO_PX), Image.LANCZOS
    )
    img.paste(logo, (cx - LOGO_PX // 2, top), logo)

    draw = ImageDraw.Draw(img)
    word_top = top + LOGO_PX + LOGO_GAP
    draw_ink(draw, WORD, word_font, WORDMARK, cx, word_top)
    draw_ink(draw, TAG, tag_font, TAGLINE, cx, word_top + word_h + WORD_GAP)

    img.save(OUT)
    print(f"wrote {OUT}  ({W}x{H})")


if __name__ == "__main__":
    main()
