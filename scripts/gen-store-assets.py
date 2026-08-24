#!/usr/bin/env python3
"""Chrome Web Store assets: blue card, centred headline, and a layered cluster.

The panel overlaps the browser window rather than sitting inside it, and both
lie flat. An earlier pass rotated them opposite ways, which is what made them
read as two unrelated objects; at 0deg they group without needing the heavy
drop shadows that turned into smudges on flat colour.

The arrangement moves between tiles (panel right, panel left, panel low, window
alone) so the set does not read as one template five times. The page under the
panel is a neutral unbranded mock, not our own site.

Rendered in headless Chrome at 2x so the type and the Apple Color Emoji stay
crisp, then downsampled to the canvas the store wants.
"""

import base64
import pathlib
import sys

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from cdp import Browser  # noqa: E402

HERE = pathlib.Path(__file__).parent
OUT = HERE / "store5"
SHOTS = HERE / "shots"
REPO = pathlib.Path("/Users/ethos/code/personal/captureflow")
ICON = REPO / "apps/extension/store/store-icon-128.png"

BLUE = "#2563eb"
PAGE = SHOTS / "page-mock.png"
PAGE_AR = 1360 / 900
PV, PS, PP, PD = (
    SHOTS / "popup-video.png",
    SHOTS / "popup-shot.png",
    SHOTS / "popup-paused.png",
    SHOTS / "popup-done.png",
)


def uri(p: pathlib.Path) -> str:
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { overflow:hidden; }
body {
  background:__BG__; position:relative;
  font-family:-apple-system,'SF Pro Display',system-ui,'Inter',sans-serif;
}
h1 {
  position:absolute; left:0; width:100%; text-align:center; color:#fff;
  font-weight:800; letter-spacing:-0.025em; line-height:1.12; z-index:8;
}
.sub {
  position:absolute; left:0; width:100%; text-align:center; color:#cfdeff;
  font-weight:600; line-height:1.4; z-index:8;
}
/* Flat, so the window and the panel group instead of leaning apart, and one
   modest shadow each: a wide dark blur on flat colour reads as dirt. */
.win {
  position:absolute; border-radius:11px; overflow:hidden; background:#1b1e24;
  box-shadow:0 20px 44px rgba(3,12,45,.34), 0 3px 10px rgba(3,12,45,.24);
}
.chrome {
  height:26px; background:#2b2e35; display:flex; align-items:center;
  padding:0 10px; gap:5px;
}
.dot { width:8px; height:8px; border-radius:50%; }
.bar { flex:1; height:13px; margin:0 8px; border-radius:7px; background:#3a3e46; }
.win img { display:block; width:100%; }
img.card {
  position:absolute; border-radius:13px;
  box-shadow:0 22px 46px rgba(3,12,45,.42), 0 4px 12px rgba(3,12,45,.28);
}
img.mark { position:absolute; border-radius:22%;
  box-shadow:0 14px 30px rgba(3,12,45,.34); }
.emoji {
  position:absolute; line-height:1; font-family:'Apple Color Emoji';
  filter:drop-shadow(0 12px 18px rgba(3,12,45,.38));
}
"""


def window(x: int, y: int, w: int, z: int = 3) -> str:
    return (
        f"<div class='win' style='left:{x}px;top:{y}px;width:{w}px;z-index:{z}'>"
        "<div class='chrome'>"
        "<span class='dot' style='background:#ff5f57'></span>"
        "<span class='dot' style='background:#febc2e'></span>"
        "<span class='dot' style='background:#28c840'></span>"
        "<span class='bar'></span></div>"
        f"<img src='{uri(PAGE)}'></div>"
    )


def card(src: pathlib.Path, x: int, y: int, w: int, z: int = 5) -> str:
    return (
        f"<img class='card' style='left:{x}px;top:{y}px;width:{w}px;"
        f"z-index:{z}' src='{uri(src)}'>"
    )


def mark(x: int, y: int, w: int, z: int = 6) -> str:
    return (
        f"<img class='mark' style='left:{x}px;top:{y}px;width:{w}px;"
        f"z-index:{z}' src='{uri(ICON)}'>"
    )


# The bare glyph, no blue squircle behind it. Path is the same one
# apps/web/components/brand-mark.tsx draws, which traces the shape inside the
# app icon; keep the two in step.
GLYPH_PATH = (
    "M86.24,63.54l4.19-9.08L55.86,43.16l0,0v0L52.19,42l33-8-3.46-9.38L49.31,41l-.05,0,0,0"
    "-3.44,1.75,17.68-29L54.46,9.57,43.16,44.14l0,0h0L42,47.81l-8-33-9.38,3.46L41,50.69l0,"
    ".05,0,0,1.75,3.44-29-17.68L9.57,45.54l34.57,11.3,0,0v0L47.81,58l-33,8,3.46,9.38L50.69,"
    "59l.05,0,0,0,3.44-1.75-17.68,29,9.08,4.19,11.3-34.57,0,0h0L58,52.19l8,33,9.38-3.46L59,"
    "49.31l0-.05,0,0-1.75-3.44ZM57.81,51.22l-3.15,5.16-5.88,1.43-5.16-3.15-1.43-5.88,3.15-"
    "5.16,5.88-1.43,5.16,3.15Z"
)


def glyph(x: int, y: int, size: int, fill: str = "#ffffff", z: int = 6) -> str:
    return (
        f"<svg viewBox='0 0 100 100' width='{size}' height='{size}' fill='{fill}' "
        f"style='position:absolute;left:{x}px;top:{y}px;z-index:{z}'>"
        f"<path d='{GLYPH_PATH}'/></svg>"
    )


def build(s: dict, w: int, h: int) -> str:
    css = CSS.replace("__BG__", BLUE)
    p = [
        "<!doctype html><meta charset='utf-8'>",
        f"<style>{css}\nhtml,body{{width:{w}px;height:{h}px}}</style>",
    ]
    p.append(
        f"<h1 style='top:{s['title_at']}px;font-size:{s.get('title_size', 44)}px'>"
        f"{s['title']}</h1>"
    )
    if s.get("sub"):
        p.append(
            f"<div class='sub' style='top:{s['sub_at']}px;"
            f"font-size:{s.get('sub_size', 20)}px'>{s['sub']}</div>"
        )
    p.extend(s.get("layers", []))
    for e in s.get("emoji", []):
        glyph, ex, ey, size, rot = e[:5]
        z = e[5] if len(e) > 5 else 7
        p.append(
            f"<div class='emoji' style='left:{ex}px;top:{ey}px;font-size:{size}px;"
            f"z-index:{z};transform:rotate({rot}deg)'>{glyph}</div>"
        )
    return "".join(p)


def screenshots() -> list:
    return [
        {   # window left, panel front-right
            "title": "Record Your Screen in One Click",
            "sub": "A tab, a window, or your whole screen, with camera and mic.",
            "title_at": 60, "sub_at": 130,
            "layers": [window(214, 226, 640), card(PV, 626, 322, 296)],
            "emoji": [("🎬", 852, 232, 78, -14, 4), ("📹", 126, 516, 70, -8)],
        },
        {   # mirrored: panel front-left, window right
            "title": "Your Link Is Ready When You Stop",
            "sub": "It uploads while you record, so the URL is already copied.",
            "title_at": 60, "sub_at": 130,
            "layers": [window(396, 222, 636), card(PD, 210, 286, 296)],
            "emoji": [("🔗", 924, 596, 70, -12), ("✨", 138, 676, 56, 10)],
        },
        {   # window wide, panel dropped low-right
            "title": "Pause and Resume Mid-Recording",
            "sub": "Controls stay on the page and the result is one continuous video.",
            "title_at": 60, "sub_at": 130,
            "layers": [window(238, 220, 690), card(PP, 742, 352, 274)],
            "emoji": [("⏸️", 116, 618, 72, -10), ("🎞️", 948, 232, 58, 12, 4)],
        },
        {   # short panel, tucked top-left of the window
            "title": "Screenshots Share the Same Way",
            "sub": "Grab the current tab and send a hosted link, not an attachment.",
            "title_at": 60, "sub_at": 130,
            "layers": [window(346, 244, 636), card(PS, 198, 306, 300)],
            "emoji": [("📸", 916, 592, 74, -12), ("✂️", 240, 616, 58, 14)],
        },
        {   # window alone, brand mark in front
            "title": "Open Source. Host It Yourself",
            "sub": "AGPL-3.0, and every feature ships in that build.",
            "title_at": 60, "sub_at": 130,
            "layers": [window(310, 232, 668), mark(212, 476, 128)],
            "emoji": [("🔒", 936, 300, 68, -10), ("☁️", 898, 610, 60, 8)],
        },
    ]


def small_tile() -> dict:
    return {
        "title": "CaptureFlow",
        "title_size": 38,
        "title_at": 128,
        "sub": "Record your screen. Send a link.",
        "sub_size": 15,
        "sub_at": 180,
        "layers": [glyph(178, 40, 84, "#ffffff")],
        "emoji": [("🎬", 356, 206, 34, -12)],
    }


def marquee() -> dict:
    return {
        "title": "Record Your Screen. Send a Link.",
        "title_size": 42,
        "title_at": 52,
        "sub": "Open-source screen recorder and screenshot tool for Chrome.",
        "sub_size": 18,
        "sub_at": 118,
        "layers": [window(336, 176, 528), card(PV, 642, 214, 232)],
        "emoji": [("🎬", 836, 182, 54, -14, 4), ("⚡️", 262, 300, 48, 10)],
    }


def render(b: Browser, spec: dict, w: int, h: int, out: pathlib.Path) -> None:
    f = HERE / ".v5.html"
    f.write_text(build(spec, w, h))
    b.cmd("Emulation.setDeviceMetricsOverride",
          {"width": w, "height": h, "deviceScaleFactor": 2, "mobile": False})
    b.goto(f"file://{f}", settle=1.8)
    raw = out.with_suffix(".raw.png")
    b.shot(raw, clip={"x": 0, "y": 0, "width": w, "height": h}, scale=2)
    Image.open(raw).resize((w, h), Image.LANCZOS).convert("RGB").save(out)
    raw.unlink()
    f.unlink()
    print(f"  {out.name}  {w}x{h}")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    b = Browser(port=9705, width=1280, height=800, scale=2)
    try:
        for i, s in enumerate(screenshots(), 1):
            render(b, s, 1280, 800, OUT / f"screenshot-{i}.png")
        render(b, small_tile(), 440, 280, OUT / "promo-small-440x280.png")
        render(b, marquee(), 1400, 560, OUT / "promo-marquee-1400x560.png")
    finally:
        b.close()


if __name__ == "__main__":
    main()
