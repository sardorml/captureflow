#!/usr/bin/env python3
"""Generate the link preview cards in `apps/web/public/`.

Each card is split: a title in white on a dark panel with the logo and an
address, and a scene on a light blue panel. `og-image.png` is the site-wide card
(a recording library being recorded over, with the presenter's camera bubble and
the recorder's controls); `og-swarm-demo.png` is the swarm demo page's (a page
half rebuilt by agent cursors). They are laid out in HTML on a running copy of
the site, so they use its fonts, logo and presenter photo, and are captured at
1200x630 (drawn at 2x).

    pnpm --filter @captureflow/web dev     # or any running copy of the site
    python3 scripts/gen-og-image.py [site-url]

The site defaults to http://localhost:3032. Bump `?v=` on a changed card: the
site-wide one in apps/web/app/layout.tsx and apps/web/lib/i18n/metadata.ts,
a page's own in PAGE_IMAGES in apps/web/lib/i18n/metadata.ts.

Requires: Google Chrome, websocket-client, Pillow.
"""
import json
import sys
import time
from pathlib import Path

from PIL import Image

from cdp import Browser

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "apps/web/public"
W, H = 1200, 630

CARDS = [
    {
        "file": "og-image.png",
        "title": "Screen recorder for you and your AI agents",
        "address": "CAPTUREFLOW.DEV",
        "scene": "library",
        "rows": [
            ["Product demo", "2:14"],
            ["Checkout bug, steps to reproduce", "0:58"],
            ["Onboarding walkthrough", "4:31"],
            ["Weekly update", "1:47"],
            ["Agent run: rebuild pricing page", "0:42"],
        ],
    },
    {
        "file": "og-swarm-demo.png",
        "title": "Watch agents rebuild any website",
        "address": "CAPTUREFLOW.DEV/SWARM-DEMO",
        "scene": "swarm",
    },
]

CARD = r"""
((card) => {
  const SWARM = ["#2f7df6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#eab308", "#14b8a6"];
  const cursor = (x, y, color, scale = 1.7) => `
    <svg style="position:absolute;left:${x}px;top:${y}px;overflow:visible" width="1" height="1">
      <path transform="scale(${scale})" d="M0 0v17l4.5-4 3 6.5 3-1.5-3-6.5H13z" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
  const box = (x, y, w, h, style) =>
    `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}"></div>`;
  const slot = (x, y, w, h) => box(x, y, w, h, "border:2px dashed #c7d3ea;border-radius:8px;box-sizing:border-box");
  const working = (x, y, w, h, color, tag) => `
    ${box(x - 6, y - 6, w + 12, h + 12, `border:2px solid ${color};border-radius:8px;box-sizing:border-box`)}
    <div style="position:absolute;left:${x - 6}px;top:${y - 28}px;height:20px;padding:0 7px;border-radius:5px;background:${color};
      color:#fff;font:600 12px/20px ui-monospace,Menlo,monospace">${tag}</div>`;

  const library = (rows) => {
    const row = ([name, length], i) => `
      <div style="position:absolute;left:44px;right:0;top:${54 + i * 108}px;height:1px;background:#c9d8f5"></div>
      <div style="position:absolute;left:44px;right:0;top:${66 + i * 108}px;height:60px;display:flex;align-items:center;gap:14px;
        background:#d6e3fb;border-left:5px solid #2f6fed;border-radius:6px 0 0 6px;padding-left:16px">
        <span style="font-size:19px;font-weight:600;color:#1f4fbf;letter-spacing:-0.01em">${name}</span>
        <span style="font-size:15px;color:#5b7bc4;font-variant-numeric:tabular-nums">${length}</span>
      </div>`;
    return `
      ${rows.map(row).join("")}
      <div style="position:absolute;left:150px;top:150px;width:250px;height:250px;border-radius:50%;overflow:hidden;
        box-shadow:0 18px 40px rgba(20,40,90,.22);border:4px solid #fff">
        <img src="/presenter-design.webp" style="width:100%;height:100%;object-fit:cover;display:block">
      </div>
      <div style="position:absolute;left:112px;top:420px;height:66px;display:flex;align-items:center;gap:22px;padding:0 26px;
        background:#fff;border-radius:999px;box-shadow:0 14px 34px rgba(20,40,90,.20)">
        <span style="width:24px;height:24px;border-radius:6px;background:#f0532f"></span>
        <span style="font-size:23px;font-weight:600;color:#111;font-variant-numeric:tabular-nums;letter-spacing:0.04em">0:42</span>
        <span style="width:1px;height:34px;background:#d9d9de"></span>
        <svg width="24" height="24" viewBox="0 0 24 24"><rect x="5" y="4" width="4.5" height="16" rx="1.6" fill="#111"/><rect x="14.5" y="4" width="4.5" height="16" rx="1.6" fill="#111"/></svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
      </div>`;
  };

  // A browser window with a page part built: done blocks are solid, ones being built are outlined, the rest wait as slots.
  const swarm = () => {
    const page = `
      ${box(28, 26, 34, 34, "border-radius:9px;background:#2f7df6")}
      ${box(76, 38, 64, 10, "border-radius:5px;background:#d5dbe6")}
      ${box(152, 38, 64, 10, "border-radius:5px;background:#d5dbe6")}
      ${slot(228, 32, 64, 22)}
      ${box(470, 26, 96, 34, "border-radius:17px;background:#111")}

      <div style="position:absolute;left:28px;top:108px;font-size:40px;line-height:1.05;font-weight:700;letter-spacing:-0.04em;color:#111">
        Launch your<br>next big<span style="display:inline-block;width:3px;height:36px;margin-left:3px;vertical-align:-4px;background:#a855f7"></span>
      </div>
      ${working(28, 108, 250, 84, "#a855f7", "h1")}
      ${box(28, 222, 236, 9, "border-radius:5px;background:#d5dbe6")}
      ${box(28, 240, 200, 9, "border-radius:5px;background:#d5dbe6")}
      ${slot(28, 258, 170, 12)}
      ${box(28, 292, 120, 40, "border-radius:10px;background:#2f7df6")}
      ${working(160, 292, 110, 40, "#22c55e", "button")}
      ${box(160, 292, 110, 40, "border-radius:10px;border:2px solid #111;box-sizing:border-box")}

      <div style="position:absolute;left:318px;top:96px;width:250px;height:240px;border-radius:14px;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,#7aa7ff,#b48cff 55%,#ff9bc8)"></div>
        <div style="position:absolute;left:0;right:0;top:132px;bottom:0;background:#fff"></div>
        ${slot(0, 132, 250, 108)}
      </div>
      ${working(318, 96, 250, 240, "#f97316", "img")}

      ${box(28, 370, 170, 120, "border-radius:12px;background:#f1f4fa")}
      ${box(44, 388, 40, 40, "border-radius:10px;background:#22c55e")}
      ${box(44, 444, 120, 9, "border-radius:5px;background:#d5dbe6")}
      ${box(214, 370, 170, 120, "border-radius:12px;background:#f1f4fa")}
      ${working(214, 370, 170, 120, "#2f7df6", "div")}
      ${slot(400, 370, 170, 120)}`;
    return `
      <div style="position:absolute;left:44px;top:58px;width:620px;height:540px;background:#fff;border-radius:16px;
        box-shadow:0 22px 50px rgba(20,40,90,.18);overflow:hidden">
        <div style="height:44px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid #e6eaf2">
          <span style="width:11px;height:11px;border-radius:50%;background:#ff6159"></span>
          <span style="width:11px;height:11px;border-radius:50%;background:#ffbd2e"></span>
          <span style="width:11px;height:11px;border-radius:50%;background:#28c941"></span>
          <span style="margin-left:14px;height:26px;width:260px;border-radius:13px;background:#f1f4fa;font-size:13px;line-height:26px;padding-left:14px;color:#6b7280">yoursite.com</span>
        </div>
        <div style="position:relative">${page}</div>
      </div>
      ${cursor(330, 236, SWARM[3])}
      ${cursor(300, 398, SWARM[1])}
      ${cursor(560, 300, SWARM[2])}
      ${cursor(470, 484, SWARM[0])}
      ${cursor(560, 470, SWARM[4])}
      ${cursor(340, 110, SWARM[5])}
      ${cursor(140, 470, SWARM[6])}`;
  };

  document.documentElement.style.cssText = "background:#fff;overflow:hidden";
  document.body.style.cssText = "margin:0;overflow:hidden";
  document.body.innerHTML = `
  <div style="position:relative;width:1200px;height:630px;display:flex;overflow:hidden">
    <div style="width:590px;height:630px;background:#111214;color:#fff;position:relative;box-sizing:border-box;padding:56px 56px">
      <img src="/logo.png" style="width:64px;height:64px;border-radius:15px;display:block">
      <div style="position:absolute;left:56px;right:40px;top:50%;transform:translateY(-50%);font-size:64px;line-height:1.04;font-weight:600;letter-spacing:-0.045em;text-wrap:balance">${card.title}</div>
      <div style="position:absolute;left:56px;bottom:52px;font-size:20px;letter-spacing:0.14em;font-weight:500;color:#e8e8ec">${card.address}</div>
    </div>
    <div style="flex:1;height:630px;background:#edf3fe;position:relative;overflow:hidden">
      ${card.scene === "swarm" ? swarm() : library(card.rows)}
    </div>
  </div>`;
  return Promise.all([...document.images].map((img) => img.decode().catch(() => null))).then(() => "ok");
})
"""


def render(browser: Browser, site: str, card: dict) -> None:
    browser.goto(f"{site}/", settle=4)
    evaluated = browser.cmd("Runtime.evaluate", {
        "expression": f"{CARD}({json.dumps(card)})", "returnByValue": True, "awaitPromise": True})
    result = evaluated.get("result", {}).get("value") or evaluated.get("exceptionDetails")
    if result != "ok":
        raise SystemExit(f"Couldn't lay out {card['file']}: {result}")
    time.sleep(1)
    out = PUBLIC / card["file"]
    raw = out.with_suffix(".raw.png")
    browser.shot(str(raw), clip={"x": 0, "y": 0, "width": W, "height": H}, scale=2)
    Image.open(raw).convert("RGB").resize((W, H), Image.LANCZOS).save(out, optimize=True)
    raw.unlink()
    print(f"wrote {out.relative_to(ROOT)}")


def main() -> None:
    site = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3032").rstrip("/")
    browser = Browser(port=9446, width=W, height=H, scale=2)
    try:
        for card in CARDS:
            render(browser, site, card)
    finally:
        browser.close()


if __name__ == "__main__":
    main()
