import type { Browser, BrowserContext, Locator, Page } from "playwright";
import { pageFeed } from "./capture";
import { CURSOR_SCRIPT, type CursorState } from "./cursor";
import { FPS } from "./pacing";
import { isAllowedUrl } from "./guard";
import { renderMusic } from "./music";
import { PAGE_AUDIO_BINDING, PAGE_AUDIO_SCRIPT } from "./page-audio";
import { layerSounds, typingSound, type SoundLayer } from "./sound";
import {
  fitWindow,
  openRecording,
  SessionError,
  sleep,
  slideWindow,
  type RecordingOutput,
} from "./recording";
import type { Slide } from "./slide";
import {
  mountSwarm,
  CONSENT_SELECTOR,
  planSwarm,
  scanSwarmUnits,
  seekSwarm,
  settlePage,
  SWARM_LIMITS,
  swarmSeconds,
  unmountSwarm,
  type SwarmUnit,
} from "./swarm";
import { looksLikeWall } from "./wall";

// Without a url the recording is a presentation: slides and narration on a blank stage.
export type StartRequest = {
  url?: string;
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  width?: number;
  height?: number;
  zoom?: number;
  // "high": motion is drawn at the video's own pixel size and given twice the bitrate; slower to make.
  quality?: "standard" | "high";
  maxDurationMs: number;
  idleMs: number;
  output: RecordingOutput;
};

export type SessionOptions = {
  allowUrl?: (url: string) => Promise<boolean>;
  ffmpegPath?: string;
};

export type Target = { text?: string; selector?: string };

export type Action =
  | { type: "click"; target: Target }
  | { type: "type"; text: string; target?: Target; submit?: boolean }
  | { type: "press"; key: string }
  | { type: "scroll"; direction: "down" | "up"; amount?: number }
  | { type: "navigate"; url: string }
  | { type: "wait"; seconds: number }
  | { type: "show_slide"; slide: Slide }
  | { type: "hide_slide" };

export type RebuildRequest = {
  url?: string;
  agents?: number;
  seconds?: number;
  maxSeconds?: number;
  screens?: number;
  prompt?: string;
  music?: string | null;
};

// Pages are drawn a little larger than life, so text reads at video size.
export const DEFAULT_ZOOM = 1.3;
/*
 * A launch flag for the browser: a headless window's surface is at one
 * device pixel per CSS pixel whatever the context emulates, so its frames
 * come out page-sized and get scaled up. At the zoom, frames come out
 * video-sized, and a plain screenshot is several times quicker than one
 * clipped and scaled to that size.
 */
export function deviceScaleArg(zoom = DEFAULT_ZOOM): string {
  return `--force-device-scale-factor=${zoom}`;
}
const BITRATE = 4_000_000;
const TYPE_DELAY_MS = 45;
const SETTLE_MS = 600;
const REVEAL_MS = 400;
const PROMPT_POSTER_MS = 250;
const LOAD_MS = 30_000;
// A page with fewer units than this is checked for being a block page.
const WALL_UNITS = 12;
const OUTLINE_CHARS = 6000;
const FRAME_MS = 16;
const MOUSE_MS = { min: 450, max: 900, perPx: 0.8 };
const SCROLL_DRIFT_MS = 800;
const KEY_SHOWN_MS = 500;
const STAGE_HTML =
  '<!doctype html><html><head><meta charset="utf-8"><title>Presentation</title></head><body style="margin:0;background:#f4f4f5"></body></html>';

type Point = { x: number; y: number };

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const linear = (t: number) => t;
const within = (v: number, lim: { min: number; max: number }) =>
  Math.min(lim.max, Math.max(lim.min, v));

const KEY_NAMES: Record<string, string> = {
  Enter: "Enter",
  Escape: "Esc",
  Backspace: "Backspace",
  Tab: "Tab",
  ArrowDown: "Down",
  ArrowUp: "Up",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  " ": "Space",
};
const keyLabel = (key: string) =>
  key
    .split("+")
    .map((part) => KEY_NAMES[part] ?? part)
    .join(" + ");

type ScrollPlan = {
  from: number;
  to: number;
  durationMs: number;
  nested: boolean;
};

// Runs in the page: what scrolls under the cursor, and how far it can go.
function scrollPlan({
  dy,
  x,
  y,
}: {
  dy: number;
  x: number;
  y: number;
}): ScrollPlan {
  const scrolls = (el: Element) => {
    const { overflowY } = getComputedStyle(el);
    return (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    );
  };
  let el: Element | null = document.elementFromPoint(x, y);
  while (el && el !== document.body && !scrolls(el)) el = el.parentElement;
  const nested = !!el && el !== document.body && scrolls(el);
  const target = nested
    ? el!
    : (document.scrollingElement ?? document.documentElement);
  if (nested) target.setAttribute("data-cf-scroll", "");
  const from = target.scrollTop;
  const to = Math.max(
    0,
    Math.min(target.scrollHeight - target.clientHeight, from + dy),
  );
  const durationMs = Math.min(1800, Math.max(700, Math.abs(to - from) * 1.1));
  return { from, to, durationMs, nested };
}

// Runs in the page: puts the planned scroller at the eased position t.
function scrollTo({ from, to, nested, t }: ScrollPlan & { t: number }) {
  const target = nested
    ? (document.querySelector("[data-cf-scroll]") ?? document.documentElement)
    : (document.scrollingElement ?? document.documentElement);
  target.scrollTo({ top: from + (to - from) * t, behavior: "instant" });
  if (t >= 1) target.removeAttribute("data-cf-scroll");
}

export type Session = Awaited<ReturnType<typeof startSession>>;

export async function startSession(
  browser: Browser,
  req: StartRequest,
  opts: SessionOptions = {},
) {
  const allowUrl = opts.allowUrl ?? ((url: string) => isAllowedUrl(url));
  if (req.url && !(await allowUrl(req.url))) {
    throw new SessionError("That address can't be opened in the recorder.");
  }
  // The video keeps the asked size; the page is laid out smaller by the zoom and drawn larger.
  const frame = { width: req.width ?? 1920, height: req.height ?? 1080 };
  const zoom = req.zoom ?? DEFAULT_ZOOM;
  const width = Math.round(frame.width / zoom);
  const height = Math.round(frame.height / zoom);
  const context: BrowserContext = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: zoom,
    colorScheme: "light",
    locale: "en-US",
  });
  await context.addInitScript(CURSOR_SCRIPT);
  // The page's sound, once the capture is there to take it.
  let pageAudio: ((pcm: Int16Array) => void) | null = null;
  await context.exposeBinding(PAGE_AUDIO_BINDING, (_source, base64: string) => {
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    pageAudio?.(new Int16Array(bytes.buffer, 0, bytes.byteLength >> 1));
  });
  await context.addInitScript(PAGE_AUDIO_SCRIPT);
  await context.route("**/*", async (route) => {
    if (await allowUrl(route.request().url())) await route.continue();
    else await route.abort("blockedbyclient");
  });
  const page: Page = await context.newPage();
  let mouse = { x: width / 2, y: height / 2 };

  // A page that never finishes loading its extras is still there to show once its document is.
  async function open(url: string) {
    try {
      await page.goto(url, { waitUntil: "load", timeout: LOAD_MS });
    } catch (err) {
      const parsed = await page
        .evaluate(() => document.readyState !== "loading" && !!document.body)
        .catch(() => false);
      if (!parsed) throw err;
    }
  }

  if (req.url) {
    try {
      await open(req.url);
    } catch (err) {
      await context.close();
      throw new SessionError(`The page didn't load: ${(err as Error).message}`);
    }
    await page.mouse.move(mouse.x, mouse.y);
  } else {
    await page.setContent(STAGE_HTML);
  }
  await fitWindow(context, width, height);
  await sleep(SETTLE_MS);

  const pageTitle = req.url ? await page.title() : "";
  const rec = await openRecording({
    title: req.title || pageTitle || undefined,
    visibility: req.visibility,
    workspaceId: req.workspaceId,
    width: frame.width,
    height: frame.height,
    maxDurationMs: req.maxDurationMs,
    idleMs: req.idleMs,
    output: req.output,
    feed: pageFeed(page, frame.width, frame.height),
    slides: slideWindow(browser, frame.width, frame.height),
    pauseBetweenActions: true,
    bitrate: req.quality === "high" ? BITRATE * 2 : BITRATE,
    leadInMs: req.url ? undefined : 0,
    ffmpegPath: opts.ffmpegPath,
    close: () => context.close(),
  });
  if (req.url) rec.mark(pageTitle || new URL(req.url).host);
  pageAudio = (pcm) => rec.feedAudio(pcm);

  async function locate(target: Target): Promise<Locator> {
    if (target.selector) return page.locator(target.selector).first();
    if (!target.text) throw new SessionError("Give a text or a selector.");
    for (const role of ["button", "link", "tab", "menuitem"] as const) {
      const byRole = page.getByRole(role, { name: target.text }).first();
      if (await byRole.isVisible().catch(() => false)) return byRole;
    }
    return page.getByText(target.text).first();
  }

  /*
   * Motion the agent animates is drawn a frame at a time, off the clock:
   * each frame sets the exact state, takes a screenshot and pushes it as
   * one frame of virtual time. A heavy page that can't repaint at 30 fps
   * live still scrolls and glides perfectly smoothly on camera. Under a
   * slide the page is off camera, so the state is just set.
   */
  async function animate(
    durationMs: number,
    draw: (t: number) => Promise<void>,
    ease = easeInOut,
  ) {
    const frames = Math.max(1, Math.round((durationMs / 1000) * FPS));
    if (rec.onSlide) return draw(1);
    const cdp = await context.newCDPSession(page);
    const shot =
      req.quality === "high"
        ? { format: "jpeg" as const, quality: 90 }
        : { format: "jpeg" as const, quality: 85, optimizeForSpeed: true };
    rec.capture.pause();
    // The feed's own frames are not wanted while frames are stepped in.
    await rec.capture.holdFeed();
    try {
      for (let i = 1; i <= frames; i++) {
        await draw(ease(i / frames));
        const { data } = await cdp.send("Page.captureScreenshot", shot);
        rec.capture.step(Buffer.from(data, "base64"));
      }
    } finally {
      await rec.capture.releaseFeed();
      rec.capture.resume();
      await cdp.detach().catch(() => {});
    }
  }

  // Eases the pointer over, taking longer for a longer trip, the way a hand would.
  async function glide(to: Point, durationMs?: number) {
    const from = mouse;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const duration =
      durationMs ??
      Math.min(MOUSE_MS.max, Math.max(MOUSE_MS.min, distance * MOUSE_MS.perPx));
    await animate(duration, (t) =>
      page.mouse.move(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
      ),
    );
    mouse = to;
  }

  async function moveTo(locator: Locator) {
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
    const box = await locator.boundingBox();
    if (!box) throw new SessionError("That element isn't on screen.");
    await glide({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  }

  // Somewhere in the text a reader's pointer would rest, never quite the same spot twice.
  const readingSpot = (): Point => ({
    x: width * 0.42 + (Math.random() - 0.5) * 160,
    y: height * 0.55 + (Math.random() - 0.5) * 120,
  });

  function cursor(state: CursorState, label = "") {
    return page
      .evaluate(
        `window.__cfCursorState && window.__cfCursorState(${JSON.stringify(state)}, ${JSON.stringify(label)})`,
      )
      .catch(() => {});
  }

  function cursorHidden(hidden: boolean) {
    return page
      .evaluate(`window.__cfCursorHidden && window.__cfCursorHidden(${hidden})`)
      .catch(() => {});
  }

  /*
   * The page is scrolled through and scanned off camera, then the build is
   * drawn a frame at a time; the recorder's own pointer stays out of it.
   */
  async function rebuild(req: RebuildRequest) {
    rec.live();
    const startedAt = Date.now();
    // Getting the page ready isn't recorded, but on a slow machine it can outlast the idle stop.
    const { plan, built } = await rec.offCamera(async () => {
      if (req.url) {
        if (!(await allowUrl(req.url))) {
          throw new SessionError(
            "That address can't be opened in the recorder.",
          );
        }
        await open(req.url);
      } else if (!/^https?:/.test(page.url())) {
        throw new SessionError(
          "Give a url: this recording has no page open yet.",
        );
      }
      const maxY =
        height *
        within(req.screens ?? SWARM_LIMITS.screens, {
          min: 1,
          max: SWARM_LIMITS.screens,
        });
      await page.evaluate(settlePage, {
        step: height,
        maxY,
        hide: CONSENT_SELECTOR,
      });
      await page.evaluate(() => document.fonts.ready).catch(() => {});
      /*
       * Scanned a screen at a time, from where a viewer would see it, so what
       * fades in on arrival is caught too. The screen past the build is scanned
       * as well: hidden, never built, so nothing unbuilt shows when the camera
       * reaches the bottom.
       */
      const scanY = maxY + height;
      let units: SwarmUnit[] = [];
      const scanScreens = async () => {
        for (let top = 0; top <= scanY; top += height) {
          await page.evaluate(
            (y) => window.scrollTo({ top: y, behavior: "instant" }),
            top,
          );
          await sleep(REVEAL_MS);
          units = await page.evaluate(scanSwarmUnits, {
            maxUnits: SWARM_LIMITS.maxUnits,
            maxY: scanY,
            hide: CONSENT_SELECTOR,
          });
        }
      };
      // A page still fetching parts of itself while it is scanned gets a second pass.
      const grew = await page.evaluateHandle(() => {
        const grown = { value: false };
        new MutationObserver(() => (grown.value = true)).observe(
          document.body,
          {
            childList: true,
            subtree: true,
          },
        );
        return grown;
      });
      await scanScreens();
      if (await grew.evaluate((g) => g.value)) await scanScreens();
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await sleep(SETTLE_MS);
      const built = units.filter((u) => u.y <= maxY);
      if (built.length < WALL_UNITS) {
        const [title, text] = await Promise.all([
          page.title().catch(() => ""),
          page.evaluate(() => document.body?.innerText ?? "").catch(() => ""),
        ]);
        if (looksLikeWall(title, text)) {
          throw new SessionError(
            "That site shows a bot check or a block page to automated browsers, so there's nothing to rebuild.",
          );
        }
      }
      if (!built.length) {
        throw new SessionError("There's nothing on that page to rebuild.");
      }
      const screens =
        Math.max(0, ...built.map((u) => u.y + u.h)) / Math.max(1, height);
      const seconds =
        req.seconds ??
        Math.min(
          swarmSeconds(built.length, screens),
          req.maxSeconds ?? Infinity,
        );
      const durationMs = within(seconds, SWARM_LIMITS.seconds) * 1000;
      const seed = Date.now() % 1_000_000;
      const plan = planSwarm(units, {
        agents: Math.round(
          within(
            req.agents ?? SWARM_LIMITS.agents.default,
            SWARM_LIMITS.agents,
          ),
        ),
        durationMs,
        seed,
        prompt:
          req.prompt === undefined
            ? `Rebuild ${new URL(page.url()).host}`
            : req.prompt.trim().slice(0, 120),
        tempo: Boolean(req.music),
        maxY,
        screen: height,
      });
      await page.evaluate(mountSwarm, { units, plan, hide: CONSENT_SELECTOR });
      await cursorHidden(true);
      // The keys are heard as the prompt is typed; the music starts on send, shares the build's tempo and is gone when the build is.
      const sounds: SoundLayer[] = [];
      if (plan.prompt) {
        sounds.push({ pcm: typingSound(plan.prompt, seed), atMs: 0 });
      }
      if (req.music && plan.tempo) {
        const atMs = plan.prompt?.sendAt ?? 0;
        const pcm = await renderMusic(
          req.music,
          {
            rampFromMs: plan.tempo.rampFromMs - atMs,
            rampToMs: plan.tempo.rampToMs - atMs,
            lengthMs: plan.durationMs - atMs,
          },
          opts.ffmpegPath,
        ).catch((err) => {
          throw new SessionError(
            `The music couldn't be prepared: ${(err as Error).message}`,
          );
        });
        sounds.push({ pcm, atMs });
      }
      if (sounds.length) rec.music(layerSounds(sounds));
      return { plan, built };
    });
    // The link preview shows the request typed out, before the pointer heads for send.
    if (plan.prompt) {
      rec.capture.posterAt(
        rec.capture.durationMs + plan.prompt.at.at(-1)! + PROMPT_POSTER_MS,
      );
    }
    const drawFrom = Date.now();
    rec.mark(`Rebuilding ${new URL(page.url()).host}`);
    try {
      await rec.recorded(() =>
        animate(
          plan.durationMs,
          (t) => page.evaluate(seekSwarm, t * plan.durationMs),
          linear,
        ),
      );
    } finally {
      await page.evaluate(unmountSwarm).catch(() => {});
      await cursorHidden(false);
    }
    await rec.recorded(() => sleep(SETTLE_MS));
    return {
      elements: built.length,
      agents: plan.agents,
      prepareMs: drawFrom - startedAt,
      drawMs: Date.now() - drawFrom,
    };
  }

  async function act(action: Action) {
    rec.live();
    if (action.type === "show_slide") {
      rec.mark(action.slide.title);
      return rec.showSlide(action.slide);
    }
    if (action.type === "hide_slide") {
      return rec.recorded(() =>
        rec.hideSlide(pageFeed(page, frame.width, frame.height)),
      );
    }
    // Acting on the page under a slide sets up what the viewer sees once it's hidden; a wait holds the slide.
    const behind = rec.onSlide && action.type !== "wait";
    await (behind ? perform(action) : rec.recorded(() => perform(action)));
  }

  async function perform(action: Action) {
    switch (action.type) {
      case "click": {
        const target = await locate(action.target);
        await moveTo(target);
        await page.mouse.down();
        await sleep(60);
        await page.mouse.up();
        break;
      }
      case "type": {
        if (action.target) {
          const field = await locate(action.target);
          await moveTo(field);
          await field.click();
        }
        await cursor("type", "Typing");
        await page.keyboard.type(action.text, { delay: TYPE_DELAY_MS });
        if (action.submit) {
          await cursor("key", "Enter");
          await page.keyboard.press("Enter");
          await sleep(KEY_SHOWN_MS);
        }
        await cursor("");
        break;
      }
      case "press":
        await cursor("key", keyLabel(action.key));
        await page.keyboard.press(action.key);
        await sleep(KEY_SHOWN_MS);
        await cursor("");
        break;
      case "scroll": {
        const sign = action.direction === "up" ? -1 : 1;
        const dy = sign * (action.amount ?? 0.8) * height;
        await glide(readingSpot());
        await cursor(
          action.direction === "up" ? "scroll-up" : "scroll-down",
          `Scrolling ${action.direction}`,
        );
        const plan = await page.evaluate(scrollPlan, {
          dy,
          x: mouse.x,
          y: mouse.y,
        });
        // The pointer drifts a little with the page, as a hand on a trackpad does.
        const from = mouse;
        const drift = { x: (Math.random() - 0.5) * 40, y: sign * 48 };
        await animate(plan.durationMs, async (t) => {
          await page.evaluate(scrollTo, { ...plan, t });
          await page.mouse.move(from.x + drift.x * t, from.y + drift.y * t);
        });
        mouse = { x: from.x + drift.x, y: from.y + drift.y };
        await cursor("");
        break;
      }
      case "navigate":
        if (!(await allowUrl(action.url))) {
          throw new SessionError(
            "That address can't be opened in the recorder.",
          );
        }
        await open(action.url);
        await page.mouse.move(mouse.x, mouse.y);
        if (!rec.onSlide) {
          rec.mark((await page.title()) || action.url);
          await glide(readingSpot());
        }
        break;
      case "wait":
        await sleep(Math.min(10, Math.max(0, action.seconds)) * 1000);
        break;
      case "show_slide":
      case "hide_slide":
        break;
    }
    await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
    // A click that opened a new page leaves the pointer undrawn until it next moves.
    await page.mouse.move(mouse.x, mouse.y);
    await sleep(SETTLE_MS);
  }

  return {
    slug: rec.slug,
    maxDurationMs: rec.maxDurationMs,
    chapters: rec.chapters,
    get elapsedSeconds() {
      return rec.elapsedSeconds;
    },
    async look() {
      rec.live();
      const [image, outline] = await Promise.all([
        (rec.onSlide && rec.slidePage ? rec.slidePage : page).screenshot({
          type: "jpeg",
          quality: 70,
        }),
        page
          .locator("body")
          .ariaSnapshot({ timeout: 5000 })
          .catch(() => ""),
      ]);
      return {
        url: page.url(),
        title: await page.title(),
        onSlide: rec.onSlide,
        image: image.toString("base64"),
        outline: outline.slice(0, OUTLINE_CHARS),
      };
    },
    act,
    rebuild,
    async play(pcm: Int16Array) {
      rec.live();
      await rec.play(pcm);
    },
    stop: rec.stop,
    cancel: rec.cancel,
  };
}
