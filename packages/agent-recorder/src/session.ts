import type { Browser, BrowserContext, Locator, Page } from "playwright";
import { pageFeed } from "./capture";
import { CURSOR_SCRIPT, type CursorState } from "./cursor";
import { FPS } from "./pacing";
import { isAllowedUrl } from "./guard";
import { PAGE_AUDIO_BINDING, PAGE_AUDIO_SCRIPT } from "./page-audio";
import {
  openRecording,
  SessionError,
  sleep,
  type RecordingOutput,
} from "./recording";
import type { Slide } from "./slide";

export type StartRequest = {
  url: string;
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  width?: number;
  height?: number;
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

const BITRATE = 4_000_000;
const TYPE_DELAY_MS = 45;
const SETTLE_MS = 600;
const OUTLINE_CHARS = 6000;
const FRAME_MS = 16;
const MOUSE_MS = { min: 450, max: 900, perPx: 0.8 };
const SCROLL_DRIFT_MS = 800;
const KEY_SHOWN_MS = 500;

type Point = { x: number; y: number };

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
  if (!(await allowUrl(req.url))) {
    throw new SessionError("That address can't be opened in the recorder.");
  }
  const width = req.width ?? 1920;
  const height = req.height ?? 1080;
  const context: BrowserContext = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
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

  try {
    await page.goto(req.url, { waitUntil: "load", timeout: 30_000 });
  } catch (err) {
    await context.close();
    throw new SessionError(`The page didn't load: ${(err as Error).message}`);
  }
  await page.mouse.move(mouse.x, mouse.y);
  await sleep(SETTLE_MS);

  const pageTitle = await page.title();
  const rec = await openRecording({
    title: req.title || pageTitle || undefined,
    visibility: req.visibility,
    workspaceId: req.workspaceId,
    width,
    height,
    maxDurationMs: req.maxDurationMs,
    idleMs: req.idleMs,
    output: req.output,
    feed: pageFeed(page, width, height),
    slides: context,
    pauseBetweenActions: true,
    bitrate: BITRATE,
    ffmpegPath: opts.ffmpegPath,
    close: () => context.close(),
  });
  rec.mark(pageTitle || new URL(page.url()).host);
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
  ) {
    const frames = Math.max(1, Math.round((durationMs / 1000) * FPS));
    if (rec.onSlide) return draw(1);
    const cdp = await context.newCDPSession(page);
    rec.capture.pause();
    try {
      for (let i = 1; i <= frames; i++) {
        await draw(easeInOut(i / frames));
        const { data } = await cdp.send("Page.captureScreenshot", {
          format: "jpeg",
          quality: 85,
          optimizeForSpeed: true,
        });
        rec.capture.step(Buffer.from(data, "base64"));
      }
    } finally {
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

  async function act(action: Action) {
    rec.live();
    if (action.type === "show_slide") {
      rec.mark(action.slide.title);
      return rec.showSlide(action.slide);
    }
    if (action.type === "hide_slide") {
      return rec.recorded(() => rec.hideSlide(pageFeed(page, width, height)));
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
        await page.goto(action.url, { waitUntil: "load", timeout: 30_000 });
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
    async play(pcm: Int16Array) {
      rec.live();
      await rec.play(pcm);
    },
    stop: rec.stop,
    cancel: rec.cancel,
  };
}
