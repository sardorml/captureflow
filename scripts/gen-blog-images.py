#!/usr/bin/env python3
"""Social preview images for blog posts.

Renders apps/web/public/blog/<slug>.png (1200x630) for every Markdown post in
apps/web/content/blog, from its frontmatter title. Rerun after adding a post
or changing a title.

    python3 scripts/gen-blog-images.py

Inter (SIL Open Font License) is downloaded from Google Fonts on first run.

Requires: Pillow  (pip install pillow)
"""

import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "apps" / "web"
POSTS = WEB / "content" / "blog"
OUT = WEB / "public" / "blog"
LOGO = WEB / "public" / "logo.png"
FONT_CACHE = Path(tempfile.gettempdir()) / "captureflow-blog-fonts"

WIDTH, HEIGHT = 1200, 630
PAD = 80
CANVAS = "#15120f"
PANEL = "#1f1b17"
FG = "#f3eee6"
MUTED = "#a69f95"
ACCENT = "#0485f7"


def inter(weight: int, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_CACHE / f"inter-{weight}.ttf"
    if not path.exists():
        FONT_CACHE.mkdir(parents=True, exist_ok=True)
        # An old user agent makes Google Fonts serve TTF instead of WOFF2.
        # curl, not urllib: python.org builds on macOS ship without CA certs.
        css = subprocess.run(
            ["curl", "-fsSL", "-A", "Mozilla/4.0",
             f"https://fonts.googleapis.com/css2?family=Inter:wght@{weight}"],
            check=True, capture_output=True, text=True,
        ).stdout
        url = re.search(r"https://[^)]+\.ttf", css).group(0)
        subprocess.run(["curl", "-fsSL", "-o", str(path), url], check=True)
    return ImageFont.truetype(str(path), size)


def frontmatter(source: str) -> dict[str, str]:
    block = re.match(r"^---\n(.*?)\n---", source, re.S).group(1)
    return {
        key.strip(): value.strip()
        for key, value in (line.split(":", 1) for line in block.splitlines() if ":" in line)
    }


def wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=font) <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    return lines + [line]


def render(title: str, out: Path) -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), CANVAS)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        (PAD / 2, PAD / 2, WIDTH - PAD / 2, HEIGHT - PAD / 2), radius=36, fill=PANEL
    )

    logo = Image.open(LOGO).convert("RGBA").resize((64, 64), Image.LANCZOS)
    img.paste(logo, (PAD, PAD), logo)
    draw.text((PAD + 84, PAD + 32), "CaptureFlow", font=inter(700, 34), fill=FG, anchor="lm")
    draw.text(
        (WIDTH - PAD, PAD + 32), "Blog", font=inter(500, 30), fill=ACCENT, anchor="rm"
    )

    max_width = WIDTH - PAD * 2
    for size in (76, 68, 60, 54):
        font = inter(700, size)
        lines = wrap(draw, title, font, max_width)
        if len(lines) <= 3:
            break
    line_height = round(size * 1.12)
    y = HEIGHT - PAD - 56 - line_height * len(lines)
    for line in lines:
        draw.text((PAD, y), line, font=font, fill=FG)
        y += line_height

    draw.text(
        (PAD, HEIGHT - PAD - 8), "captureflow.dev/blog", font=inter(500, 28), fill=MUTED, anchor="ls"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, optimize=True)


def main() -> None:
    for post in sorted(POSTS.glob("*.md")):
        title = frontmatter(post.read_text())["title"]
        out = OUT / f"{post.stem}.png"
        render(title, out)
        print(f"{out.relative_to(ROOT)}  {title}")


if __name__ == "__main__":
    main()
