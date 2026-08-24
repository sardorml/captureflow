"""Render the page that sits behind the panel in the store tiles.

A neutral, unbranded web app rather than our own landing: the tile is about the
recorder, and a light page underneath also gives the dark panel something to
sit against. Nothing here imitates a real product; the labels are placeholders.
"""

import pathlib

from cdp import Browser

W, H = 1360, 900
OUT = pathlib.Path("shots/page-mock.png")

ROWS = [
    ("Onboarding flow", "Mar 4", "Live", "#16a34a"),
    ("Checkout redesign", "Mar 2", "In review", "#d97706"),
    ("Search ranking", "Feb 27", "Live", "#16a34a"),
    ("Billing migration", "Feb 24", "Paused", "#64748b"),
    ("Mobile nav", "Feb 20", "Live", "#16a34a"),
]
BARS = [38, 62, 45, 78, 55, 88, 70, 96, 64, 82, 58, 91]
STATS = [("Sessions", "18,204", "+12.4%"), ("Active", "3,918", "+4.1%"),
         ("Avg. time", "6m 12s", "+0.8%")]

HTML = f"""<!doctype html><meta charset='utf-8'><style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{W}px; height:{H}px; background:#f5f6f8; display:flex;
  font-family:-apple-system,'SF Pro Text',system-ui,sans-serif; color:#0f172a; }}
aside {{ width:224px; background:#fff; border-right:1px solid #e6e8ec; padding:18px 14px; }}
.brand {{ display:flex; align-items:center; gap:9px; padding:0 8px 18px; }}
.brand i {{ width:22px; height:22px; border-radius:7px; background:#2563eb; display:block; }}
.brand b {{ font-size:14px; letter-spacing:-.01em; }}
nav a {{ display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
  font-size:13px; color:#475569; margin-bottom:2px; }}
nav a.on {{ background:#eef4ff; color:#1d4ed8; font-weight:600; }}
nav a i {{ width:14px; height:14px; border-radius:4px; background:#cbd5e1; }}
nav a.on i {{ background:#3b82f6; }}
main {{ flex:1; display:flex; flex-direction:column; }}
header {{ height:58px; border-bottom:1px solid #e6e8ec; background:#fff;
  display:flex; align-items:center; padding:0 24px; gap:14px; }}
.search {{ flex:1; max-width:400px; height:32px; border-radius:8px; background:#f1f3f6;
  border:1px solid #e6e8ec; }}
.av {{ width:30px; height:30px; border-radius:50%; background:#dbe3ee; margin-left:auto; }}
.body {{ padding:24px; overflow:hidden; }}
h1 {{ font-size:25px; letter-spacing:-.02em; }}
.mut {{ color:#64748b; font-size:13px; margin-top:5px; }}
.cards {{ display:flex; gap:14px; margin-top:20px; }}
.card {{ flex:1; background:#fff; border:1px solid #e6e8ec; border-radius:12px; padding:15px 16px; }}
.card small {{ color:#64748b; font-size:12px; }}
.card b {{ display:block; font-size:26px; letter-spacing:-.02em; margin-top:7px; }}
.card em {{ font-style:normal; color:#16a34a; font-size:12px; font-weight:600; }}
.chart {{ background:#fff; border:1px solid #e6e8ec; border-radius:12px; padding:16px;
  margin-top:14px; }}
.bars {{ display:flex; align-items:flex-end; gap:10px; height:120px; margin-top:12px; }}
.bars span {{ flex:1; border-radius:4px 4px 0 0; background:#c7d8f7; }}
.bars span:nth-child(8) {{ background:#2563eb; }}
table {{ width:100%; background:#fff; border:1px solid #e6e8ec; border-radius:12px;
  border-collapse:separate; border-spacing:0; margin-top:14px; font-size:13px; }}
th {{ text-align:left; color:#64748b; font-weight:600; font-size:12px;
  padding:10px 16px; border-bottom:1px solid #eef0f3; }}
td {{ padding:11px 16px; border-bottom:1px solid #f2f4f7; }}
tr:last-child td {{ border-bottom:0; }}
.pill {{ font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px;
  background:#f1f5f9; }}
</style>
<aside>
  <div class='brand'><i></i><b>Workspace</b></div>
  <nav>
    <a class='on'><i></i>Overview</a><a><i></i>Projects</a><a><i></i>Reports</a>
    <a><i></i>Members</a><a><i></i>Settings</a>
  </nav>
</aside>
<main>
  <header><div class='search'></div><div class='av'></div></header>
  <div class='body'>
    <h1>Overview</h1>
    <div class='mut'>Last 30 days across all projects</div>
    <div class='cards'>
      {"".join(f"<div class='card'><small>{a}</small><b>{b}</b><em>{c}</em></div>"
               for a, b, c in STATS)}
    </div>
    <div class='chart'><small style='color:#64748b;font-size:12px'>Weekly sessions</small>
      <div class='bars'>{"".join(f"<span style='height:{v}%'></span>" for v in BARS)}</div>
    </div>
    <table><tr><th>Project</th><th>Updated</th><th>Status</th></tr>
      {"".join(f"<tr><td>{n}</td><td style='color:#64748b'>{d}</td>"
               f"<td><span class='pill' style='color:{c}'>{s}</span></td></tr>"
               for n, d, s, c in ROWS)}
    </table>
  </div>
</main>"""

f = pathlib.Path(".mock.html")
f.write_text(HTML)
b = Browser(port=9614, width=W, height=H, scale=2)
try:
    b.goto(f"file://{f.resolve()}", settle=1.4)
    b.shot(OUT, clip={"x": 0, "y": 0, "width": W, "height": H}, scale=2)
    print("wrote", OUT, W, "x", H)
finally:
    b.close()
    f.unlink()
