#!/usr/bin/env python3
"""Capture the signed-in dashboard that sits under the panel in the README hero.

A real screenshot of the running app, not a mock — the README is about us, so an
approximation of our own UI would only drift. The account it photographs is
made here and deleted again at the end, so the shot does not depend on whatever
happens to be in your dev database and does not leave anything in it either.

Needs the web dev server up with the poster base pointed at the seeded files,
because the cards read their thumbnails from the CDN origin:

    cd apps/web && NEXT_PUBLIC_R2_PUBLIC_BASE_URL=http://localhost:3032/demo-posters \\
      npx next dev -p 3032

Then `cd scripts && python3 cap-readme-dashboard.py`, and regenerate the banner
with gen-readme-hero.py.
"""

import json
import pathlib
import subprocess
import urllib.error
import urllib.request

from PIL import Image

from cdp import Browser

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent
WRANGLER = REPO / "apps/web/wrangler.jsonc"
POSTERS = REPO / "apps/web/public/demo-posters/posters"
SHOTS = HERE / "shots"
BASE = "http://localhost:3032"

W, H = 1360, 900
EMAIL = "readme-demo@captureflow.dev"
PASSWORD = "CaptureFlowReadmeDemo2026!"
NAME = "Alex Rivera"

# Fixed rather than derived from the clock so re-running produces the same
# picture. The last two are the crop this row's poster takes of the page mock.
STAMP = 1787900000000
ROWS = [
    ("cfDemo01", "Checkout bug repro — Safari 18", 74_000, 128, 0.00, 1.00),
    ("cfDemo02", "Sprint 24 demo walkthrough", 213_000, 86, 0.18, 0.78),
    ("cfDemo03", "Setting up API keys, start to finish", 154_000, 61, 0.36, 0.62),
    ("cfDemo04", "Onboarding flow — first pass feedback", 98_000, 44, 0.10, 0.55),
    ("cfDemo05", "Why the deploy step keeps flaking", 187_000, 37, 0.42, 0.85),
    ("cfDemo06", "Weekly update for the design review", 126_000, 23, 0.26, 0.70),
]


def d1(sql: str) -> list:
    r = subprocess.run(
        ["npx", "wrangler", "d1", "execute", "captureflow", "--local", "--json",
         "--config", str(WRANGLER), "--command", sql],
        capture_output=True, text=True, check=True)
    return json.loads(r.stdout)[0]["results"]


def post(path: str, body: dict) -> tuple[dict, str | None]:
    req = urllib.request.Request(
        f"{BASE}{path}", method="POST", data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as res:
        cookie = res.headers.get("set-cookie")
        token = cookie.split(";")[0].split("=", 1)[1] if cookie else None
        return json.loads(res.read()), token


def sign_up() -> tuple[str, str]:
    try:
        body, token = post("/api/auth/sign-up/email",
                           {"email": EMAIL, "password": PASSWORD, "name": NAME})
        return body["user"]["id"], token
    except urllib.error.HTTPError:
        # Left over from a run that died before its teardown.
        body, token = post("/api/auth/sign-in/email",
                           {"email": EMAIL, "password": PASSWORD})
        return body["user"]["id"], token


def posters() -> None:
    POSTERS.mkdir(parents=True, exist_ok=True)
    src = Image.open(SHOTS / "page-mock.png").convert("RGB")
    sw, sh = src.size
    for slug, _, _, _, ox, zoom in ROWS:
        cw = int(sw * zoom)
        ch = int(cw * 9 / 16)
        x = int((sw - cw) * ox)
        src.crop((x, int(sh * 0.12), x + cw, int(sh * 0.12) + ch)).resize(
            (640, 360), Image.LANCZOS).save(POSTERS / f"{slug}.jpg", quality=88)


def seed(user: str, workspace: str) -> None:
    values = ",".join(
        f"('{slug}','cfx-readme-demo','videos/{slug}.mp4','posters/{slug}.jpg',"
        f"{180000 + i * 40000},{dur},'instant','recording',"
        f"{STAMP - i * 7_400_000},{STAMP - i * 3_000_000},'ready',{views},"
        f"'{title.replace(chr(39), chr(39) * 2)}','{user}','public','{workspace}')"
        for i, (slug, title, dur, views, _, _) in enumerate(ROWS))
    d1("INSERT OR REPLACE INTO recordings (slug, device_id, storage_key, "
       "poster_key, size_bytes, duration_ms, source, preset, created_at, "
       "last_viewed_at, state, view_count, title, user_id, visibility, "
       f"workspace_id) VALUES {values}")


def capture(token: str) -> None:
    out = SHOTS / "page-dashboard.png"
    b = Browser(port=9709, width=W, height=H, scale=1)
    try:
        b.cmd("Network.enable")
        # Light, for the same reason the store tiles use a light page: the panel
        # that lands on top of this is dark and needs something to sit against.
        for name, value in (("better-auth.session_token", token),
                            ("captureflow_theme", "light")):
            b.cmd("Network.setCookie", {"name": name, "value": value,
                                        "domain": "localhost", "path": "/"})
        b.cmd("Emulation.setDeviceMetricsOverride",
              {"width": W, "height": H, "deviceScaleFactor": 2, "mobile": False})
        b.goto(f"{BASE}/recordings", settle=10)
        if b.js("location.pathname") != "/recordings":
            raise SystemExit("not signed in — the capture would be the login page")
        loaded = b.js("[...document.images].filter(i => i.naturalWidth > 0).length")
        if loaded < len(ROWS):
            raise SystemExit(
                f"only {loaded}/{len(ROWS)} thumbnails loaded — is the dev server "
                "running with NEXT_PUBLIC_R2_PUBLIC_BASE_URL set? See the docstring.")
        b.shot(out, clip={"x": 0, "y": 0, "width": W, "height": H}, scale=1)
        print(f"  {out}  {W * 2}x{H * 2}")
    finally:
        b.close()


def teardown(user: str) -> None:
    slugs = ",".join(f"'{r[0]}'" for r in ROWS)
    d1(f"DELETE FROM recordings WHERE slug IN ({slugs})")
    # users cascades to sessions, accounts, and the workspace it owns.
    d1(f"DELETE FROM users WHERE id = '{user}'")
    for p in POSTERS.glob("*.jpg"):
        p.unlink()
    POSTERS.rmdir()
    POSTERS.parent.rmdir()


def main() -> None:
    user, token = sign_up()
    workspace = d1(
        f"SELECT id FROM workspace WHERE owner_user_id = '{user}'")[0]["id"]
    try:
        posters()
        seed(user, workspace)
        capture(token)
    finally:
        teardown(user)


if __name__ == "__main__":
    main()
