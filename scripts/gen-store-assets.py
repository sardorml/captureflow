#!/usr/bin/env python3
"""Chrome Web Store assets in the store2 style: flat blue card, white headline
top-left, angled product shots with a pool of light behind them, emoji props.

Five 1280x800 screenshots plus the 440x280 small tile and the 1400x560 marquee.
Rendered in headless Chrome at 2x so the type and the Apple Color Emoji stay
crisp, then downsampled to the exact canvas the store wants.
"""

import base64
import pathlib
import sys

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from cdp import Browser  # noqa: E402

HERE = pathlib.Path(__file__).parent
OUT = HERE / "store3"
SHOTS = HERE / "shots"
BLUE = "#2563eb"

DASH = SHOTS / "region-share.png"
POPUP_VIDEO = SHOTS / "popup-video.png"
POPUP_SHOT = SHOTS / "popup-shot.png"
POPUP_PAUSED = SHOTS / "popup-paused.png"
POPUP_DONE = SHOTS / "popup-done.png"
ICON = pathlib.Path(
    "/Users/ethos/code/personal/captureflow/apps/extension/store/store-icon-128.png"
)


def uri(p: pathlib.Path) -> str:
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


def css(w: int, h: int) -> str:
    return f"""
* {{ margin:0; padding:0; box-sizing:border-box; }}
html,body {{ width:{w}px; height:{h}px; overflow:hidden; }}
body {{
  background:{BLUE};
  font-family:-apple-system,'SF Pro Display',system-ui,'Inter',sans-serif;
  position:relative;
}}
h1 {{
  position:absolute; color:#fff; font-weight:800;
  letter-spacing:-0.025em; line-height:1.08; z-index:6;
}}
.sub {{
  position:absolute; color:#d3e1ff; font-weight:600;
  font-size:19px; line-height:1.38; z-index:6;
}}
img.shot {{
  position:absolute; border-radius:14px; z-index:3;
  box-shadow:0 40px 80px rgba(3,12,45,.46), 0 8px 20px rgba(3,12,45,.3);
}}
img.panel {{
  position:absolute; border-radius:18px; z-index:5;
  box-shadow:0 44px 88px rgba(3,12,45,.52), 0 10px 22px rgba(3,12,45,.34);
}}
img.mark {{ position:absolute; z-index:6; border-radius:22%; }}
.emoji {{
  position:absolute; z-index:7; line-height:1;
  font-family:'Apple Color Emoji';
  filter:drop-shadow(0 16px 22px rgba(3,12,45,.4));
}}
/* A pool of light so the cluster sits on the card instead of floating on flat
   colour. */
.glow {{
  position:absolute; border-radius:50%; z-index:1;
  background:radial-gradient(ellipse at center,
    rgba(255,255,255,.17), rgba(255,255,255,0) 70%);
}}
"""


def build(s: dict, w: int, h: int) -> str:
    p = [f"<!doctype html><meta charset='utf-8'><style>{css(w, h)}</style>"]
    for g in s.get("glow", []):
        p.append(
            f"<div class='glow' style='left:{g[0]}px;top:{g[1]}px;"
            f"width:{g[2]}px;height:{g[3]}px'></div>"
        )
    p.append(
        f"<h1 style='left:{s['title_at'][0]}px;top:{s['title_at'][1]}px;"
        f"font-size:{s.get('title_size', 52)}px;"
        f"max-width:{s.get('title_w', 620)}px'>{s['title']}</h1>"
    )
    if s.get("sub"):
        p.append(
            f"<div class='sub' style='left:{s['sub_at'][0]}px;top:{s['sub_at'][1]}px;"
            f"max-width:{s.get('sub_w', 460)}px;"
            f"font-size:{s.get('sub_size', 19)}px'>{s['sub']}</div>"
        )
    for im in s.get("images", []):
        style = (
            f"left:{im['x']}px;top:{im['y']}px;"
            + (f"width:{im['w']}px;" if im.get("w") else "")
            + (f"height:{im['h']}px;" if im.get("h") else "")
            + (f"transform:rotate({im['rot']}deg);" if im.get("rot") else "")
            + (f"z-index:{im['z']};" if im.get("z") else "")
        )
        p.append(f"<img class='{im.get('cls', 'shot')}' style='{style}' src='{im['src']}'>")
    for e in s.get("emoji", []):
        p.append(
            f"<div class='emoji' style='left:{e[1]}px;top:{e[2]}px;"
            f"font-size:{e[3]}px;transform:rotate({e[4]}deg)'>{e[0]}</div>"
        )
    return "".join(p)


def screenshots() -> list:
    dash = uri(DASH)
    pv, ps, pp, pd = (uri(x) for x in (POPUP_VIDEO, POPUP_SHOT, POPUP_PAUSED, POPUP_DONE))
    return [
        {
            "title": "Record Your Screen<br>in One Click 🎬",
            "sub": "A tab, a window, or your whole screen, with camera and mic, "
            "without leaving the page.",
            "title_at": (72, 76),
            "sub_at": (74, 218),
            "sub_w": 400,
            "glow": [(430, 250, 800, 500)],
            "images": [
                {"src": dash, "x": 500, "y": 262, "w": 680, "rot": -4, "z": 3},
                {"src": pv, "x": 104, "y": 336, "w": 250, "cls": "panel", "rot": 3},
            ],
            "emoji": [("🎬", 408, 604, 72, -14), ("⚡️", 1146, 152, 58, 12)],
        },
        {
            "title": "Your Link Is Ready<br>the Moment You Stop 🔗",
            "sub": "It uploads while you record, so the share URL is on your "
            "clipboard when you hit stop.",
            "title_at": (72, 76),
            "sub_at": (74, 236),
            "sub_w": 380,
            "glow": [(440, 200, 820, 530)],
            "images": [
                {"src": dash, "x": 470, "y": 208, "w": 730, "rot": -3, "z": 3},
                {"src": pd, "x": 96, "y": 386, "w": 258, "cls": "panel", "rot": 3},
            ],
            "emoji": [("🔗", 392, 640, 68, -12), ("✨", 1168, 596, 52, 8)],
        },
        {
            "title": "Pause and Resume<br>Mid-Recording ⏯️",
            "sub": "Controls stay on the page, and the result is still one "
            "continuous video.",
            "title_at": (72, 76),
            "sub_at": (74, 236),
            "sub_w": 380,
            "glow": [(450, 230, 800, 510)],
            "images": [
                {"src": dash, "x": 512, "y": 254, "w": 670, "rot": -4, "z": 3},
                {"src": pp, "x": 100, "y": 356, "w": 252, "cls": "panel", "rot": 3},
            ],
            "emoji": [("⏸️", 404, 630, 66, -12), ("⏱️", 1150, 160, 56, 14)],
        },
        {
            "title": "Screenshots Share<br>the Same Way 📸",
            "sub": "Grab the current tab in one click and send a hosted link "
            "instead of an attachment.",
            "title_at": (72, 76),
            "sub_at": (74, 218),
            "sub_w": 400,
            "glow": [(470, 240, 800, 500)],
            "images": [
                {"src": dash, "x": 520, "y": 268, "w": 660, "rot": -4, "z": 3},
                {"src": ps, "x": 108, "y": 404, "w": 264, "cls": "panel", "rot": 3},
            ],
            "emoji": [("📸", 424, 596, 72, -12), ("✂️", 1150, 168, 56, 16)],
        },
        {
            "title": "Open Source.<br>Host It Yourself ☁️",
            "sub": "AGPL-3.0, and every feature ships in that build. Run the "
            "whole stack on your own Cloudflare account.",
            "title_at": (72, 76),
            "sub_at": (74, 218),
            "sub_w": 410,
            "glow": [(470, 220, 800, 520)],
            "images": [
                {"src": dash, "x": 528, "y": 246, "w": 660, "rot": -4, "z": 3},
                {"src": uri(ICON), "x": 118, "y": 402, "w": 104, "cls": "mark"},
            ],
            "emoji": [("🔒", 262, 414, 62, -10), ("☁️", 1148, 640, 56, 10)],
        },
    ]


def small_tile() -> dict:
    return {
        "title": "CaptureFlow",
        "title_size": 40,
        "title_at": (132, 96),
        "title_w": 300,
        "sub": "Record your screen. Send a link.",
        "sub_size": 15,
        "sub_at": (132, 150),
        "sub_w": 290,
        "glow": [(60, 40, 340, 240)],
        "images": [{"src": uri(ICON), "x": 44, "y": 96, "w": 72, "cls": "mark"}],
        "emoji": [("🎬", 372, 206, 34, -12)],
    }


def marquee() -> dict:
    return {
        "title": "Record Your Screen.<br>Send a Link. 🎬",
        "title_size": 58,
        "title_at": (84, 150),
        "title_w": 620,
        "sub": "Open-source screen recorder and screenshot tool for Chrome. "
        "No exporting, no attachments.",
        "sub_size": 21,
        "sub_at": (86, 352),
        "sub_w": 480,
        "glow": [(600, 60, 860, 500)],
        "images": [
            {"src": uri(DASH), "x": 700, "y": 96, "w": 740, "rot": -4, "z": 3},
            {"src": uri(POPUP_VIDEO), "x": 616, "y": 214, "w": 216,
             "cls": "panel", "rot": 3},
        ],
        "emoji": [("⚡️", 1332, 452, 52, 12)],
    }


def render(b: Browser, spec: dict, w: int, h: int, out: pathlib.Path) -> None:
    f = HERE / ".v3.html"
    f.write_text(build(spec, w, h))
    b.cmd("Emulation.setDeviceMetricsOverride",
          {"width": w, "height": h, "deviceScaleFactor": 2, "mobile": False})
    b.goto(f"file://{f}", settle=1.6)
    raw = out.with_suffix(".raw.png")
    b.shot(raw, clip={"x": 0, "y": 0, "width": w, "height": h}, scale=2)
    Image.open(raw).resize((w, h), Image.LANCZOS).convert("RGB").save(out)
    raw.unlink()
    f.unlink()
    print(f"  {out.name}  {w}x{h}")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    b = Browser(port=9702, width=1280, height=800, scale=2)
    try:
        for i, s in enumerate(screenshots(), 1):
            render(b, s, 1280, 800, OUT / f"screenshot-{i}.png")
        render(b, small_tile(), 440, 280, OUT / "promo-small-440x280.png")
        render(b, marquee(), 1400, 560, OUT / "promo-marquee-1400x560.png")
    finally:
        b.close()


if __name__ == "__main__":
    main()
