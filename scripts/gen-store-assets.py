#!/usr/bin/env python3
"""Chrome Web Store assets: flat blue card, white headline top-left, and one
product scene on the right.

The scene is a browser window with the panel sitting where the overlay actually
puts it, top-right over a dimmed page, and the whole thing is a single element
that takes one rotation and one shadow. Composing the panel as a separate
floating card left the two leaning opposite ways and needed a heavy drop shadow
under each to separate them, which read as smudges on flat blue.

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
OUT = HERE / "store4"
SHOTS = HERE / "shots"
THEMES = {
    "blue": ("#2563eb", "#fff", "#cfdeff"),
    "light": ("linear-gradient(150deg,#f7f9fc 0%,#e6ecf7 100%)", "#0b1220", "#4b5768"),
    "navy": ("linear-gradient(150deg,#101c3d 0%,#0a1226 100%)", "#fff", "#9db3dd"),
    "indigo": ("linear-gradient(150deg,#3b4fe0 0%,#1b1f5c 100%)", "#fff", "#c9d2ff"),
}
THEME = "light"
REPO = pathlib.Path("/Users/ethos/code/personal/captureflow")
ICON = REPO / "apps/extension/store/store-icon-128.png"

PAGE = SHOTS / "page-landing.png"
PAGE_W, PAGE_H = 1360, 900
# The panel is 305 CSS px on a 1360 page. Held a little above that share so the
# device names stay readable once the window is scaled into a tile.
PANEL_W = 305
PANEL_GAIN = 1.35


def uri(p: pathlib.Path) -> str:
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { overflow:hidden; }
body {
  background:__BG__;
  font-family:-apple-system,'SF Pro Display',system-ui,'Inter',sans-serif;
  position:relative;
}
h1 {
  position:absolute; color:__FG__; font-weight:800;
  letter-spacing:-0.025em; line-height:1.08; z-index:6;
}
.sub {
  position:absolute; color:__SUB__; font-weight:600;
  line-height:1.42; z-index:6;
}
/* One element, one rotation, one shadow. Tight and low-opacity: a wide dark
   blur on flat blue reads as dirt rather than as depth. */
.scene {
  position:absolute; z-index:4; border-radius:12px; overflow:hidden;
  background:#111318;
  box-shadow:0 22px 50px rgba(15,23,42,.17), 0 4px 12px rgba(15,23,42,.10);
}
.chrome {
  height:30px; background:#26282e; display:flex; align-items:center;
  padding:0 12px; gap:6px;
}
.dot { width:9px; height:9px; border-radius:50%; }
.bar {
  flex:1; height:16px; margin:0 10px; border-radius:8px; background:#35383f;
}
.viewport { position:relative; }
.viewport>img.page { display:block; width:100%; }
/* The overlay's own scrim, lightened so the page underneath still reads at
   tile size. */
.scrim { position:absolute; inset:0; background:rgba(10,11,14,.30);
         backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); }
img.panel {
  position:absolute; border-radius:14px;
  box-shadow:0 10px 26px rgba(0,0,0,.45);
}
img.mark { position:absolute; z-index:6; border-radius:22%; }
.emoji {
  position:absolute; z-index:7; line-height:1;
  font-family:'Apple Color Emoji';
  filter:drop-shadow(0 8px 14px rgba(15,23,42,.18));
}
"""


def css() -> str:
    bg, fg, sub = THEMES[THEME]
    return (CSS.replace("__BG__", bg).replace("__FG__", fg)
            .replace("__SUB__", sub))


def scene(panel: pathlib.Path, x: int, y: int, w: int, rot: float) -> str:
    """A browser window at `w` px wide, with the panel where the overlay puts it."""
    k = w / PAGE_W
    return (
        f"<div class='scene' style='left:{x}px;top:{y}px;width:{w}px;"
        f"transform:rotate({rot}deg)'>"
        "<div class='chrome'>"
        "<span class='dot' style='background:#ff5f57'></span>"
        "<span class='dot' style='background:#febc2e'></span>"
        "<span class='dot' style='background:#28c840'></span>"
        "<span class='bar'></span></div>"
        "<div class='viewport'>"
        f"<img class='page' src='{uri(PAGE)}'>"
        "<div class='scrim'></div>"
        f"<img class='panel' src='{uri(panel)}' style='top:{14 * k:.1f}px;"
        f"right:{14 * k:.1f}px;width:{PANEL_W * k * PANEL_GAIN:.1f}px'>"
        "</div></div>"
    )


def build(s: dict, w: int, h: int) -> str:
    p = [
        "<!doctype html><meta charset='utf-8'>",
        f"<style>{css()}\nhtml,body{{width:{w}px;height:{h}px}}</style>",
    ]
    p.append(
        f"<h1 style='left:{s['title_at'][0]}px;top:{s['title_at'][1]}px;"
        f"font-size:{s.get('title_size', 52)}px;"
        f"max-width:{s.get('title_w', 620)}px'>{s['title']}</h1>"
    )
    if s.get("sub"):
        p.append(
            f"<div class='sub' style='left:{s['sub_at'][0]}px;top:{s['sub_at'][1]}px;"
            f"max-width:{s.get('sub_w', 400)}px;"
            f"font-size:{s.get('sub_size', 19)}px'>{s['sub']}</div>"
        )
    if s.get("scene"):
        p.append(scene(*s["scene"]))
    for im in s.get("images", []):
        p.append(
            f"<img class='{im.get('cls', 'mark')}' style='left:{im['x']}px;"
            f"top:{im['y']}px;width:{im['w']}px' src='{im['src']}'>"
        )
    for e in s.get("emoji", []):
        p.append(
            f"<div class='emoji' style='left:{e[1]}px;top:{e[2]}px;"
            f"font-size:{e[3]}px;transform:rotate({e[4]}deg)'>{e[0]}</div>"
        )
    return "".join(p)


PV, PS, PP, PD = (
    SHOTS / "popup-video.png",
    SHOTS / "popup-shot.png",
    SHOTS / "popup-paused.png",
    SHOTS / "popup-done.png",
)


def screenshots() -> list:
    return [
        {
            "title": "Record Your Screen<br>in One Click",
            "sub": "A tab, a window, or your whole screen, with camera and mic, "
            "without leaving the page.",
            "title_at": (72, 206),
            "sub_at": (74, 348),
            "scene": (PV, 560, 150, 660, -3),
            "emoji": [("🎬", 76, 468, 56, -10)],
        },
        {
            "title": "Your Link Is Ready<br>When You Stop",
            "sub": "It uploads while you record, so the share URL is on your "
            "clipboard when you hit stop.",
            "title_at": (72, 194),
            "sub_at": (74, 352),
            "scene": (PD, 560, 150, 660, -3),
            "emoji": [("🔗", 76, 468, 56, -10)],
        },
        {
            "title": "Pause and Resume<br>Mid-Recording",
            "sub": "Controls stay on the page, and the result is still one "
            "continuous video.",
            "title_at": (72, 194),
            "sub_at": (74, 352),
            "scene": (PP, 560, 150, 660, -3),
            "emoji": [("⏸", 76, 468, 56, -10)],
        },
        {
            "title": "Screenshots Share<br>the Same Way",
            "sub": "Grab the current tab in one click and send a hosted link "
            "instead of an attachment.",
            "title_at": (72, 206),
            "sub_at": (74, 348),
            "scene": (PS, 560, 150, 660, -3),
            "emoji": [("📸", 76, 468, 56, -10)],
        },
        {
            "title": "Open Source.<br>Host It Yourself",
            "sub": "AGPL-3.0, and every feature ships in that build. Run the "
            "whole stack on your own Cloudflare account.",
            "title_at": (72, 206),
            "sub_at": (74, 348),
            "sub_w": 410,
            "scene": (PV, 560, 150, 660, -3),
            "images": [{"src": uri(ICON), "x": 76, "y": 462, "w": 72}],
        },
    ]


def small_tile() -> dict:
    return {
        "title": "CaptureFlow",
        "title_size": 40,
        "title_at": (132, 98),
        "title_w": 300,
        "sub": "Record your screen. Send a link.",
        "sub_size": 15,
        "sub_at": (132, 152),
        "sub_w": 290,
        "images": [{"src": uri(ICON), "x": 44, "y": 98, "w": 72}],
        "emoji": [("🎬", 366, 202, 32, -12)],
    }


def marquee() -> dict:
    return {
        "title": "Record Your Screen.<br>Send a Link.",
        "title_size": 56,
        "title_at": (84, 156),
        "title_w": 600,
        "sub": "Open-source screen recorder and screenshot tool for Chrome. "
        "No exporting, no attachments.",
        "sub_size": 21,
        "sub_at": (86, 348),
        "sub_w": 470,
        "scene": (PV, 748, 34, 620, -3),
        "emoji": [("⚡️", 620, 402, 46, 10)],
    }


def render(b: Browser, spec: dict, w: int, h: int, out: pathlib.Path) -> None:
    f = HERE / ".v4.html"
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
    b = Browser(port=9703, width=1280, height=800, scale=2)
    try:
        for i, s in enumerate(screenshots(), 1):
            render(b, s, 1280, 800, OUT / f"screenshot-{i}.png")
        render(b, small_tile(), 440, 280, OUT / "promo-small-440x280.png")
        render(b, marquee(), 1400, 560, OUT / "promo-marquee-1400x560.png")
    finally:
        b.close()


if __name__ == "__main__":
    main()
