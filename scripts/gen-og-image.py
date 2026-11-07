#!/usr/bin/env python3
"""Generate the link preview card (`apps/web/public/og-image.png`).

A split card: the hero title in white on a dark panel with the logo and the
address, and on a light blue panel a recording library being recorded over,
with the presenter's camera bubble and the recorder's controls. It is laid out
in HTML on a running copy of the site, so it uses the site's own fonts, logo and
presenter photo, and is captured at 1200x630 (drawn at 2x).

    pnpm --filter @captureflow/web dev     # or any running copy of the site
    python3 scripts/gen-og-image.py [site-url]

The site defaults to http://localhost:3032. Bump `?v=` on the image in
apps/web/app/layout.tsx and apps/web/lib/i18n/metadata.ts afterwards so link
previews fetch the new card.

Requires: Google Chrome, websocket-client, Pillow.
"""
import json
import sys
import time
from pathlib import Path

from PIL import Image

from cdp import Browser

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "apps/web/public/og-image.png"
W, H = 1200, 630
TITLE = "Screen recorder for you and your AI agents"
ADDRESS = "CAPTUREFLOW.DEV"
ROWS = [
    ("Product demo", "2:14"),
    ("Checkout bug, steps to reproduce", "0:58"),
    ("Onboarding walkthrough", "4:31"),
    ("Weekly update", "1:47"),
    ("Agent run: rebuild pricing page", "0:42"),
]

CARD = """
(({ title, address, rows }) => {
  const row = ([name, length], i) => `
    <div style="position:absolute;left:44px;right:0;top:${54 + i * 108}px;height:1px;background:#c9d8f5"></div>
    <div style="position:absolute;left:44px;right:0;top:${66 + i * 108}px;height:60px;display:flex;align-items:center;gap:14px;
      background:#d6e3fb;border-left:5px solid #2f6fed;border-radius:6px 0 0 6px;padding-left:16px">
      <span style="font-size:19px;font-weight:600;color:#1f4fbf;letter-spacing:-0.01em">${name}</span>
      <span style="font-size:15px;color:#5b7bc4;font-variant-numeric:tabular-nums">${length}</span>
    </div>`;
  document.documentElement.style.cssText = "background:#fff;overflow:hidden";
  document.body.style.cssText = "margin:0;overflow:hidden";
  document.body.innerHTML = `
  <div style="position:relative;width:1200px;height:630px;display:flex;overflow:hidden">
    <div style="width:590px;height:630px;background:#111214;color:#fff;position:relative;box-sizing:border-box;padding:56px 56px">
      <img src="/logo.png" style="width:64px;height:64px;border-radius:15px;display:block">
      <div style="position:absolute;left:56px;right:40px;top:50%;transform:translateY(-50%);font-size:64px;line-height:1.04;font-weight:600;letter-spacing:-0.045em;text-wrap:balance">${title}</div>
      <div style="position:absolute;left:56px;bottom:52px;font-size:20px;letter-spacing:0.14em;font-weight:500;color:#e8e8ec">${address}</div>
    </div>
    <div style="flex:1;height:630px;background:#edf3fe;position:relative;overflow:hidden">
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
      </div>
    </div>
  </div>`;
  return Promise.all([...document.images].map((img) => img.decode().catch(() => null))).then(() => "ok");
})
"""


def main() -> None:
    site = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3032").rstrip("/")
    browser = Browser(port=9446, width=W, height=H, scale=2)
    try:
        browser.goto(f"{site}/", settle=5)
        args = json.dumps({"title": TITLE, "address": ADDRESS, "rows": ROWS})
        evaluated = browser.cmd("Runtime.evaluate", {
            "expression": f"{CARD}({args})", "returnByValue": True, "awaitPromise": True})
        result = evaluated.get("result", {}).get("value") or evaluated.get("exceptionDetails")
        if result != "ok":
            raise SystemExit(f"Couldn't lay out the card: {result}")
        time.sleep(1)
        raw = OUT.with_suffix(".raw.png")
        browser.shot(str(raw), clip={"x": 0, "y": 0, "width": W, "height": H}, scale=2)
    finally:
        browser.close()
    Image.open(raw).convert("RGB").resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    raw.unlink()
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
