export type SlideLayout =
  | "cover"
  | "list"
  | "statement"
  | "feature"
  | "big_idea";
export type SlideTheme = "navy" | "blue" | "cream";

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
};

const MAX_ITEMS = 6;
const MAX_FACTS = 3;

const COLORS = {
  navy: {
    bg: "#141c5c",
    fg: "#f6f1e9",
    accent: "#fae3ca",
    rule: "rgba(246,241,233,.25)",
  },
  blue: {
    bg: "#3a4fd0",
    fg: "#f6f1e9",
    accent: "#fae3ca",
    rule: "rgba(246,241,233,.3)",
  },
  cream: {
    bg: "#f6f1e9",
    fg: "#141c5c",
    accent: "#3a4fd0",
    rule: "rgba(20,28,92,.18)",
  },
} as const;

// Each layout's colour when the agent doesn't pick one.
const DEFAULT_THEME: Record<SlideLayout, SlideTheme> = {
  cover: "navy",
  list: "cream",
  statement: "blue",
  feature: "cream",
  big_idea: "navy",
};

const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const clip = (text: string | undefined, max: number) =>
  text ? escape(text.trim().slice(0, max)) : "";

// Long headlines step down a size so they still fit the slide.
const fit = (text: string, sizes: [number, number][]) =>
  (sizes.find(([upTo]) => text.length <= upTo) ?? sizes[sizes.length - 1]!)[1];

const pad2 = (n: number) => String(n).padStart(2, "0");

const isImage = (url: string | undefined): url is string =>
  !!url && /^https?:\/\//.test(url);

function pill(text: string, bg: string, fg: string) {
  return `<span class="pill in" style="background:${bg};color:${fg}">${text}</span>`;
}

function body(slide: Slide, c: (typeof COLORS)[SlideTheme]): string {
  const title = clip(slide.title, 140);
  const subtitle = slide.subtitle
    ? `<p class="support in" style="animation-delay:.12s">${clip(slide.subtitle, 240)}</p>`
    : "";
  const tag = slide.tag ? pill(clip(slide.tag, 24), c.accent, c.bg) : "";
  switch (slide.layout ?? "feature") {
    case "cover":
      return `<div class="bottom">
        <h1 class="in" style="font-size:${fit(title, [
          [12, 250],
          [22, 180],
          [40, 132],
        ])}px;line-height:.95;letter-spacing:-.045em">${title}</h1>
        ${slide.subtitle ? `<p class="support in" style="animation-delay:.12s;font-size:48px;font-weight:500">${clip(slide.subtitle, 120)}</p>` : ""}
      </div>`;
    case "list": {
      const items = (slide.items ?? []).slice(0, MAX_ITEMS);
      return `<h1 class="in" style="font-size:${fit(title, [
        [30, 96],
        [60, 80],
      ])}px">${title}</h1>
        <div class="rows">${items
          .map(
            (
              item,
              i,
            ) => `<div class="row in" style="animation-delay:${0.1 + i * 0.07}s;border-color:${c.rule}">
              <span class="num" style="color:${c.accent}">${pad2(i + 1)}</span>
              <span>${clip(item.text, 80)}</span>
              ${item.tag ? pill(clip(item.tag, 24), c.accent, c.bg) : ""}
            </div>`,
          )
          .join("")}</div>`;
    }
    case "statement":
      return `<h1 class="in" style="font-size:${fit(title, [
        [50, 128],
        [90, 104],
        [140, 88],
      ])}px;max-width:1600px">${title}</h1>${subtitle}`;
    case "big_idea": {
      const caption =
        slide.from && slide.to
          ? `<div class="flow in" style="animation-delay:.15s"><span>${clip(slide.from, 40)}</span>
              <span class="arrow" style="background:${c.fg}"><i style="border-color:${c.fg}"></i></span>
              <span>${clip(slide.to, 40)}</span></div>`
          : subtitle;
      return `<div class="bottom">
        <h1 class="in" style="font-size:${fit(title, [
          [14, 280],
          [24, 200],
          [40, 150],
        ])}px;line-height:.92;letter-spacing:-.045em">${title}</h1>
        ${caption}
      </div>`;
    }
    case "feature": {
      const facts = (slide.facts ?? []).slice(0, MAX_FACTS);
      const text = `${tag}
        <h1 class="in" style="font-size:${fit(title, [
          [30, 112],
          [60, 96],
          [140, 80],
        ])}px;max-width:1500px;animation-delay:.05s">${title}</h1>
        ${subtitle}`;
      if (isImage(slide.imageUrl)) {
        return `<div class="split"><div class="text">${text}</div>
          <figure class="image in" style="animation-delay:.2s"><img src="${escape(slide.imageUrl)}" alt=""
            onerror="this.closest('figure').remove();document.body.classList.add('no-image')"></figure></div>`;
      }
      return `${text}${
        facts.length
          ? `<div class="facts" style="grid-template-columns:repeat(${facts.length},1fr)">${facts
              .map(
                (
                  f,
                  i,
                ) => `<div class="fact in" style="animation-delay:${0.2 + i * 0.07}s;border-color:${c.fg}">
                  <div class="fact-title">${clip(f.title, 40)}</div>
                  ${f.text ? `<div class="fact-text">${clip(f.text, 90)}</div>` : ""}
                </div>`,
              )
              .join("")}</div>`
          : ""
      }`;
    }
  }
}

/*
 * A full-screen slide for the recorder's 1920x1080 viewport. Every layout
 * shares one structure: an optional top bar (section left, page right), one
 * headline, and supporting text under it, on the same left edge. No text is
 * under 36px, so it stays readable when the video plays at half size.
 */
export function renderSlide(slide: Slide): string {
  const layout = slide.layout ?? "feature";
  const c = COLORS[slide.theme ?? DEFAULT_THEME[layout]];
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
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=block">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
body{background:${c.bg};color:${c.fg};font-family:Outfit,system-ui,"Noto Sans",sans-serif;
  position:relative;padding:240px 140px 120px;display:flex;flex-direction:column}
.in{opacity:0;transform:translateY(20px);animation:in .6s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes in{to{opacity:1;transform:none}}
.bar{position:absolute;top:80px;left:140px;right:140px;display:flex;justify-content:space-between;font-size:36px;font-weight:500;opacity:.7}
h1{font-weight:600;letter-spacing:-.03em;line-height:1.05;overflow-wrap:anywhere}
.support{font-size:44px;line-height:1.4;opacity:.85;margin-top:40px;max-width:1300px}
.bottom{margin-top:auto}
.pill{align-self:flex-start;font-size:40px;font-weight:600;padding:10px 26px;border-radius:999px;margin-bottom:40px;white-space:nowrap}
.rows{margin-top:64px}
.row{display:flex;align-items:center;gap:48px;padding:26px 0;border-top:2px solid;font-size:60px;font-weight:500}
.row .pill{margin:0;font-size:36px;padding:8px 22px}
.num{width:90px;flex:none}
.facts{margin-top:auto;display:grid;gap:64px}
.fact{border-top:3px solid;padding-top:28px}
.fact-title{font-size:48px;font-weight:600}
.fact-text{font-size:40px;line-height:1.35;margin-top:10px;opacity:.8}
.flow{display:flex;align-items:center;gap:32px;margin-top:64px;font-size:48px}
.arrow{flex:1;height:3px;opacity:.6;position:relative}
.arrow i{position:absolute;right:0;top:-12px;width:26px;height:26px;border-top:3px solid;border-right:3px solid;transform:rotate(45deg)}
.split{display:flex;align-items:center;gap:96px;flex:1}
.split .text{flex:1;min-width:0;display:flex;flex-direction:column}
.no-image .split .text{max-width:1500px}
.image{flex:1;min-width:0;display:flex;justify-content:center}
.image img{max-width:100%;max-height:720px;border-radius:28px;object-fit:contain;box-shadow:0 40px 100px rgba(0,0,0,.25)}
</style></head>
<body>${bar}${body(slide, c)}</body></html>`;
}
