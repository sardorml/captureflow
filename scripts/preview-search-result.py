#!/usr/bin/env python3
"""Preview how a URL will appear as a Google search result.

Fetches the page, lists every favicon it declares, ranks them the way Google's
favicon crawler does, and renders a result row with the winner — alongside the
icon Google actually has cached today, so a pending change is visible.

    python3 scripts/preview-search-result.py https://captureflow.dev

Requires: Pillow. The ranking mirrors Google's documented preferences; Google
does not publish the exact algorithm, so treat the pick as informed, not certain.
"""
import argparse
import base64
import html
import io
import re
import ssl
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

UA = "Mozilla/5.0 (compatible; favicon-preview/1.0)"

# python.org builds ship no system CA bundle, so HTTPS fails without this.
try:
    import certifi

    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CTX = ssl.create_default_context()

# Google reads these rels off the home page, then falls back to /favicon.ico.
ICON_RELS = (
    "icon",
    "shortcut icon",
    "apple-touch-icon",
    "apple-touch-icon-precomposed",
    "fluid-icon",
)


def get(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
        return r.read()


def declared_icons(page: str, base: str):
    out = []
    for tag in re.findall(r"<link\b[^>]*>", page, re.I):
        rel = re.search(r'\brel=["\']([^"\']+)["\']', tag, re.I)
        href = re.search(r'\bhref=["\']([^"\']+)["\']', tag, re.I)
        if not rel or not href:
            continue
        rel_v = " ".join(rel.group(1).lower().split())
        if rel_v not in ICON_RELS:
            continue
        sizes = re.search(r'\bsizes=["\']([^"\']+)["\']', tag, re.I)
        out.append({
            "rel": rel_v,
            "url": urllib.parse.urljoin(base, html.unescape(href.group(1))),
            "sizes": sizes.group(1) if sizes else "",
        })
    return out


def measure(icon: dict) -> dict:
    """Fetch the icon and record real dimensions; SVG is treated as vector."""
    icon = dict(icon)
    try:
        raw = get(icon["url"])
    except Exception as e:  # unreachable icons are still worth showing
        return {**icon, "ok": False, "note": str(e), "px": 0, "fmt": "?"}
    if icon["url"].lower().endswith(".svg") or raw[:200].lstrip().startswith(b"<svg"):
        return {**icon, "ok": True, "raw": raw, "px": 0, "fmt": "svg",
                "note": "vector"}
    try:
        im = Image.open(io.BytesIO(raw))
        return {**icon, "ok": True, "raw": raw, "px": max(im.size),
                "fmt": (im.format or "?").lower(),
                "note": f"{im.size[0]}x{im.size[1]}"}
    except Exception as e:
        return {**icon, "ok": False, "note": str(e), "px": 0, "fmt": "?"}


def rank(icons):
    """Biggest reachable raster wins, then a real declaration over the fallback.

    Calibrated against what Google actually serves for captureflow.dev: it picked
    the 180px apple-touch-icon over both the 48px .ico and the SVG. So raw size
    outranks Google's documented "multiple of 48px" advice, and raster outranks
    vector — ranking by that advice instead predicted the .ico, which is wrong.
    """
    def key(i):
        return (
            i.get("ok", False),
            i["fmt"] != "svg",
            i["px"],
            i["rel"] != "fallback",
        )
    return sorted(icons, key=key, reverse=True)


def data_uri(raw: bytes, fmt: str) -> str:
    mime = "image/svg+xml" if fmt == "svg" else f"image/{'png' if fmt=='?' else fmt}"
    return f"data:{mime};base64," + base64.b64encode(raw).decode()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--as", dest="as_domain", metavar="DOMAIN",
                    help="domain to pull Google's cached favicon for; use when "
                         "URL is a dev server (e.g. --as captureflow.dev)")
    args = ap.parse_args()
    base = args.url if "://" in args.url else "https://" + args.url

    print(f"fetching {base} …")
    page = get(base).decode("utf-8", "replace")
    origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(base))

    title = (re.search(r"<title[^>]*>(.*?)</title>", page, re.I | re.S) or [None, ""])[1]
    desc = re.search(
        r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)', page, re.I
    )

    icons = declared_icons(page, base)
    icons.append({"rel": "fallback", "url": f"{origin}/favicon.ico", "sizes": ""})
    measured = [measure(i) for i in icons]
    ordered = rank(measured)
    winner = next((i for i in ordered if i.get("ok")), None)

    # What Google is serving for this domain right now.
    host = urllib.parse.urlsplit(base).netloc
    try:
        cached = get("https://www.google.com/s2/favicons"
                     f"?domain={args.as_domain or host}&sz=64")
        cached_uri = data_uri(cached, "png")
    except Exception:
        cached_uri = ""

    # Is the winner already what Google serves? Compare perceptually, not by
    # bytes: Google re-encodes its cached copy, so the files never match.
    pending = None
    if winner and cached_uri:
        try:
            a = Image.open(io.BytesIO(winner["raw"])).convert("RGB").resize((32, 32))
            b = Image.open(io.BytesIO(cached)).convert("RGB").resize((32, 32))
            diff = sum(
                abs(p - q) for pa, qa in zip(a.getdata(), b.getdata()) for p, q in zip(pa, qa)
            ) / (32 * 32 * 3)
            pending = diff > 12
        except Exception:
            pass

    print(f"\n  {'rel':<28} {'format':<6} {'size':<12} pick")
    for i in ordered:
        mark = "  <-- Google should pick this" if i is winner else ""
        print(f"  {i['rel']:<28} {i['fmt']:<6} {i['note']:<12}{mark}")

    rows = "".join(
        f"<tr><td><code>{html.escape(i['rel'])}</code></td>"
        f"<td class='u'>{html.escape(i['url'].replace(origin, ''))}</td>"
        f"<td>{i['fmt']}</td><td>{html.escape(i['note'])}</td>"
        f"<td>{'✓' if i is winner else ''}</td></tr>"
        for i in ordered
    )

    def serp(icon_uri, label, sub):
        img = (f"<img src='{icon_uri}' width='20' height='20' alt=''>"
               if icon_uri else "<span class='none'>none</span>")
        return f"""
      <div class="block">
        <div class="lbl">{label}<span>{sub}</span></div>
        <div class="serp">
          <div class="fw">{img}</div>
          <div>
            <div class="site">{html.escape(host)}</div>
            <div class="url">{html.escape(origin)}</div>
          </div>
        </div>
        <div class="t">{html.escape(title.strip())}</div>
        <div class="d">{html.escape(desc.group(1) if desc else '')}</div>
      </div>"""

    if pending is None:
        banner = ""
    elif pending:
        banner = ('<p class="note change">These differ &mdash; a change is pending. '
                  'Google will show the lower icon after it next crawls the favicon '
                  '(days to weeks).</p>')
    else:
        banner = ('<p class="note same">These match &mdash; nothing is pending. '
                  'This URL already serves the icon Google has. To preview an '
                  'undeployed change, point the tool at your dev server '
                  '(e.g. http://localhost:3032).</p>')

    out = f"""<!doctype html>
<meta charset="utf-8"><title>Search preview — {html.escape(host)}</title>
<style>
 body {{ font:14px/1.6 arial,sans-serif; margin:0; padding:34px; color:#202124; }}
 h1 {{ font:600 18px -apple-system,system-ui,sans-serif; margin:0 0 18px; }}
 .block {{ max-width:640px; margin-bottom:30px; }}
 .lbl {{ font:600 11px -apple-system,system-ui,sans-serif; letter-spacing:.06em;
         text-transform:uppercase; color:#80868b; margin-bottom:10px; }}
 .lbl span {{ display:block; font-weight:400; text-transform:none; letter-spacing:0;
              font-size:12px; color:#9aa0a6; }}
 .serp {{ display:flex; align-items:center; gap:12px; }}
 .fw {{ width:28px; height:28px; border:1px solid #ecedef; border-radius:50%;
        display:flex; align-items:center; justify-content:center; flex:none; }}
 .site {{ font-size:14px; }} .url {{ font-size:12px; color:#4d5156; }}
 .t {{ color:#1a0dab; font-size:20px; line-height:1.3; margin:6px 0 3px; }}
 .d {{ color:#4d5156; font-size:14px; }}
 .none {{ font-size:9px; color:#c5221f; }}
 .note {{ max-width:640px; padding:11px 14px; border-radius:8px; font-size:13px;
          font-family:-apple-system,system-ui,sans-serif; margin:0 0 30px; }}
 .change {{ background:#e6f4ea; color:#137333; }}
 .same {{ background:#fef7e0; color:#8a6d1f; }}
 table {{ border-collapse:collapse; margin-top:10px; font:12px -apple-system,system-ui,sans-serif; }}
 th,td {{ text-align:left; padding:7px 14px 7px 0; border-bottom:1px solid #f1f3f4; }}
 th {{ color:#80868b; font-weight:600; }}
 .u {{ color:#4d5156; }} code {{ background:#f1f3f4; padding:1px 5px; border-radius:4px; }}
</style>
<h1>Search-result preview — {html.escape(host)}</h1>
{serp(cached_uri, "What Google serves today",
      f"live from Google&rsquo;s cache for {html.escape(args.as_domain or host)}")}
{serp(data_uri(winner["raw"], winner["fmt"]) if winner else "",
      f"What {html.escape(host)} serves now",
      "the icon Google would pick from this URL&rsquo;s markup")}
{banner}
<h1>Icons declared on the page</h1>
<table><tr><th>rel</th><th>path</th><th>format</th><th>size</th><th>pick</th></tr>
{rows}</table>
"""
    path = Path(tempfile.gettempdir()) / f"search-preview-{host}.html"
    path.write_text(out)
    print(f"\nwrote {path}")
    subprocess.run(["open", str(path)], check=False)


if __name__ == "__main__":
    sys.exit(main())
