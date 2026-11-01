import type { Browser, BrowserContext, Locator, Page } from "playwright";
import { pageFeed } from "./capture";
import { CURSOR_SCRIPT } from "./cursor";
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
const MOUSE_STEPS = 24;
const TYPE_DELAY_MS = 45;
const SETTLE_MS = 600;
const OUTLINE_CHARS = 6000;

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

  async function moveTo(locator: Locator) {
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
    const box = await locator.boundingBox();
    if (!box) throw new SessionError("That element isn't on screen.");
    const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(to.x, to.y, { steps: MOUSE_STEPS });
    mouse = to;
  }

  async function act(action: Action) {
    rec.live();
    if (action.type === "show_slide") {
      rec.mark(action.slide.title);
      return rec.recorded(() => rec.showSlide(action.slide));
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
        await page.keyboard.type(action.text, { delay: TYPE_DELAY_MS });
        if (action.submit) await page.keyboard.press("Enter");
        break;
      }
      case "press":
        await page.keyboard.press(action.key);
        break;
      case "scroll": {
        const total = (action.amount ?? 0.8) * height;
        const sign = action.direction === "up" ? -1 : 1;
        for (let i = 0; i < 20; i++) {
          await page.mouse.wheel(0, (sign * total) / 20);
          await sleep(25);
        }
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
        if (!rec.onSlide) rec.mark((await page.title()) || action.url);
        break;
      case "wait":
        await sleep(Math.min(10, Math.max(0, action.seconds)) * 1000);
        break;
      case "show_slide":
      case "hide_slide":
        break;
    }
    await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
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
