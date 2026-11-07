export type SlideLayout =
  | "cover"
  | "list"
  | "statement"
  | "feature"
  | "image"
  | "code"
  | "big_idea"
  | "end_card";
export type SlideTheme = "white" | "gray" | "ink" | "blue" | "navy" | "cream";

export type Callout = { x: number; y: number; w: number; h: number };

export type Slide = {
  layout?: SlideLayout;
  theme?: SlideTheme;
  section?: string;
  page?: number;
  total?: number;
  tag?: string;
  title: string;
  subtitle?: string;
  items?: { text: string; tag?: string }[];
  facts?: { title: string; text?: string }[];
  from?: string;
  to?: string;
  imageUrl?: string;
  caption?: string;
  callout?: Callout;
  code?: string;
  language?: string;
  lines?: string;
  highlight?: string;
  logo?: boolean;
  cta?: string;
};

// How a slide arrives over the one before it.
export type Entrance = "rise" | "push" | "whip" | "cross";

const MAX_ITEMS = 6;
const MAX_FACTS = 3;
const MAX_CODE_LINES = 18;
const MAX_CODE_COLS = 90;
const LINE_STAGGER_S = 0.06;

const ENTRANCE: Record<SlideLayout, Entrance> = {
  cover: "rise",
  list: "push",
  statement: "push",
  feature: "push",
  image: "whip",
  code: "whip",
  big_idea: "push",
  end_card: "cross",
};

const COLORS = {
  white: {
    bg: "#ffffff",
    fg: "#09090b",
    muted: "#71717b",
    accent: "#155dfc",
    tile: "#f4f4f5",
    card: "#ffffff",
    cardFg: "#09090b",
    rule: "#e4e4e7",
  },
  gray: {
    bg: "#f4f4f5",
    fg: "#09090b",
    muted: "#71717b",
    accent: "#155dfc",
    tile: "#ffffff",
    card: "#ffffff",
    cardFg: "#09090b",
    rule: "#e4e4e7",
  },
  ink: {
    bg: "#09090b",
    fg: "#ffffff",
    muted: "#a1a1aa",
    accent: "#5b8cff",
    tile: "#27272a",
    card: "#ffffff",
    cardFg: "#09090b",
    rule: "#3f3f46",
  },
  blue: {
    bg: "#155dfc",
    fg: "#ffffff",
    muted: "#dbe6ff",
    accent: "#ffffff",
    tile: "#0f4ad0",
    card: "#ffffff",
    cardFg: "#09090b",
    rule: "rgba(255,255,255,.45)",
  },
};
// The tool's older theme names still work.
const THEME_ALIAS: Record<string, keyof typeof COLORS> = {
  navy: "ink",
  cream: "gray",
};
const DEFAULT_THEME: Record<SlideLayout, keyof typeof COLORS> = {
  cover: "gray",
  list: "gray",
  statement: "white",
  feature: "white",
  image: "gray",
  code: "ink",
  big_idea: "gray",
  end_card: "white",
};

// Three takes on the same line, so a deck doesn't repeat one stroke.
const STROKES = [
  "M6 24C150 36 330 40 520 36S860 22 994 8",
  "M6 12C170 34 380 38 590 34S880 26 994 14",
  "M6 30C210 14 420 10 640 16S900 30 994 22",
];
// Drawn once around the highlight's padded box, so the ring clears the letters and the words beside it.
const LOOP =
  "M340 7C620 1 996 8 996 50C996 92 640 99 330 97C60 95 4 74 4 50C4 24 110 8 380 6";

const LOGO =
  "data:image/png;base64,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";

const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const clip = (text: string | undefined, max: number) =>
  text ? escape(text.trim().slice(0, max)) : "";
const fit = (text: string, sizes: [number, number][]) =>
  (sizes.find(([upTo]) => text.length <= upTo) ?? sizes[sizes.length - 1]!)[1];
const pad2 = (n: number) => String(n).padStart(2, "0");
const isImage = (url?: string) => !!url && /^https?:\/\//.test(url);
const delay = (s: number) => `animation-delay:${s}s`;
const pct = (n: number) => Math.min(100, Math.max(0, Number(n) || 0));

// "3-5, 8" to the line numbers it names.
export function highlightedLines(spec: string | undefined): Set<number> {
  const lines = new Set<number>();
  for (const part of (spec ?? "").split(",")) {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(part);
    if (!m) continue;
    const from = Number(m[1]);
    const to = Number(m[2] ?? m[1]);
    for (let n = from; n <= Math.min(to, from + MAX_CODE_LINES); n++) {
      lines.add(n);
    }
  }
  return lines;
}

function underline(seed: string, wait: number) {
  const d =
    STROKES[
      [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % STROKES.length
    ];
  return `<svg class="line wipe" style="${delay(wait)}" viewBox="0 0 1000 44" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
}

// The title, with the highlight circled if it was given and found.
function titleHtml(slide: Slide) {
  const title = clip(slide.title, 140);
  const hit = clip(slide.highlight, 140);
  if (!hit || !title.includes(hit)) return title;
  const loop = `<svg class="loop wipe" style="${delay(0.35)}" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path d="${LOOP}"/></svg>`;
  // Punctuation right after the ring stays on its line.
  const at = title.indexOf(hit);
  const tail = title.slice(at + hit.length).match(/^[,.;:!?]+/)?.[0] ?? "";
  return (
    title.slice(0, at) +
    `<span class="nb"><span class="hit">${hit}${loop}</span>${tail}</span>` +
    title.slice(at + hit.length + tail.length)
  );
}

const lockup = (size: number, stamp = false) =>
  `<div class="lockup ${stamp ? "stamp" : "in"}" style="--mark:${size}px"><img src="${LOGO}" alt=""><span>CaptureFlow</span></div>`;

// A figure that opens with a number counts up to it: "40%" lands on 40.
function counted(html: string) {
  const m = /^(\d{2,6})(.*)$/s.exec(html);
  return m ? `<span class="cnt" style="--to:${m[1]}"></span>${m[2]}` : html;
}

function heading(
  slide: Slide,
  sizes: [number, number][],
  stroke: boolean,
  wait = 0,
) {
  const size = fit(clip(slide.title, 140), sizes);
  const line =
    stroke && !slide.highlight ? underline(slide.title, wait + 0.3) : "";
  const html = titleHtml(slide);
  const cls = html.includes('class="hit"') ? "h has-hit" : "h";
  return `<h1 class="${cls}" style="font-size:${size}px;${delay(wait)}"><span class="ul">${html}${line}</span></h1>`;
}

function body(slide: Slide) {
  const subtitle = slide.subtitle
    ? `<p class="support in" style="${delay(0.14)}">${clip(slide.subtitle, 240)}</p>`
    : "";
  const chip = slide.tag
    ? `<div class="chip in"><span>${clip(slide.tag, 24)}</span></div>`
    : "";
  switch (slide.layout ?? "feature") {
    case "cover":
      return `<div class="center">
        ${slide.logo ? lockup(96) : ""}${chip}
        ${heading(
          slide,
          [
            [14, 208],
            [30, 148],
            [60, 116],
            [140, 88],
          ],
          true,
          0.04,
        )}
        ${subtitle}
      </div>`;
    case "list": {
      const items = (slide.items ?? []).slice(0, MAX_ITEMS);
      const longest = Math.max(
        0,
        ...items.map((i) => i.text.length + (i.tag ? 16 : 0)),
      );
      const n = items.length;
      const wide = longest > 40;
      const font = longest > 62 ? 36 : n >= 6 ? 40 : n === 5 ? 44 : 50;
      const pad = n >= 6 ? 13 : n === 5 ? 16 : n === 4 ? 22 : 28;
      return `<div class="center tight">
        ${heading(
          slide,
          [
            [30, 84],
            [60, 68],
            [140, 52],
          ],
          false,
        )}
        <div class="card rows in" style="${delay(0.1)};width:${wide ? 1640 : 1240}px;--row:${font}px;--pad:${pad}px">
          <i class="lead" style="${delay(0.25)}"></i>
          ${items
            .map(
              (
                item,
                i,
              ) => `<div class="row in" style="${delay(0.16 + i * 0.06)}">
              <span class="num">${i + 1}</span>
              <span class="txt">${clip(item.text, 80)}</span>
              ${item.tag ? `<span class="rtag">${counted(clip(item.tag, 24))}</span>` : ""}
            </div>`,
            )
            .join("")}
        </div>
      </div>`;
    }
    case "statement":
      return `<div class="center">
        ${chip}
        ${heading(
          slide,
          [
            [50, 124],
            [90, 100],
            [140, 80],
          ],
          true,
        )}
        ${subtitle}
      </div>`;
    case "big_idea": {
      const caption =
        slide.from && slide.to
          ? `<div class="flow in" style="${delay(0.2)}"><span>${clip(slide.from, 40)}</span><i class="lead-in" style="${delay(0.3)}"></i><span>${clip(slide.to, 40)}</span></div>`
          : subtitle;
      const discs = Array.from(
        { length: 10 },
        (_, i) =>
          `<div class="disc pop" style="left:${i % 2 ? 1747 : 1549}px;top:${124 + Math.floor(i / 2) * 198}px;${delay(0.1 + i * 0.05)}"><b></b></div>`,
      ).join("");
      return `${discs}<div class="center left-area">
        ${heading(
          slide,
          [
            [8, 240],
            [14, 176],
            [24, 124],
            [60, 92],
            [140, 68],
          ],
          !(slide.from && slide.to),
          0.04,
        )}
        ${caption}
      </div>`;
    }
    case "end_card":
      return `<div class="center">
        ${slide.logo ? lockup(150, true) : ""}
        ${
          slide.logo
            ? `<p class="endline in" style="${delay(0.12)}">${clip(slide.title, 140)}</p>`
            : heading(
                slide,
                [
                  [30, 148],
                  [60, 112],
                  [140, 84],
                ],
                false,
              )
        }
        ${slide.cta ? `<div class="cta in" style="${delay(0.24)}">${clip(slide.cta, 60)}</div>` : ""}
      </div>`;
    case "image": {
      const text = `${chip}${heading(
        slide,
        [
          [40, 72],
          [80, 56],
          [140, 44],
        ],
        false,
        0.05,
      )}${subtitle}`;
      const caption = slide.caption
        ? `<figcaption class="caption in" style="${delay(0.5)}">${clip(slide.caption, 160)}</figcaption>`
        : "";
      if (!isImage(slide.imageUrl)) return `<div class="center">${text}</div>`;
      const c = slide.callout;
      const ring = c
        ? `<div class="ring pop" style="left:${pct(c.x)}%;top:${pct(c.y)}%;width:${pct(c.w)}%;height:${pct(c.h)}%;${delay(1.1)}"></div>`
        : "";
      // The slow push-in heads for the callout, or the middle when there is none.
      const origin = c
        ? `${pct(c.x + c.w / 2)}% ${pct(c.y + c.h / 2)}%`
        : "50% 50%";
      return `<div class="stage"><div class="text">${text}</div>
        <figure class="frame in" style="${delay(0.16)}"><div class="pic" style="transform-origin:${origin}"><img src="${escape(slide.imageUrl as string)}" alt=""
          onerror="this.closest('figure').remove()">${ring}</div>${caption}</figure></div>`;
    }
    case "code": {
      const hit = highlightedLines(slide.lines);
      const rows = (slide.code ?? "")
        .replace(/\t/g, "  ")
        .split("\n")
        .slice(0, MAX_CODE_LINES)
        .map(
          (line, i, all) =>
            `<div class="ln${hit.has(i + 1) ? " hl" : ""}" style="${delay(0.25 + i * LINE_STAGGER_S)};--band:${(0.45 + all.length * LINE_STAGGER_S).toFixed(2)}s"><span class="no">${i + 1}</span><span>${escape(line.slice(0, MAX_CODE_COLS)) || " "}</span></div>`,
        )
        .join("");
      const lang = slide.language
        ? `<span class="lang">${clip(slide.language, 24)}</span>`
        : "";
      return `<div class="stage"><div class="text">${chip}${heading(
        slide,
        [
          [40, 72],
          [80, 56],
          [140, 44],
        ],
        false,
        0.05,
      )}${subtitle}</div>
        <pre class="code in" style="${delay(0.16)}">${lang}${rows}</pre></div>`;
    }
    case "feature": {
      const facts = (slide.facts ?? []).slice(0, MAX_FACTS);
      const text = `${chip}${heading(
        slide,
        [
          [30, 96],
          [60, 80],
          [140, 60],
        ],
        false,
        0.05,
      )}${subtitle}`;
      if (isImage(slide.imageUrl)) {
        return `<div class="split"><div class="text">${text}</div>
          <figure class="shot in" style="${delay(0.16)}"><div class="dots"><i></i><i></i><i></i></div><img src="${escape(slide.imageUrl as string)}" alt=""
            onerror="this.closest('figure').remove();document.querySelector('.split').classList.add('no-image')"></figure></div>`;
      }
      return `<div class="center tight">${text}${
        facts.length
          ? `<div class="tiles" style="grid-template-columns:repeat(${facts.length},1fr)">${facts
              .map(
                (
                  f,
                  i,
                ) => `<div class="tile in" style="${delay(0.2 + i * 0.07)}">
              <div class="tile-title">${counted(clip(f.title, 40))}</div>
              ${f.text ? `<div class="tile-text">${clip(f.text, 90)}</div>` : ""}
            </div>`,
              )
              .join("")}</div>`
          : ""
      }</div>`;
    }
  }
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@property --n{syntax:'<integer>';initial-value:0;inherits:false}
.deck{position:absolute;inset:0;overflow:hidden;background:#f4f4f5}
.s{position:absolute;inset:0;overflow:hidden;background:var(--bg);color:var(--fg);font-family:'Hanken Grotesk',system-ui,"Noto Sans",sans-serif;padding:130px 140px 90px;display:flex;flex-direction:column}
.in{animation:s-in .55s cubic-bezier(.22,1,.36,1) both}
.wipe{animation:s-wipe .6s cubic-bezier(.3,.6,.2,1) both}
.pop{animation:s-pop .45s cubic-bezier(.22,1,.36,1) both}
.lead,.lead-in{animation:s-lead .6s cubic-bezier(.3,.6,.2,1) both}
.kw{display:inline-block;animation:s-word .6s cubic-bezier(.22,1,.36,1) both}
@keyframes s-in{from{opacity:0;transform:translateY(36px);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes s-word{from{opacity:0;transform:translateY(.45em);filter:blur(8px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes s-wipe{from{clip-path:inset(-40% 100% -40% 0)}to{clip-path:inset(-40% -5% -40% -5%)}}
@keyframes s-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@keyframes s-lead{from{transform:scaleX(0)}to{transform:none}}
.s.in-push{animation:s-push .4s cubic-bezier(.16,1,.3,1) both}
.s.in-whip{animation:s-whip-in .32s cubic-bezier(.22,1,.36,1) both}
.s.out-whip{animation:s-whip-out .16s cubic-bezier(.4,0,1,1) both}
.s.out-cross{animation:s-cross-out .5s cubic-bezier(.4,0,.2,1) both}
.flash{position:absolute;inset:0;background:#fff;pointer-events:none;animation:s-flash .32s ease-out both}
@keyframes s-push{from{transform:scale(1.14);filter:blur(10px) brightness(1.12)}to{transform:none;filter:blur(0) brightness(1)}}
@keyframes s-whip-in{from{transform:scaleX(1.22);filter:blur(16px)}to{transform:none;filter:blur(0)}}
@keyframes s-whip-out{to{transform:scaleX(1.22);filter:blur(16px);opacity:0}}
@keyframes s-cross-out{to{transform:scale(1.04);filter:blur(14px);opacity:0}}
@keyframes s-flash{from{opacity:.5}to{opacity:0}}
.prog{position:absolute;left:0;right:0;bottom:0;height:8px;background:var(--accent);transform-origin:0 50%;z-index:3}
.cnt{counter-reset:n var(--n)}
.cnt::before{content:counter(n)}
.lockup.stamp img{animation:s-stamp .45s cubic-bezier(.16,1,.3,1) both}
.lockup.stamp span{animation:s-wipe-x .5s cubic-bezier(.65,0,.35,1) both;animation-delay:.3s}
@keyframes s-stamp{from{opacity:0;transform:scale(3.2) rotate(-18deg)}to{opacity:1;transform:none}}
@keyframes s-wipe-x{from{clip-path:inset(-10% 100% -10% 0)}to{clip-path:inset(-10% -2% -10% 0)}}
.bar{position:absolute;top:52px;left:72px;right:72px;display:flex;justify-content:space-between;font-size:30px;font-weight:500;color:var(--muted);z-index:2}
.center{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.tight h1{margin-bottom:0}
h1{font-weight:600;letter-spacing:-.035em;line-height:1.08;overflow-wrap:anywhere;text-wrap:balance;max-width:1640px}
.ul{display:inline-block;position:relative}
.line{position:absolute;left:0;width:100%;bottom:-.3em;height:.2em;min-height:24px;overflow:visible;fill:none}
.line path{stroke:var(--accent);stroke-width:5;stroke-linecap:round;vector-effect:non-scaling-stroke}
h1.has-hit{line-height:1.3}
.nb{white-space:nowrap}
.hit{position:relative;display:inline-block;white-space:nowrap;padding:.26em .45em;margin:-.26em -.1em}
.loop{position:absolute;inset:0;width:100%;height:100%;overflow:visible;fill:none}
.loop path{stroke:var(--accent);stroke-width:5;stroke-linecap:round;vector-effect:non-scaling-stroke}
.support{font-size:44px;line-height:1.35;color:var(--muted);margin-top:52px;max-width:1400px;text-wrap:balance}
.chip{display:flex;margin-bottom:36px}
.chip span{font-size:34px;font-weight:500;color:var(--muted);border:2px solid var(--rule);border-radius:99px;padding:10px 28px;white-space:nowrap}
.lockup{display:flex;align-items:center;gap:calc(var(--mark)*.2);font:500 calc(var(--mark)*.83)/1 'Rubik','Hanken Grotesk',sans-serif;letter-spacing:-.02em;margin-bottom:44px;color:var(--fg)}
.lockup img{width:var(--mark);height:var(--mark);display:block}
.endline{font-size:56px;font-weight:600;letter-spacing:-.03em;line-height:1.15;max-width:1400px;text-wrap:balance}
.cta{margin-top:56px;font-size:44px;font-weight:600;background:var(--fg);color:var(--bg);border-radius:99px;padding:22px 44px}
.card{position:relative;background:var(--card);color:var(--card-fg);border-radius:32px;box-shadow:0 30px 80px rgba(9,9,11,.1),0 4px 14px rgba(9,9,11,.05)}
.rows{margin-top:48px;padding:16px 48px;text-align:left}
.lead{position:absolute;right:100%;top:50%;width:1000px;height:3px;background:#155dfc;transform-origin:right center}
.row{display:flex;align-items:center;gap:30px;padding:var(--pad) 0;font-size:var(--row);font-weight:500;line-height:1.16;letter-spacing:-.015em;border-top:2px solid #f4f4f5}
.row:first-of-type{border-top:0}
.num{flex:none;width:calc(var(--row)*1.15);height:calc(var(--row)*1.15);border-radius:50%;background:#155dfc;color:#fff;display:flex;align-items:center;justify-content:center;font-size:max(28px,calc(var(--row)*.62));font-weight:600;letter-spacing:0}
.txt{flex:1;min-width:0}
.rtag{flex:none;font-size:30px;font-weight:500;color:#71717b;border:2px solid #e4e4e7;border-radius:99px;padding:6px 20px;white-space:nowrap;font-family:'JetBrains Mono',ui-monospace,monospace;letter-spacing:-.02em}
.tiles{display:grid;gap:28px;width:100%;margin-top:60px;text-align:left}
.tile{background:var(--tile);border-radius:24px;padding:32px 36px}
.tile-title{font-size:42px;font-weight:600;letter-spacing:-.02em;line-height:1.15}
.tile-text{font-size:32px;line-height:1.3;margin-top:10px;color:var(--muted)}
.split{flex:1;min-height:0;display:flex;align-items:center;gap:80px}
.split .text{flex:0 0 620px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left}
.split .support{font-size:38px;margin-top:32px}
.split.no-image .text{flex:1;align-items:center;text-align:center}
.shot{flex:1;min-width:0;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(9,9,11,.14),0 4px 14px rgba(9,9,11,.05)}
.dots{display:flex;gap:10px;padding:18px 22px;background:#f4f4f5}
.dots i{width:14px;height:14px;border-radius:50%;background:#d4d4d8}
.shot img{display:block;width:100%;max-height:700px;object-fit:cover;object-position:top}
.disc{position:absolute;width:140px;height:140px;border-radius:50%;background:#fff;box-shadow:0 14px 34px rgba(9,9,11,.1);display:flex;align-items:center;justify-content:center}
.disc b{width:38px;height:38px;border-radius:50%;background:#f0552a}
.left-area{margin-right:300px}
.flow{display:flex;align-items:center;gap:30px;margin-top:56px;font-size:44px;font-weight:500;color:var(--muted);width:100%;max-width:1160px}
.flow span{flex:none;max-width:45%;text-wrap:balance}
.lead-in{flex:1;min-width:60px;height:3px;background:var(--accent);transform-origin:left center}
.stage{flex:1;min-height:0;display:flex;flex-direction:column;gap:36px}
.stage .text{display:flex;flex-direction:column;align-items:flex-start;text-align:left}
.stage .support{font-size:36px;margin-top:20px}
.stage .chip{margin-bottom:20px}
.frame{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;gap:22px}
.pic{position:relative;max-height:100%;max-width:100%;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(9,9,11,.14),0 4px 14px rgba(9,9,11,.05);animation:s-zoom 1.5s cubic-bezier(.16,1,.3,1) both;animation-delay:.45s}
.pic img{display:block;max-width:1640px;max-height:720px;width:auto;height:auto}
@keyframes s-zoom{from{transform:scale(1)}to{transform:scale(1.07)}}
.ring{position:absolute;border:5px solid var(--accent);border-radius:14px;box-shadow:0 0 0 6px rgba(255,255,255,.6),0 10px 30px rgba(9,9,11,.15)}
.caption{font-size:36px;line-height:1.3;color:var(--muted);text-align:center;text-wrap:balance;max-width:1500px}
.code{position:relative;flex:0 1 auto;min-height:0;overflow:hidden;background:var(--tile);color:var(--fg);border-radius:24px;padding:36px 0;font:500 36px/1.5 'JetBrains Mono',ui-monospace,monospace;letter-spacing:-.01em;white-space:pre}
.lang{position:absolute;top:22px;right:28px;font-size:28px;color:var(--muted);border:2px solid var(--rule);border-radius:99px;padding:4px 20px;font-family:'Hanken Grotesk',sans-serif}
.ln{position:relative;display:flex;gap:36px;padding:0 48px;animation:s-line .22s cubic-bezier(.22,1,.36,1) both}
.ln>span{position:relative}
.ln.hl::before{content:'';position:absolute;inset:0;background:rgba(21,93,252,.18);box-shadow:inset 6px 0 0 var(--accent);transform-origin:0 50%;animation:s-lead .4s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--band)}
@keyframes s-line{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0 -2% 0 0);opacity:1}}
.no{flex:none;width:2ch;text-align:right;color:var(--muted);user-select:none}
`;

/*
 * Runs in the slide page. A slide is a layer added over the one before it,
 * its title split into words that rise one after another, and everything
 * else on it held back until the title has landed. Every animation is then
 * paused at zero so the recorder can step through them a frame at a time.
 */
const ENTER_SCRIPT = `
(() => {
  const S = 'cubic-bezier(.22,1,.36,1)';
  let anims = [];
  const deck = () => document.querySelector('.deck');
  function words(layer) {
    const ul = layer.querySelector('h1 .ul');
    let n = 0;
    if (!ul) return 0;
    const walker = document.createTreeWalker(ul, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const t of nodes) {
      if (!t.nodeValue.trim()) continue;
      const frag = document.createDocumentFragment();
      for (const p of t.nodeValue.split(/(\\s+)/)) {
        if (!p) continue;
        if (/^\\s+$/.test(p)) { frag.append(p); continue; }
        const b = document.createElement('b');
        b.className = 'kw';
        b.style.animationDelay = (0.05 + n * 0.07).toFixed(2) + 's';
        b.textContent = p;
        frag.append(b);
        n++;
      }
      t.replaceWith(frag);
    }
    return n;
  }
  // After a cut from the page the deck starts empty, so no earlier slide shows through.
  window.__cfEnter = (html, kind, fresh) => {
    const d = deck();
    const old = fresh ? null : d.querySelector('.s');
    for (const el of d.querySelectorAll('.s, .flash')) if (el !== old) el.remove();
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const layer = tpl.content.firstElementChild;
    const lead = words(layer) * 0.07 + 0.1;
    for (const el of layer.querySelectorAll('.in,.pop,.wipe,.lead,.lead-in,.ln,.pic,.stamp')) {
      el.style.animationDelay = ((parseFloat(el.style.animationDelay) || 0) + lead).toFixed(2) + 's';
    }
    for (const el of layer.querySelectorAll('.ln.hl')) {
      el.style.setProperty('--band', (parseFloat(el.style.getPropertyValue('--band')) + lead).toFixed(2) + 's');
    }
    if (kind === 'push' || kind === 'rise' || !old) d.append(layer); else d.prepend(layer);
    layer.classList.add('in-' + kind);
    let flash = null;
    if (old) {
      old.classList.add('out-' + kind);
      if (kind === 'whip') { flash = document.createElement('div'); flash.className = 'flash'; d.append(flash); }
    }
    for (const el of layer.querySelectorAll('.cnt')) {
      el.animate([{ '--n': 0 }, { '--n': Number(el.style.getPropertyValue('--to')) || 0 }],
        { duration: 1000, delay: (lead + 0.3) * 1000, easing: S, fill: 'both' });
    }
    const prog = layer.querySelector('.prog');
    if (prog) prog.animate([{ transform: 'scaleX(' + prog.dataset.from + ')' }, { transform: 'scaleX(' + prog.dataset.to + ')' }],
      { duration: 600, delay: 150, easing: S, fill: 'both' });
    anims = [
      ...layer.getAnimations({ subtree: true }),
      ...(flash ? flash.getAnimations() : []),
      ...(old ? old.getAnimations().filter((a) => /-out$/.test(a.animationName || '')) : []),
    ];
    let settle = 0;
    for (const a of anims) {
      a.pause();
      a.currentTime = 0;
      const end = a.effect.getComputedTiming().endTime;
      if (Number.isFinite(end)) settle = Math.max(settle, end);
    }
    return Math.min(settle, 2800);
  };
  window.__cfSeek = (ms) => { for (const a of anims) a.currentTime = ms; };
  window.__cfSettle = () => {
    for (const a of anims) a.finish();
    for (const el of deck().querySelectorAll('.out-push,.out-whip,.out-cross,.flash')) el.remove();
  };
  window.__cfImagesReady = () => Promise.all(
    [...document.images].map((img) => (img.complete ? null : img.decode().catch(() => {}))),
  );
  // Fonts only load once text uses them, so every face a slide can use is asked for up front.
  window.__cfFontsReady = () => Promise.all(
    ["400", "500", "600", "700"].map((w) => document.fonts.load(w + " 16px 'Hanken Grotesk'"))
      .concat([document.fonts.load("500 16px Rubik"), document.fonts.load("500 16px 'JetBrains Mono'")])
      .map((p) => p.catch(() => {})),
  );
})();
`;

const HEAD = `<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Rubik:wght@500&family=JetBrains+Mono:wght@500&display=swap">
<style>html,body{width:100%;height:100%;overflow:hidden;background:#f4f4f5}${CSS}</style>`;

// The page the recorder keeps for its slides: styles and fonts once, then one layer per slide.
export function slideShell(): string {
  return `<!doctype html>
<html><head>${HEAD}<script>${ENTER_SCRIPT}</script></head>
<body><div class="deck"></div></body></html>`;
}

export function slideLayer(slide: Slide): { html: string; entrance: Entrance } {
  const layout = slide.layout ?? "feature";
  const name = slide.theme ?? DEFAULT_THEME[layout] ?? "white";
  const c =
    COLORS[(THEME_ALIAS[name] ?? name) as keyof typeof COLORS] ?? COLORS.white;
  const page =
    slide.page && slide.total
      ? `${pad2(slide.page)} / ${pad2(slide.total)}`
      : slide.page
        ? pad2(slide.page)
        : "";
  const bar =
    slide.section || page
      ? `<div class="bar"><span>${clip(slide.section, 40)}</span><span>${page}</span></div>`
      : "";
  const prog =
    slide.page && slide.total
      ? `<i class="prog" data-from="${((slide.page - 1) / slide.total).toFixed(3)}" data-to="${(slide.page / slide.total).toFixed(3)}"></i>`
      : "";
  const vars = `--bg:${c.bg};--fg:${c.fg};--muted:${c.muted};--accent:${c.accent};--tile:${c.tile};--card:${c.card};--card-fg:${c.cardFg};--rule:${c.rule}`;
  return {
    html: `<div class="s" style="${vars}">${bar}${prog}${body(slide)}</div>`,
    entrance: ENTRANCE[layout],
  };
}

/*
 * A full-screen slide for the recorder's 1920x1080 viewport, in the look of
 * the launch film: light grounds, white cards, numbered blue dots and the
 * hand-drawn blue line. No text is under 28px, so it stays readable when the
 * video plays at half size. The logo and name only appear when asked for,
 * since most demos are of someone else's product.
 */
export function renderSlide(slide: Slide): string {
  return slideShell().replace(
    '<div class="deck"></div>',
    `<div class="deck">${slideLayer(slide).html}</div>`,
  );
}
