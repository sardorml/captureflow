import {
  startRecordingUpload,
  type RecordingUpload,
} from "@captureflow/engine/media";
import type { Browser, BrowserContext, Locator, Page } from "playwright";
import { startCapture, type Capture } from "./capture";
import { CURSOR_SCRIPT } from "./cursor";
import { isAllowedUrl } from "./guard";
import {
  createTransport,
  openTempFiles,
  type AgentInitRequest,
  type UploadCredentials,
} from "./upload";

export type StartRequest = {
  url: string;
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  width?: number;
  height?: number;
  maxDurationMs: number;
  idleMs: number;
  upload: UploadCredentials;
};

export type Target = { text?: string; selector?: string };

export type Action =
  | { type: "click"; target: Target }
  | { type: "type"; text: string; target?: Target; submit?: boolean }
  | { type: "press"; key: string }
  | { type: "scroll"; direction: "down" | "up"; amount?: number }
  | { type: "navigate"; url: string }
  | { type: "wait"; seconds: number };

export class SessionError extends Error {}

const BITRATE = 4_000_000;
const MOUSE_STEPS = 24;
const TYPE_DELAY_MS = 45;
const SETTLE_MS = 600;
const OUTLINE_CHARS = 6000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Session = Awaited<ReturnType<typeof startSession>>;

export async function startSession(browser: Browser, req: StartRequest) {
  if (!(await isAllowedUrl(req.url))) {
    throw new SessionError("That address can't be opened in the recorder.");
  }
  const width = req.width ?? 1920;
  const height = req.height ?? 1080;
  const context: BrowserContext = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  await context.addInitScript(CURSOR_SCRIPT);
  await context.route("**/*", async (route) => {
    if (await isAllowedUrl(route.request().url())) await route.continue();
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

  const init: AgentInitRequest = {
    contentType: "video/mp4",
    source: "instant",
    preset: "recording",
    client: "agent",
    hasWebcam: false,
    title: req.title || (await page.title()) || undefined,
    visibility: req.visibility,
    workspaceId: req.workspaceId,
  };
  const transport = createTransport(req.upload);
  const upload: RecordingUpload = await startRecordingUpload(init, {
    transport,
    openFiles: () => openTempFiles(),
  });
  const maxDurationMs = Math.min(
    req.maxDurationMs,
    upload.maxDurationMs ?? Infinity,
  );
  const capture: Capture = await startCapture({
    page,
    width,
    height,
    bitrate: BITRATE,
    onData: (bytes) => upload.pushScreen(bytes),
  });

  // Only actions and narration are recorded; the agent's thinking between calls is left out.
  let busy = 0;
  async function recorded<T>(work: () => Promise<T>): Promise<T> {
    busy++;
    capture.resume();
    try {
      return await work();
    } finally {
      if (--busy === 0) capture.pause();
    }
  }
  await recorded(() => sleep(1000));

  let narrated = false;
  // A failed transcript leaves the recording without one; it never fails the recording.
  async function requestTranscript(durationMs: number) {
    try {
      await transport.uploadAudioPart(upload.slug, 1, capture.audio);
      await transport.transcribe({
        slug: upload.slug,
        language: "en",
        parts: [{ partNumber: 1, startMs: 0, endMs: durationMs }],
      });
    } catch (err) {
      console.warn("[recorder] transcript request failed", err);
    }
  }

  let ended: Promise<{ url: string; durationSeconds: number }> | null = null;
  let endedBy: "agent" | "idle" | "length" | null = null;
  let idleTimer: NodeJS.Timeout | null = null;
  const lengthTimer = setTimeout(() => void finish("length"), maxDurationMs);
  const touch = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => void finish("idle"), req.idleMs);
  };
  touch();

  function finish(by: "agent" | "idle" | "length") {
    ended ??= (async () => {
      endedBy = by;
      clearTimeout(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      await capture.stop();
      const durationMs = capture.durationMs;
      if (narrated) await requestTranscript(durationMs);
      const { url } = await upload.finish(durationMs);
      await context.close().catch(() => {});
      return { url, durationSeconds: Math.round(durationMs / 1000) };
    })();
    return ended;
  }

  function live() {
    if (ended) {
      throw new SessionError(
        endedBy === "agent"
          ? "This recording already stopped."
          : `This recording stopped on its own (${endedBy === "idle" ? "no action for a while" : "it reached its length limit"}). Its link still works: call stop_recording to get it.`,
      );
    }
    touch();
  }

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
    live();
    await recorded(() => perform(action));
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
        if (!(await isAllowedUrl(action.url))) {
          throw new SessionError(
            "That address can't be opened in the recorder.",
          );
        }
        await page.goto(action.url, { waitUntil: "load", timeout: 30_000 });
        await page.mouse.move(mouse.x, mouse.y);
        break;
      case "wait":
        await sleep(Math.min(10, Math.max(0, action.seconds)) * 1000);
        break;
    }
    await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
    await sleep(SETTLE_MS);
  }

  return {
    slug: upload.slug,
    maxDurationMs,
    get elapsedSeconds() {
      return Math.round(capture.durationMs / 1000);
    },
    async look() {
      live();
      const [image, outline] = await Promise.all([
        page.screenshot({ type: "jpeg", quality: 70 }),
        page
          .locator("body")
          .ariaSnapshot({ timeout: 5000 })
          .catch(() => ""),
      ]);
      return {
        url: page.url(),
        title: await page.title(),
        image: image.toString("base64"),
        outline: outline.slice(0, OUTLINE_CHARS),
      };
    },
    act,
    async play(pcm: Int16Array) {
      live();
      narrated = true;
      await recorded(async () => {
        await capture.play(pcm);
        await sleep(SETTLE_MS);
      });
    },
    stop: () => finish("agent"),
    async cancel() {
      clearTimeout(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      await capture.stop().catch(() => {});
      upload.abort();
      await context.close().catch(() => {});
    },
  };
}
