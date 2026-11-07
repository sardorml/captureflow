/*
 * A page rebuilt by a swarm of agents: every card, heading, picture and
 * button is hidden, then coloured cursors drag out, type and trace each one
 * onto a design canvas with rulers and guides until the real page stands
 * complete.
 * The plan is made here; the three page functions run inside the page, so
 * they only use what they are given.
 */

import { mulberry32 } from "./random";
import { tempoWarp, type TempoRamp } from "./tempo";

export type SwarmUnitKind = "text" | "box" | "media" | "frame";

export type SwarmUnit = {
  kind: SwarmUnitKind;
  x: number;
  y: number;
  w: number;
  h: number;
  lines: number;
  chars: number;
};

export type SwarmTask = {
  unit: number;
  agent: number;
  // When the agent sets off for it: it waits at its last job until then, so a long wait is not a slow trip.
  go: number;
  start: number;
  end: number;
};

export type SwarmPrompt = {
  text: string;
  inMs: number;
  at: number[];
  holdMs: number;
  sendMs: number;
  sendAt: number;
  ms: number;
};

export type SwarmPlan = {
  tasks: SwarmTask[];
  agents: number;
  prompt: SwarmPrompt | null;
  tempo: TempoRamp | null;
  introMs: number;
  outroMs: number;
  durationMs: number;
};

export type SwarmOptions = {
  agents: number;
  durationMs: number;
  seed: number;
  prompt?: string;
  tempo?: boolean;
  // Units below this are hidden with the rest but never built; they return with the page at the end.
  maxY?: number;
  // The frame's height: work going on at the same time stays within most of one, so the camera can hold it all.
  screen?: number;
};

// The whole page is hidden and built; the caps only keep a huge page from taking forever to scan.
export const SWARM_LIMITS = {
  agents: { min: 2, max: 48, default: 24 },
  seconds: { min: 6, max: 90 },
  maxUnits: 2000,
  screens: 40,
};

// Long enough to read along: a screen of content takes a few seconds, within 12 and 60.
export function swarmSeconds(unitCount: number, screens: number): number {
  return Math.min(60, Math.max(12, unitCount / 10, screens * 3.2));
}

const INTRO_MS = 700;
const OUTRO_MS = 600;
const RAMP_DONE = 0.9;
const ROW_PX = 48;
// The composer: rises in, the request is typed, a pause, then the pointer clicks send and the agents burst out.
const PROMPT = { inMs: 480, holdMs: 800, sendMs: 1100 };

/*
 * The page draws the composer from the plan alone, so the timing travels
 * with the text. Keystrokes land unevenly, like fingers on a keyboard, and
 * pause after a space or a stop.
 */
function promptPhase(text: string, rng: () => number): SwarmPrompt | null {
  if (!text) return null;
  const { inMs, holdMs, sendMs } = PROMPT;
  const at: number[] = [];
  let t = inMs + 250;
  for (let i = 0; i < text.length; i++) {
    const before = text[i - 1];
    t += 38 + rng() * 60;
    if (before === " ") t += 70;
    if (before === "." || before === ",") t += 140;
    at.push(Math.round(t));
  }
  const sendAt = Math.round(t) + holdMs;
  return { text, inMs, at, holdMs, sendMs, sendAt, ms: sendAt + sendMs };
}

function workMs(u: SwarmUnit): number {
  if (u.kind === "text") return 350 + Math.min(u.chars, 220) * 12;
  if (u.kind === "media") return 500 + Math.min(900, Math.sqrt(u.w * u.h) / 2);
  if (u.kind === "frame") return 450 + Math.min(700, Math.sqrt(u.w * u.h) / 3);
  return 650;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const BAND = 0.5;

/*
 * Units are handed out in reading order to whichever agent frees up first,
 * each trip and job taking the time it would by hand, then the whole thing
 * is stretched or squeezed to fit between the intro and the outro.
 */
export function planSwarm(units: SwarmUnit[], opts: SwarmOptions): SwarmPlan {
  const rng = mulberry32(opts.seed);
  const built = units
    .map((u, i) => (opts.maxY === undefined || u.y <= opts.maxY ? i : -1))
    .filter((i) => i >= 0);
  const agents = Math.max(1, Math.min(opts.agents, built.length));
  const order = [...built].sort(
    (a, b) =>
      Math.round(units[a]!.y / ROW_PX) - Math.round(units[b]!.y / ROW_PX) ||
      units[a]!.x - units[b]!.x,
  );
  const xs = built.map((i) => units[i]!.x);
  const left = Math.min(...xs);
  const right = Math.max(...built.map((i) => units[i]!.x + units[i]!.w));
  const top = Math.min(...built.map((i) => units[i]!.y));
  const workers = Array.from({ length: agents }, (_, k) => ({
    freeAt: k * 90,
    x: left + ((k + 0.5) / agents) * (right - left),
    y: top,
  }));
  const band = opts.screen === undefined ? Infinity : opts.screen * BAND;
  const tasks: SwarmTask[] = [];
  const travels: number[] = [];
  for (const i of order) {
    const u = units[i]!;
    let best = 0;
    for (let k = 1; k < workers.length; k++) {
      if (workers[k]!.freeAt < workers[best]!.freeAt) best = k;
    }
    const w = workers[best]!;
    const travel = clamp(Math.hypot(u.x - w.x, u.y - w.y) * 0.9, 250, 900);
    // Nothing starts further down than a band below work still going on above it.
    let after = 0;
    for (const t of tasks) {
      if (u.y - units[t.unit]!.y > band) after = Math.max(after, t.end);
    }
    const start = Math.max(w.freeAt + travel, after + 120);
    const end = start + workMs(u) * (0.85 + rng() * 0.3);
    tasks.push({ unit: i, agent: best, go: w.freeAt, start, end });
    travels.push(travel);
    w.freeAt = end + 120;
    w.x = u.x + u.w;
    w.y = u.y + u.h;
  }
  const prompt = opts.prompt?.trim() ?? "";
  const asked = promptPhase(prompt, rng);
  const promptMs = asked?.ms ?? 0;
  const introMs = promptMs + INTRO_MS;
  const total = Math.max(1, ...tasks.map((t) => t.end));
  const span = Math.max(1000, opts.durationMs - INTRO_MS - OUTRO_MS);
  const scale = span / total;
  // Jobs stretch to fill the recording; a trip keeps the time it takes by hand, the rest is waited out at the last job.
  tasks.forEach((t, k) => {
    t.go = Math.max(t.go, t.start - travels[k]! / scale);
    t.go = introMs + t.go * scale;
    t.start = introMs + t.start * scale;
    t.end = introMs + t.end * scale;
  });
  // With music the work keeps its beat: slow while the music is slow, four times as fast once it is.
  const tempo: TempoRamp | null = opts.tempo
    ? { rampFromMs: promptMs, rampToMs: introMs + span * RAMP_DONE }
    : null;
  if (tempo) {
    const warp = tempoWarp(introMs, introMs + span, tempo);
    for (const t of tasks) {
      t.go = warp(t.go);
      t.start = warp(t.start);
      t.end = Math.max(t.start + 80, warp(t.end));
    }
  }
  return {
    tasks,
    agents,
    prompt: asked,
    tempo,
    introMs,
    outroMs: OUTRO_MS,
    durationMs: opts.durationMs + promptMs,
  };
}

// Consent banners sit over the page and redraw themselves, often arriving late; the build is of the page.
export const CONSENT_SELECTOR =
  "#onetrust-consent-sdk, #CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay, .cc-window, #cookie-banner, #cookieBanner, [id*='cookie-consent' i], [class*='cookie-banner' i], [class*='cookie-consent' i], [id*='gdpr' i][role='dialog'], [aria-label*='cookie' i][role='dialog']";

// Runs in the page: scrolls through it once so lazy pictures and reveal-on-scroll content exist before the scan.
export async function settlePage(limits: {
  step: number;
  maxY: number;
  hide: string;
}) {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(limits.hide),
  )) {
    el.style.setProperty("display", "none", "important");
  }
  const bottom = Math.min(limits.maxY, document.documentElement.scrollHeight);
  for (let y = 0; y <= bottom; y += limits.step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  await new Promise((r) => setTimeout(r, 250));
}

/*
 * Runs in the page: everything a viewer would see being built, top to
 * bottom. A container with a background or border of its own is a frame,
 * dragged out before the parts inside it; an element with its own words is
 * typed; loose words inside a bigger container are wrapped so they can be
 * hidden and typed too. The elements are kept on the window for the frames
 * to reach.
 */
export function scanSwarmUnits(limits: {
  maxUnits: number;
  maxY: number;
  hide: string;
}): SwarmUnit[] {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(limits.hide),
  )) {
    el.style.setProperty("display", "none", "important");
  }
  const MEDIA = new Set([
    "IMG",
    "SVG",
    "VIDEO",
    "CANVAS",
    "PICTURE",
    "IFRAME",
    "OBJECT",
  ]);
  const BOX = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
  const SKIP = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEMPLATE",
    "BR",
    "WBR",
  ]);
  // Called once per screen, scrolled there: what fades in on arrival is only found then.
  const w = window as unknown as {
    __cfSwarmUnits?: SwarmUnit[];
    __cfSwarmEls?: HTMLElement[];
    __cfSwarmWraps?: HTMLElement[];
  };
  const units: SwarmUnit[] = w.__cfSwarmUnits ?? [];
  const els: HTMLElement[] = w.__cfSwarmEls ?? [];
  const wraps: HTMLElement[] = w.__cfSwarmWraps ?? [];
  const seen = new Set<Element>(els);
  const ownText = (el: Element) => {
    let s = "";
    for (let k = 0; k < el.childNodes.length; k++) {
      const n = el.childNodes[k]!;
      if (n.nodeType === 3) s += n.textContent;
    }
    return s.replace(/\s+/g, " ").trim();
  };
  const add = (
    el: HTMLElement,
    kind: SwarmUnitKind,
    r: DOMRect,
    lh: number,
  ) => {
    if (seen.has(el)) return;
    seen.add(el);
    const all = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    units.push({
      kind,
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      w: r.width,
      h: r.height,
      lines: Math.max(1, Math.round(r.height / lh)),
      chars: kind === "text" ? Math.max(1, all.length) : 1,
    });
    els.push(el);
  };
  const framed = (cs: CSSStyleDeclaration) =>
    !/^rgba\(\d+, \d+, \d+, 0\)$|^transparent$/.test(cs.backgroundColor) ||
    cs.backgroundImage !== "none" ||
    (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") ||
    cs.boxShadow !== "none";
  const walk = (el: Element) => {
    if (units.length >= limits.maxUnits || SKIP.has(el.tagName)) return;
    const r = el.getBoundingClientRect();
    if (r.top + window.scrollY > limits.maxY) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (parseFloat(cs.opacity) <= 0.05) return;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3 || 20;
    const text = ownText(el);
    const hasChildren = el.children.length > 0;
    // A box too small to see can still hold what overflows it: the box is passed over, its children are not.
    if (r.width > 3 && r.height > 3) {
      if (
        MEDIA.has(el.tagName) ||
        (cs.backgroundImage !== "none" && !hasChildren)
      ) {
        return add(el as HTMLElement, "media", r, lh);
      }
      if (BOX.has(el.tagName) && (text || hasChildren)) {
        return add(el as HTMLElement, "box", r, lh);
      }
      if (text && (!hasChildren || r.height < lh * 3.5 || text.length >= 20)) {
        return add(el as HTMLElement, "text", r, lh);
      }
      if (
        hasChildren &&
        el !== document.body &&
        framed(cs) &&
        r.width * r.height > 8000 &&
        r.height < window.innerHeight * 1.5
      ) {
        add(el as HTMLElement, "frame", r, lh);
      }
    }
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 1) walk(n as Element);
      else if (n.nodeType === 3 && (n.textContent ?? "").trim()) {
        const span = document.createElement("span");
        span.setAttribute("data-cf-wrap", "");
        n.parentNode!.insertBefore(span, n);
        span.appendChild(n);
        const sr = span.getBoundingClientRect();
        if (sr.width > 3 && sr.height > 3) {
          add(span, "text", sr, lh);
          wraps.push(span);
        } else {
          span.replaceWith(n);
        }
      }
    }
  };
  if (document.body) walk(document.body);
  w.__cfSwarmUnits = units;
  w.__cfSwarmEls = els;
  w.__cfSwarmWraps = wraps;
  return units;
}

type SwarmState = {
  units: SwarmUnit[];
  els: HTMLElement[];
  plan: SwarmPlan;
  styles: (string | null)[];
  bodyStyle: string | null;
  late: HTMLElement[];
  observer: MutationObserver;
  stage: number[];
  byAgent: SwarmTask[][];
  edges: { x: number; y: number }[];
  colors: string[];
  rails: [number, number];
  dividers: number[];
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  room: HTMLCanvasElement | null;
  cam: number;
  camV: number;
  aim: number;
  view: number;
  lastMs: number;
};

type SwarmWindow = Window & {
  __cfSwarm?: SwarmState;
  __cfSwarmUnits?: SwarmUnit[];
  __cfSwarmEls?: HTMLElement[];
  __cfSwarmWraps?: HTMLElement[];
};

// Runs in the page: hides every unit and lays the canvas over the page.
export function mountSwarm(args: {
  units: SwarmUnit[];
  plan: SwarmPlan;
  hide: string;
}) {
  const w = window as SwarmWindow;
  const els = w.__cfSwarmEls ?? [];
  const PALETTE = [
    "#2f7df6",
    "#22c55e",
    "#f97316",
    "#a855f7",
    "#ec4899",
    "#eab308",
    "#ef4444",
    "#14b8a6",
  ];
  // Hidden three ways: a child that sets itself visible, or an inline box that clipping passes through, still shows nothing.
  const styles = els.map((el) => {
    const s = el.getAttribute("style");
    el.style.visibility = "hidden";
    el.style.clipPath = "inset(100%)";
    el.style.opacity = "0";
    return s;
  });
  /*
   * What the page adds after the scan (lists fetched late, parts a framework
   * redraws) is kept hidden until the build has passed its place, unless it
   * lands inside a unit, whose own state covers it.
   */
  const late: HTMLElement[] = [];
  const unitEls = new Set<Element>(els);
  const insideUnit = (el: Element) => {
    for (let a: Element | null = el; a; a = a.parentElement) {
      if (unitEls.has(a)) return true;
    }
    return false;
  };
  const observer = new MutationObserver((records) => {
    for (const rec of records) {
      for (const node of Array.from(rec.addedNodes)) {
        if (node.nodeType !== 1) continue;
        const el = node as HTMLElement;
        if (el.hasAttribute("data-cf-swarm") || insideUnit(el)) continue;
        if (el.matches(args.hide)) {
          el.style.setProperty("display", "none", "important");
          continue;
        }
        for (const banner of Array.from(
          el.querySelectorAll<HTMLElement>(args.hide),
        )) {
          banner.style.setProperty("display", "none", "important");
        }
        el.style.visibility = "hidden";
        el.style.opacity = "0";
        late.push(el);
      }
    }
  });
  // The page is moved down past the top ruler; a transform takes fixed headers along.
  const bodyStyle = document.body.getAttribute("style");
  document.body.style.transform = "translateY(20px)";
  const byAgent: SwarmTask[][] = Array.from(
    { length: args.plan.agents },
    () => [],
  );
  for (const t of args.plan.tasks) byAgent[t.agent]!.push(t);
  for (const list of byAgent) list.sort((a, b) => a.start - b.start);
  const W = window.innerWidth;
  const H = window.innerHeight;
  const edges = byAgent.map((_, k) => {
    const side = k % 4;
    const along = ((k * 0.618) % 1) * (side % 2 ? H : W);
    return side === 0
      ? { x: along, y: -40 }
      : side === 1
        ? { x: W + 40, y: along }
        : side === 2
          ? { x: along, y: H + 40 }
          : { x: -40, y: along };
  });
  const sortedX = [...args.units.map((u) => u.x)].sort((a, b) => a - b);
  const sortedR = [...args.units.map((u) => u.x + u.w)].sort((a, b) => a - b);
  const at = (arr: number[], q: number) =>
    arr[Math.min(arr.length - 1, Math.floor(arr.length * q))] ?? 0;
  const rails: [number, number] = [at(sortedX, 0.1), at(sortedR, 0.9)];
  const dividers: number[] = [];
  let prevBottom = -Infinity;
  for (const u of [...args.units].sort((a, b) => a.y - b.y)) {
    if (u.y - prevBottom > 80) dividers.push(u.y);
    prevBottom = Math.max(prevBottom, u.y + u.h);
  }
  const host = document.createElement("div");
  host.setAttribute("data-cf-swarm", "");
  host.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:2147483646";
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  host.appendChild(canvas);
  document.documentElement.appendChild(host);
  observer.observe(document.body, { childList: true, subtree: true });
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  w.__cfSwarm = {
    units: args.units,
    els,
    plan: args.plan,
    styles,
    bodyStyle,
    late,
    observer,
    stage: args.units.map(() => 0),
    byAgent,
    edges,
    colors: byAgent.map((_, k) => PALETTE[k % PALETTE.length]!),
    rails,
    dividers,
    host,
    canvas,
    ctx,
    room: null,
    cam: 0,
    camV: 0,
    aim: 0,
    view: 0,
    lastMs: 0,
  };
}

// Runs in the page: puts the page and the canvas at the state they have `ms` into the build.
export function seekSwarm(ms: number) {
  const s = (window as SwarmWindow).__cfSwarm;
  if (!s) return;
  const { units, els, plan, ctx, colors } = s;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  // The viewport can differ from the one the canvas was made for; a resize clears the context's scale.
  if (
    s.canvas.width !== Math.round(W * dpr) ||
    s.canvas.height !== Math.round(H * dpr)
  ) {
    s.canvas.width = Math.round(W * dpr);
    s.canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const BLUE = "#2f7df6";
  const CURSOR_SCALE = 1.3;
  const ease = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
  const dt = Math.max(0, ms - s.lastMs);
  s.lastMs = ms;

  type Rect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  type Mark =
    | {
        kind: "text";
        rect: Rect;
        caret: { x: number; y: number };
        color: string;
      }
    | {
        kind: "media";
        rect: Rect;
        to: { x: number; y: number };
        color: string;
      }
    | { kind: "box"; rect: Rect; p: number; color: string };
  const marks: Mark[] = [];
  const cursors: {
    x: number;
    y: number;
    glyph: "arrow" | "ibeam" | "cross";
    color: string;
  }[] = [];

  // The composer the request is typed into, sized to the frame; the agents burst out of its send button.
  const u = W / 1480;
  const card = { w: Math.min(916 * u, W - 60), h: 196 * u, x: 0, y: 0 };
  card.x = (W - card.w) / 2;
  card.y = (H - card.h) / 2;
  const sendButton = {
    x: card.x + card.w - 50 * u,
    y: card.y + card.h - 50 * u,
  };
  const burstPoint = (agent: number) => {
    const a = agent * 2.399963;
    const d = (90 + ((agent * 37) % 7) * 22) * u;
    return {
      x: Math.min(W - 30, Math.max(30, sendButton.x + Math.cos(a) * d * 1.6)),
      y: Math.min(H - 40, Math.max(40, sendButton.y + Math.sin(a) * d)),
    };
  };

  // Where the working cursors are, in the frame as it was last scrolled.
  const working: number[] = [];
  const rectOf = (i: number): Rect => {
    const r = els[i]!.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  };
  const startPoint = (t: SwarmTask) => {
    const r = rectOf(t.unit);
    const u = units[t.unit]!;
    return u.kind === "text"
      ? { x: r.left, y: r.top + r.height / u.lines / 2 }
      : { x: r.left, y: r.top };
  };
  const endPoint = (t: SwarmTask) => {
    const r = rectOf(t.unit);
    const u = units[t.unit]!;
    if (u.kind === "text")
      return { x: r.right, y: r.bottom - r.height / u.lines / 2 };
    if (u.kind === "media" || u.kind === "frame")
      return { x: r.right, y: r.bottom };
    return { x: r.left, y: r.top };
  };
  const reveal = (i: number) => {
    const el = els[i]!;
    el.style.visibility = "";
    el.style.clipPath = "";
    el.style.opacity = "";
    if (s.styles[i] === null) {
      if (!el.getAttribute("style")) el.removeAttribute("style");
    }
  };

  for (const t of plan.tasks) {
    const i = t.unit;
    const p = (ms - t.start) / (t.end - t.start);
    if (p < 0) continue;
    if (p >= 1) {
      if (s.stage[i] !== 2) {
        reveal(i);
        s.stage[i] = 2;
      }
      continue;
    }
    s.stage[i] = 1;
    const el = els[i]!;
    const u = units[i]!;
    const r = rectOf(i);
    const color = s.colors[t.agent]!;
    if (u.kind === "text") {
      const line = Math.min(u.lines - 1, Math.floor(p * u.lines));
      const f = p * u.lines - line;
      const yTop = (line / u.lines) * 100;
      const yBot = ((line + 1) / u.lines) * 100;
      const xr = f * 100;
      el.style.visibility = "visible";
      el.style.opacity = "";
      el.style.clipPath = `polygon(0 0, 100% 0, 100% ${yTop}%, ${xr}% ${yTop}%, ${xr}% ${yBot}%, 0 ${yBot}%)`;
      const caret = {
        x: r.left + f * r.width,
        y: r.top + ((line + 0.5) * r.height) / u.lines,
      };
      marks.push({ kind: "text", rect: r, caret, color });
      cursors.push({ ...caret, glyph: "ibeam", color });
      working.push(caret.y);
    } else if (u.kind === "media" || u.kind === "frame") {
      // Dragged out from the top left corner, the picture filling the box as it grows.
      const q = clamp01(p / 0.9);
      const to = { x: r.left + q * r.width, y: r.top + q * r.height };
      el.style.visibility = "visible";
      el.style.opacity = "";
      el.style.clipPath = `inset(0 ${(1 - q) * 100}% ${(1 - q) * 100}% 0)`;
      marks.push({ kind: "media", rect: r, to, color });
      cursors.push({ ...to, glyph: "cross", color });
      working.push(to.y);
    } else {
      const q = clamp01(p / 0.75);
      if (p > 0.75) {
        el.style.visibility = "visible";
        el.style.clipPath = "";
        el.style.opacity = String(clamp01((p - 0.75) / 0.25));
      }
      const d = q * 2 * (r.width + r.height);
      const along =
        d < r.width
          ? { x: r.left + d, y: r.top }
          : d < r.width + r.height
            ? { x: r.right, y: r.top + (d - r.width) }
            : d < 2 * r.width + r.height
              ? { x: r.right - (d - r.width - r.height), y: r.bottom }
              : { x: r.left, y: r.bottom - (d - 2 * r.width - r.height) };
      marks.push({ kind: "box", rect: r, p: q, color });
      cursors.push({ ...along, glyph: "cross", color });
      working.push(along.y);
    }
  }

  // Agents between jobs: in from the edge, over to the next job, out when done.
  s.byAgent.forEach((list, k) => {
    const color = s.colors[k]!;
    const edge = s.edges[k]!;
    const active = list.find((t) => t.start <= ms && ms < t.end);
    if (active) return;
    const next = list.find((t) => t.start > ms);
    const prev = [...list].reverse().find((t) => t.end <= ms);
    let pos: { x: number; y: number } | null = null;
    if (!prev && next) {
      // After a prompt the agent waits where it landed from the burst until its first job.
      const from = plan.prompt ? burstPoint(k) : edge;
      const t0 = Math.max(plan.prompt?.ms ?? 0, next.go);
      if (ms >= t0) {
        const e = ease(clamp01((ms - t0) / Math.max(1, next.start - t0)));
        const to = startPoint(next);
        pos = {
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
        };
      } else if (plan.prompt && ms >= plan.prompt.ms) {
        pos = from;
      }
    } else if (prev && next) {
      const t0 = Math.max(prev.end, next.go);
      const e = ease(clamp01((ms - t0) / Math.max(1, next.start - t0)));
      const from = endPoint(prev);
      const to = startPoint(next);
      pos = {
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e - Math.sin(e * Math.PI) * 24,
      };
    } else if (prev) {
      const e = ease(clamp01((ms - prev.end) / 700));
      if (e < 1) {
        const from = endPoint(prev);
        pos = {
          x: from.x + (edge.x - from.x) * e,
          y: from.y + (edge.y - from.y) * e,
        };
      }
    }
    if (pos) cursors.push({ ...pos, glyph: "arrow", color });
  });

  /*
   * Camera: the front of the work sits above the middle of the frame, what
   * is still to come below it. The target jumps whenever a job starts, so it
   * is smoothed first, then followed by a damped spring with a capped speed
   * and acceleration: a slow push down the page, never a jolt. Everything
   * above was measured at the last scroll, so it is moved along with the frame.
   */
  const scrolled = window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - H);
  const all = working.map((y) => y + scrolled).sort((a, b) => a - b);
  const MARGIN = 60;
  // Work spread over more than a frame: the frame goes where most of it is.
  let from = 0;
  let group = { from: 0, count: 0 };
  for (let to = 0; to < all.length; to++) {
    while (all[to]! - all[from]! > H - 2 * MARGIN) from++;
    if (to - from + 1 > group.count) group = { from, count: to - from + 1 };
  }
  const ys = all.slice(group.from, group.from + group.count);
  const lo = ys[0];
  const hi = ys[ys.length - 1];
  let wanted = s.aim;
  if (ms < plan.introMs) {
    wanted = 0;
  } else if (lo !== undefined && hi !== undefined) {
    wanted = hi - H * 0.48;
    wanted = Math.min(wanted, lo - H * 0.1);
  }
  // The frame is always headed somewhere every cursor fits, on one curve, never faster than a viewer can follow, and only ever down the page.
  if (lo !== undefined && hi !== undefined) {
    wanted = Math.max(hi - (H - MARGIN), Math.min(lo - MARGIN, wanted));
  }
  wanted = Math.min(maxScroll, Math.max(s.aim, wanted));
  const sec = dt / 1000;
  if (ms < plan.introMs) {
    s.aim = s.cam = s.camV = 0;
  } else if (sec > 0) {
    s.aim += (wanted - s.aim) * (1 - Math.exp(-sec / 0.35));
    // Falling behind the lowest cursor stiffens the spring instead of snapping the frame.
    const behind =
      hi === undefined ? 0 : Math.max(0, hi - (H - MARGIN) - s.cam) / H;
    const omega = 4 + 8 * Math.min(1, behind * 4);
    const pull = omega * omega * (s.aim - s.cam) - 2 * omega * s.camV;
    const maxAccel = H * (2.2 + 6 * Math.min(1, behind * 4));
    s.camV += Math.max(-maxAccel, Math.min(maxAccel, pull)) * sec;
    s.camV = Math.max(0, Math.min(H * 1.6, s.camV));
    s.cam = Math.min(maxScroll, s.cam + s.camV * sec);
    if (s.cam >= maxScroll) s.camV = 0;
  }
  window.scrollTo({ top: s.cam, behavior: "instant" });
  s.view = window.scrollY;
  const shift = scrolled - s.view;
  if (shift) {
    for (const c of cursors) c.y += shift;
    for (const m of marks) {
      m.rect.top += shift;
      m.rect.bottom += shift;
      if (m.kind === "text") m.caret.y += shift;
      else if (m.kind === "media") m.to.y += shift;
    }
  }

  const outroAt = plan.durationMs - plan.outroMs;
  const promptMs = plan.prompt?.ms ?? 0;
  const alpha =
    ms < promptMs + 400
      ? clamp01((ms - promptMs) / 400)
      : ms > outroAt
        ? clamp01(1 - (ms - outroAt) / plan.outroMs)
        : 1;
  if (ms >= plan.durationMs) {
    units.forEach((_, i) => {
      if (s.stage[i] !== 2) {
        reveal(i);
        s.stage[i] = 2;
      }
    });
  }
  // Late arrivals show once the build has passed their place on the page.
  const builtTo =
    ms >= plan.durationMs
      ? Infinity
      : Math.min(
          Infinity,
          ...plan.tasks
            .filter((t) => s.stage[t.unit] !== 2)
            .map((t) => units[t.unit]!.y),
        );
  // Shown or gone, a node is no longer measured each frame, however much the page keeps adding.
  s.late = s.late.filter((el) => {
    if (!el.isConnected || el.style.visibility !== "hidden") return false;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top >= builtTo) return true;
    el.style.visibility = "";
    el.style.opacity = "";
    return false;
  });

  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = alpha;
  ctx.font = "500 9px -apple-system, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.92)";
  // The rulers' width, which the page was moved down by when it was mounted.
  const R = 20;
  ctx.fillRect(0, 0, W, R);
  ctx.fillRect(0, 0, R, H);
  ctx.strokeStyle = "rgba(0,0,0,.18)";
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = R; x < W; x += 50) {
    const major = x % 100 === R;
    ctx.moveTo(x + 0.5, R);
    ctx.lineTo(x + 0.5, major ? 10 : 15);
    if (major) ctx.fillText(String(x - R), x + 3, 9);
  }
  const camOff = Math.round(s.view) % 50;
  for (let y = R - camOff; y < H; y += 50) {
    const doc = Math.round(y - R + s.view);
    const major = doc % 100 === 0;
    ctx.moveTo(R, y + 0.5);
    ctx.lineTo(major ? 10 : 15, y + 0.5);
    if (major && y > R + 4) {
      ctx.save();
      ctx.translate(9, y + 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(String(doc), 0, 0);
      ctx.restore();
    }
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,.09)";
  ctx.beginPath();
  for (const d of s.dividers) {
    const y = d + R - s.view;
    if (y > R && y < H) {
      ctx.moveTo(R, Math.round(y) + 0.5);
      ctx.lineTo(W, Math.round(y) + 0.5);
    }
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,84,54,.85)";
  ctx.beginPath();
  for (const x of s.rails) {
    ctx.moveTo(Math.round(x) + 0.5, 20);
    ctx.lineTo(Math.round(x) + 0.5, H);
  }
  ctx.stroke();

  const pill = (text: string, x: number, y: number, bg: string) => {
    ctx.font = "600 11px -apple-system, system-ui, sans-serif";
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 18, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x + 6, y + 13);
  };
  const handles = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = BLUE;
    for (const [hx, hy] of [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ] as const) {
      ctx.fillRect(hx - 3, hy - 3, 6, 6);
      ctx.strokeRect(hx - 2.5, hy - 2.5, 5, 5);
    }
  };
  for (const m of marks) {
    const r = m.rect;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(47,125,246,.35)";
    ctx.beginPath();
    ctx.moveTo(20, Math.round(r.top) + 0.5);
    ctx.lineTo(W, Math.round(r.top) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    if (m.kind === "text") {
      ctx.strokeStyle = BLUE;
      ctx.strokeRect(r.left - 2.5, r.top - 2.5, r.width + 5, r.height + 5);
      handles(r.left - 2.5, r.top - 2.5, r.width + 5, r.height + 5);
      pill(
        `${Math.round(r.width)} × ${Math.round(r.height)}`,
        r.left + r.width / 2 - 24,
        r.bottom + 7,
        BLUE,
      );
      ctx.fillStyle = m.color;
      ctx.fillRect(m.caret.x, m.caret.y - 9, 2, 18);
    } else if (m.kind === "media") {
      const w = m.to.x - r.left;
      const h = m.to.y - r.top;
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = BLUE;
      ctx.strokeRect(r.left + 0.5, r.top + 0.5, w, h);
      ctx.setLineDash([]);
      handles(r.left, r.top, w, h);
      pill(`${Math.round(w)} × ${Math.round(h)}`, m.to.x + 8, m.to.y + 8, BLUE);
    } else {
      const per = 2 * (r.width + r.height);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([per, per]);
      ctx.lineDashOffset = per * (1 - m.p);
      ctx.strokeRect(r.left, r.top, r.width, r.height);
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
    }
  }

  const drawCursor = (c: (typeof cursors)[number], scale = 1) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(scale * CURSOR_SCALE, scale * CURSOR_SCALE);
    ctx.translate(-c.x, -c.y);
    ctx.fillStyle = c.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (c.glyph === "arrow") {
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + 17);
      ctx.lineTo(c.x + 4.5, c.y + 13);
      ctx.lineTo(c.x + 7.5, c.y + 19.5);
      ctx.lineTo(c.x + 10.5, c.y + 18);
      ctx.lineTo(c.x + 7.5, c.y + 11.5);
      ctx.lineTo(c.x + 13, c.y + 11.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (c.glyph === "ibeam") {
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.moveTo(c.x - 4, c.y - 9);
      ctx.lineTo(c.x + 4, c.y - 9);
      ctx.moveTo(c.x, c.y - 9);
      ctx.lineTo(c.x, c.y + 9);
      ctx.moveTo(c.x - 4, c.y + 9);
      ctx.lineTo(c.x + 4, c.y + 9);
      ctx.stroke();
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else {
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.moveTo(c.x - 8, c.y);
      ctx.lineTo(c.x + 8, c.y);
      ctx.moveTo(c.x, c.y - 8);
      ctx.lineTo(c.x, c.y + 8);
      ctx.stroke();
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  };
  ctx.shadowColor = "rgba(0,0,0,.3)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  for (const c of cursors) drawCursor(c);
  ctx.shadowColor = "transparent";

  const done = s.stage.filter((v) => v === 2).length;
  const label = `${plan.agents} agents · ${done}/${units.length} elements`;
  ctx.font = "600 13px -apple-system, system-ui, sans-serif";
  const lw = ctx.measureText(label).width + 28;
  ctx.fillStyle = "rgba(17,17,17,.88)";
  ctx.beginPath();
  ctx.roundRect(W - lw - 16, H - 46, lw, 30, 15);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(label, W - lw - 16 + 14, H - 26);
  ctx.globalAlpha = 1;

  const paintRoom = () => {
    const room = document.createElement("canvas");
    room.width = s.canvas.width;
    room.height = s.canvas.height;
    const rc = room.getContext("2d")!;
    rc.scale(dpr, dpr);
    rc.fillStyle = "#cfe6f0";
    rc.fillRect(0, 0, W, H);
    const blobs: [number, number, number, string][] = [
      [0.5, 0.5, 0.62, "rgba(250,253,255,.95)"],
      [0.12, 0.18, 0.34, "rgba(226,240,196,.8)"],
      [0.9, 0.12, 0.3, "rgba(232,242,200,.7)"],
      [0.08, 0.86, 0.3, "rgba(238,240,190,.7)"],
      [0.94, 0.8, 0.32, "rgba(214,236,206,.7)"],
      [0.3, 0.95, 0.26, "rgba(182,222,238,.8)"],
      [0.72, 0.04, 0.24, "rgba(178,220,240,.8)"],
      [0.02, 0.5, 0.22, "rgba(170,216,236,.7)"],
      [0.98, 0.45, 0.22, "rgba(190,226,240,.7)"],
    ];
    for (const [fx, fy, fr, color] of blobs) {
      const g = rc.createRadialGradient(
        fx * W,
        fy * H,
        0,
        fx * W,
        fy * H,
        fr * W,
      );
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(255,255,255,0)");
      rc.fillStyle = g;
      rc.fillRect(0, 0, W, H);
    }
    return room;
  };
  const pr = plan.prompt;
  if (pr && ms < pr.ms) {
    // The room behind the composer, painted once: its gradients would cost every frame.
    if (
      !s.room ||
      s.room.width !== s.canvas.width ||
      s.room.height !== s.canvas.height
    ) {
      s.room = paintRoom();
    }
    drawComposer(pr, s.room);
  }

  /*
   * The opening: a dark room with the composer in it, slowly pushed in on
   * while the request is typed, a pointer that comes in and clicks send,
   * then the card gives way and the agents pop out of the button.
   */
  function drawComposer(pr: SwarmPrompt, room: HTMLCanvasElement) {
    const sendAt = pr.sendAt;
    const typingEnd = pr.at[pr.at.length - 1] ?? pr.inMs;
    const backOut = (t: number) =>
      1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
    const inT = clamp01(ms / pr.inMs);
    const enter = backOut(inT);
    // Each part of the card lands a beat after the last, overshooting a little.
    const popIn = (cx: number, cy: number, delay: number, draw: () => void) => {
      const t = clamp01((ms - delay) / 320);
      if (t <= 0) return;
      const sc = 0.6 + 0.4 * backOut(t);
      ctx.save();
      ctx.globalAlpha *= clamp01(t * 3);
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      draw();
      ctx.restore();
    };
    const pressP = clamp01((ms - sendAt) / 120);
    const outP = clamp01((ms - sendAt - 100) / 400);
    const roomP = clamp01((ms - sendAt - 200) / 500);
    let typed = 0;
    while (typed < pr.at.length && pr.at[typed]! <= ms) typed++;
    const font = (weight: number, px: number) =>
      `${weight} ${px * u}px -apple-system, system-ui, "Segoe UI", sans-serif`;
    const chevron = (x: number, y: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.7 * u;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x - 4 * u, y - 2 * u);
      ctx.lineTo(x, y + 2 * u);
      ctx.lineTo(x + 4 * u, y - 2 * u);
      ctx.stroke();
    };
    const pill = (x: number, y: number, w: number) => {
      ctx.fillStyle = "#26262c";
      ctx.beginPath();
      ctx.roundRect(x, y, w, 44 * u, 22 * u);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.095)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    ctx.globalAlpha = 1 - roomP;
    ctx.drawImage(room, 0, 0, W, H);

    // The card snaps in from small, drifts closer while typing, then is punched and let go.
    const drift =
      1 +
      0.04 * ease(clamp01((ms - pr.inMs) / Math.max(1, typingEnd - pr.inMs)));
    const scale = (0.72 + 0.28 * enter) * drift * (1 + 0.1 * ease(outP));
    ctx.save();
    ctx.globalAlpha = clamp01(inT * 2.5) * (1 - ease(outP));
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -H / 2 + (1 - enter) * 28 * u);
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 45 * u;
    ctx.shadowOffsetY = 20 * u;
    ctx.fillStyle = "#18181c";
    ctx.beginPath();
    ctx.roundRect(card.x, card.y, card.w, card.h, 24 * u);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // The text line: the placeholder until the first key lands, each new letter popping in.
    const tx = card.x + 30 * u;
    const ty = card.y + 60 * u;
    ctx.font = font(400, 21.5);
    ctx.textBaseline = "alphabetic";
    popIn(tx + 180 * u, ty - 8 * u, 140, () => {
      if (!typed) {
        ctx.fillStyle = "#8c8b93";
        ctx.fillText("Plan, Build, Automate / @ for context", tx, ty);
      } else {
        const text = pr.text.slice(0, typed);
        const head = text.slice(0, -1);
        const last = text.slice(-1);
        ctx.fillStyle = "#f4f4f6";
        ctx.fillText(head, tx, ty);
        const lx = tx + ctx.measureText(head).width;
        const age = ms - pr.at[typed - 1]!;
        const pop = age < 90 ? 1.3 - 0.3 * (age / 90) : 1;
        ctx.save();
        ctx.translate(lx, ty);
        ctx.scale(pop, pop);
        ctx.fillText(last, 0, 0);
        ctx.restore();
      }
      const typing = typed > 0 && ms < typingEnd + 120;
      if (ms < sendAt && (typing || Math.floor(ms / 530) % 2 === 0)) {
        const cx = typed
          ? tx + ctx.measureText(pr.text.slice(0, typed)).width + 2 * u
          : tx;
        ctx.fillStyle = "#f4f4f6";
        ctx.fillRect(cx, ty - 19 * u, 2 * u, 25 * u);
      }
    });

    // The bar: add, mode, model on the left; microphone and send on the right.
    const by = card.y + card.h - 72 * u;
    const bx = card.x + 28 * u;
    popIn(bx + 22 * u, by + 22 * u, 180, () => {
      pill(bx, by, 44 * u);
      ctx.strokeStyle = "#e4e4e8";
      ctx.lineWidth = 1.8 * u;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(bx + 22 * u, by + 14 * u);
      ctx.lineTo(bx + 22 * u, by + 30 * u);
      ctx.moveTo(bx + 14 * u, by + 22 * u);
      ctx.lineTo(bx + 30 * u, by + 22 * u);
      ctx.stroke();
    });
    const mx = bx + 56 * u;
    popIn(mx + 64 * u, by + 22 * u, 230, () => {
      pill(mx, by, 128 * u);
      ctx.font = font(500, 17.5);
      ctx.fillStyle = "#f4f4f6";
      ctx.fillText("Build", mx + 24 * u, by + 28.5 * u);
      chevron(mx + 101 * u, by + 22 * u, "#9e9da6");
    });
    const lx = mx + 128 * u + 22 * u;
    // The CaptureFlow mark where a model picker would sit.
    popIn(lx + 80 * u, by + 22 * u, 280, () => {
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.arc(lx + 13 * u, by + 22 * u, 13 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6 * u;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.moveTo(
          lx + 13 * u + Math.cos(a) * 2.5 * u,
          by + 22 * u + Math.sin(a) * 2.5 * u,
        );
        ctx.lineTo(
          lx + 13 * u + Math.cos(a) * 7 * u,
          by + 22 * u + Math.sin(a) * 7 * u,
        );
      }
      ctx.stroke();
      ctx.font = font(600, 17.5);
      ctx.fillStyle = "#f4f4f6";
      ctx.fillText("CaptureFlow", lx + 36 * u, by + 28.5 * u);
    });
    const micX = sendButton.x - 58 * u;
    popIn(micX, by + 22 * u, 330, () => {
      pill(micX - 22 * u, by, 44 * u);
      ctx.strokeStyle = "#e4e4e8";
      ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      ctx.roundRect(micX - 3 * u, by + 12 * u, 6 * u, 11 * u, 3 * u);
      ctx.moveTo(micX - 7 * u, by + 20 * u);
      ctx.arc(micX, by + 20 * u, 7 * u, Math.PI, 0, true);
      ctx.moveTo(micX, by + 27 * u);
      ctx.lineTo(micX, by + 31 * u);
      ctx.moveTo(micX - 4 * u, by + 31 * u);
      ctx.lineTo(micX + 4 * u, by + 31 * u);
      ctx.stroke();
    });
    const ready = typed > 0;
    const press = 1 - 0.1 * Math.sin(pressP * Math.PI);
    popIn(sendButton.x, sendButton.y, 380, () => {
      ctx.fillStyle = ready ? "#2d2d35" : "#222227";
      ctx.beginPath();
      ctx.arc(sendButton.x, sendButton.y, 22 * u * press, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ready
        ? "rgba(255,255,255,.16)"
        : "rgba(255,255,255,.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = ready ? "#f4f4f6" : "#7c7b84";
      ctx.lineWidth = 1.8 * u;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(sendButton.x, sendButton.y + 6 * u);
      ctx.lineTo(sendButton.x, sendButton.y - 6 * u);
      ctx.moveTo(sendButton.x - 5 * u, sendButton.y - 1 * u);
      ctx.lineTo(sendButton.x, sendButton.y - 6 * u);
      ctx.lineTo(sendButton.x + 5 * u, sendButton.y - 1 * u);
      ctx.stroke();
    });
    ctx.restore();

    // Where the button is on screen, the card being drawn scaled about the middle of the frame.
    const button = {
      x: W / 2 + (sendButton.x - W / 2) * scale,
      y: H / 2 + (sendButton.y - H / 2 + (1 - enter) * 28 * u) * scale,
    };

    // The click: a ring leaves the button as it's pressed.
    const ringP = clamp01((ms - sendAt) / 420);
    if (ringP > 0 && ringP < 1) {
      ctx.globalAlpha = (1 - ringP) * 0.7;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(button.x, button.y, (22 + 50 * ringP) * u, 0, Math.PI * 2);
      ctx.stroke();
    }

    // The agents: each pops out of the button a beat after the last and spreads.
    ctx.shadowColor = "rgba(0,0,0,.3)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.globalAlpha = 1;
    for (let k = 0; k < plan.agents; k++) {
      const tk = sendAt + 100 + k * 12;
      if (ms < tk) continue;
      const p = clamp01((ms - tk) / 450);
      const e = 1 - Math.pow(1 - p, 3);
      const to = burstPoint(k);
      const pop =
        p < 0.25 ? 0.2 + 1.3 * (p / 0.25) : 1.5 - 0.5 * ((p - 0.25) / 0.75);
      drawCursor(
        {
          x: button.x + (to.x - button.x) * e,
          y: button.y + (to.y - button.y) * e,
          glyph: "arrow",
          color: colors[k]!,
        },
        pop,
      );
    }
    ctx.shadowColor = "transparent";

    // The pointer: in from the lower right during the pause, down on the button, then away with the room.
    const glideAt = sendAt - 450;
    if (ms >= glideAt) {
      const g = ease(clamp01((ms - glideAt) / 450));
      const from = { x: button.x + 190 * u, y: button.y + 150 * u };
      const aim = { x: button.x - 2 * u, y: button.y - 3 * u };
      ctx.globalAlpha = 1 - roomP;
      drawCursor(
        {
          x: from.x + (aim.x - from.x) * g,
          y: from.y + (aim.y - from.y) * g,
          glyph: "arrow",
          color: "#111",
        },
        1.15 * press,
      );
    }
    ctx.globalAlpha = 1;
  }
}

// Runs in the page: puts every element's own style back and takes the canvas down.
export function unmountSwarm() {
  const w = window as SwarmWindow;
  const s = w.__cfSwarm;
  if (!s) return;
  s.els.forEach((el, i) => {
    const original = s.styles[i];
    if (original === null) el.removeAttribute("style");
    else el.setAttribute("style", original);
  });
  for (const span of w.__cfSwarmWraps ?? []) {
    if (span.firstChild) span.replaceWith(span.firstChild);
  }
  s.observer.disconnect();
  for (const el of s.late) {
    el.style.visibility = "";
    el.style.opacity = "";
  }
  if (s.bodyStyle === null) document.body.removeAttribute("style");
  else document.body.setAttribute("style", s.bodyStyle);
  s.host.remove();
  delete w.__cfSwarm;
  delete w.__cfSwarmUnits;
  delete w.__cfSwarmEls;
  delete w.__cfSwarmWraps;
}
