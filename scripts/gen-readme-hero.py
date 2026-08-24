#!/usr/bin/env python3
"""The README hero: the store tiles' cluster, wide and with no headline on it.

Same blue, same flat window-and-panel grouping, same emoji props as the Chrome
Web Store screenshots — but 2:1 instead of 1.6:1, because a README hero sits in
a ~1000px column, and with the copy stripped out because the name and the
tagline are already text directly above it.

The geometry is screenshot-1's, scaled by SCALE and re-centred, so the two stay
recognisably the same picture. Written at 1.5x the layout: GitHub serves the
README to retina displays at roughly twice the CSS width it lays out at.
"""

import importlib.util
import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT = pathlib.Path("/Users/ethos/code/personal/captureflow/.github/assets/readme-hero.png")

# Imported rather than copied so the blue, the CSS, and the window/panel markup
# have one definition. The hyphen in the filename is what rules out `import`.
_spec = importlib.util.spec_from_file_location(
    "store_assets", HERE / "gen-store-assets.py"
)
store = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(store)

W, H = 1440, 720
EXPORT = (2160, 1080)

# screenshot-1 draws the window at 640 wide; everything else here is that
# tile's offset from the window's own origin, times this.
SCALE = 750 / 640
WIN_W = 750
# Centred on what the eye sees rather than on the boxes: the panel's shadow
# falls ~68px past its bottom edge and the tilted clapper pokes above the
# window, so measuring the drawn pixels is the only way to get even margins.
WIN_AT = (351, 71)


def at(dx: float, dy: float) -> tuple[int, int]:
    return round(WIN_AT[0] + dx * SCALE), round(WIN_AT[1] + dy * SCALE)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    panel = at(626 - 214, 322 - 226)
    clapper = at(852 - 214, 232 - 226)
    camera = at(126 - 214, 516 - 226)
    spec = {
        # build() always emits the heading element; empty is how it draws
        # nothing, and then nothing needs a position either.
        "title": "",
        "title_at": 0,
        "layers": [
            store.window(*WIN_AT, WIN_W),
            store.card(store.PV, *panel, round(296 * SCALE)),
        ],
        "emoji": [
            ("🎬", *clapper, round(78 * SCALE), -14, 4),
            ("📹", *camera, round(70 * SCALE), -8),
        ],
    }

    f = HERE / ".readme-hero.html"
    f.write_text(store.build(spec, W, H))
    b = store.Browser(port=9706, width=W, height=H, scale=2)
    try:
        b.cmd(
            "Emulation.setDeviceMetricsOverride",
            {"width": W, "height": H, "deviceScaleFactor": 2, "mobile": False},
        )
        b.goto(f"file://{f}", settle=1.8)
        raw = OUT.with_suffix(".raw.png")
        b.shot(raw, clip={"x": 0, "y": 0, "width": W, "height": H}, scale=2)
        Image.open(raw).resize(EXPORT, Image.LANCZOS).convert("RGB").save(OUT)
        raw.unlink()
    finally:
        b.close()
        f.unlink()
    print(f"  {OUT}  {EXPORT[0]}x{EXPORT[1]}")


if __name__ == "__main__":
    main()
