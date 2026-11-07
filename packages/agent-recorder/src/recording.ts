import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { finished } from "node:stream/promises";
import {
  startRecordingUpload,
  type RecordingUpload,
} from "@captureflow/engine/media";
import type { Browser, BrowserContext, Page } from "playwright";
import { fitBitrate, nearBudget } from "./budget";
import { jpegSize } from "./jpeg";
import {
  pageFeed,
  startCapture,
  type Capture,
  type FrameFeed,
} from "./capture";
import { FPS } from "./pacing";
import { slideLayer, slideShell, type Slide } from "./slide";
import {
  createTransport,
  openTempFiles,
  type AgentInitRequest,
  type UploadCredentials,
} from "./upload";

export class SessionError extends Error {}

export type CaptureSource = "tab" | "window" | "screen";

export type RecordingOutput =
  | {
      kind: "upload";
      credentials: UploadCredentials;
      captureSource?: CaptureSource;
    }
  | { kind: "file"; path: string };

export type OpenRecordingOptions = {
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  width: number;
  height: number;
  maxDurationMs: number;
  idleMs: number | null;
  output: RecordingOutput;
  feed: FrameFeed;
  slides: () => Promise<Page>;
  pauseBetweenActions: boolean;
  bitrate: number;
  leadInMs?: number;
  ffmpegPath?: string;
  close(): Promise<void>;
};

// A page gets a moment on camera before the first action; a bare stage has nothing to show yet.
const LEAD_IN_MS = 1000;

export type Chapter = { ms: number; title: string };

type EndReason = "agent" | "idle" | "length" | "size";

const STOP_REASONS = {
  idle: "no action for a while",
  length: "it reached its length limit",
  size: "it reached its plan's size limit",
};
const SETTLE_MS = 600;
const LENGTH_CHECK_MS = 250;
const SLIDE_HOLD_MS = 300;
const FONTS_WAIT_MS = 8_000;
const MUSIC_FADE_MS = 1_200;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/*
 * Slides get a window of their own. Headless Chrome with a window frame
 * stops repainting a tab once another tab opens beside it, so screenshots
 * of the page would go stale after the first slide; a second window keeps
 * both pages live.
 */
export function slideWindow(
  browser: Browser,
  width: number,
  height: number,
): () => Promise<Page> {
  return async () => {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: "light",
      locale: "en-US",
    });
    return context.newPage();
  };
}

/*
 * That window frame also leaves the page short of the viewport it reports,
 * so every frame of it would be stretched to fit. The window is grown by
 * what the picture is missing; a browser without a frame is left alone.
 */
export async function fitWindow(
  context: BrowserContext,
  width: number,
  height: number,
) {
  let short = { width: 0, height: 0 };
  for (const page of context.pages()) {
    const cdp = await context.newCDPSession(page).catch(() => null);
    if (!cdp) continue;
    try {
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 30,
        optimizeForSpeed: true,
      });
      const size = jpegSize(Buffer.from(data, "base64"));
      if (!size) continue;
      // The picture is in the window's own pixels, which the page's width gives the scale of; the frame only ever takes height.
      const scale = size.width / width;
      short = {
        width: Math.max(short.width, width - Math.round(size.width / scale)),
        height: Math.max(
          short.height,
          height - Math.round(size.height / scale),
        ),
      };
      if (short.width || short.height) {
        const { windowId, bounds } = await cdp.send(
          "Browser.getWindowForTarget",
        );
        await cdp.send("Browser.setWindowBounds", {
          windowId,
          bounds: {
            width: (bounds.width ?? width) + short.width,
            height: (bounds.height ?? height) + short.height,
          },
        });
        return;
      }
    } catch {
      return;
    } finally {
      await cdp.detach().catch(() => {});
    }
  }
}

type Sink = {
  slug: string | null;
  maxDurationMs: number | null;
  remainingBytes: number | null;
  readonly bytes: number;
  push(bytes: Uint8Array): void;
  finish(capture: Capture, narrated: boolean): Promise<string>;
  abort(): void;
};

async function openUploadSink(
  opts: OpenRecordingOptions & { output: { kind: "upload" } },
): Promise<Sink> {
  const init: AgentInitRequest = {
    contentType: "video/mp4",
    source: "instant",
    preset: "recording",
    client: "agent",
    captureSource: opts.output.captureSource,
    hasWebcam: false,
    title: opts.title,
    visibility: opts.visibility,
    workspaceId: opts.workspaceId,
  };
  const transport = createTransport(opts.output.credentials);
  const upload: RecordingUpload = await startRecordingUpload(init, {
    transport,
    openFiles: () => openTempFiles(),
  });
  // A failed transcript leaves the recording without one; it never fails the recording.
  async function requestTranscript(capture: Capture) {
    try {
      await transport.uploadAudioPart(upload.slug, 1, capture.audio);
      await transport.transcribe({
        slug: upload.slug,
        language: "en",
        parts: [{ partNumber: 1, startMs: 0, endMs: capture.durationMs }],
      });
    } catch (err) {
      console.warn("[recorder] transcript request failed", err);
    }
  }
  return {
    slug: upload.slug,
    maxDurationMs: upload.maxDurationMs,
    remainingBytes: upload.remainingBytes,
    get bytes() {
      return upload.screenBytes;
    },
    push: (bytes) => upload.pushScreen(bytes),
    async finish(capture, narrated) {
      await transport
        .uploadPoster(upload.slug, capture.poster)
        .catch((err) => console.warn("[recorder] poster upload failed", err));
      if (narrated) await requestTranscript(capture);
      return (await upload.finish(capture.durationMs)).url;
    },
    abort: () => upload.abort(),
  };
}

async function openFileSink(path: string): Promise<Sink> {
  await mkdir(dirname(path), { recursive: true });
  const out = createWriteStream(path);
  let bytes = 0;
  return {
    slug: null,
    maxDurationMs: null,
    remainingBytes: null,
    get bytes() {
      return bytes;
    },
    push(chunk) {
      bytes += chunk.byteLength;
      out.write(chunk);
    },
    async finish(capture) {
      out.end();
      await finished(out);
      await writeFile(path.replace(/\.mp4$/, ".jpg"), capture.poster);
      return pathToFileURL(path).href;
    },
    abort() {
      out.destroy();
      void rm(path, { force: true });
    },
  };
}

export type Recording = Awaited<ReturnType<typeof openRecording>>;

/*
 * What every agent recording shares, whatever it shows: where the bytes go,
 * the capture, slides cut in over the picture, narration, the idle and length
 * stops, and the chapters a report starts from.
 */
export async function openRecording(opts: OpenRecordingOptions) {
  const { width, height } = opts;
  const sink =
    opts.output.kind === "upload"
      ? await openUploadSink({ ...opts, output: opts.output })
      : await openFileSink(opts.output.path);
  const maxDurationMs = Math.min(
    opts.maxDurationMs,
    sink.maxDurationMs ?? Infinity,
  );
  // A picture that never arrives (a screen the OS won't share) leaves no empty recording behind.
  const capture: Capture = await startCapture({
    feed: opts.feed,
    width,
    height,
    bitrate: fitBitrate(opts.bitrate, sink.remainingBytes, maxDurationMs),
    ffmpegPath: opts.ffmpegPath,
    onData: (bytes) => {
      sink.push(bytes);
      if (nearBudget(sink.bytes, sink.remainingBytes)) void finish("size");
    },
  }).catch((err) => {
    sink.abort();
    throw err;
  });

  let slidePage: Page | null = null;
  let onSlide = false;
  const chapters: Chapter[] = [];

  // Only actions and narration are recorded; the agent's thinking between calls is left out.
  let busy = 0;
  async function recorded<T>(work: () => Promise<T>): Promise<T> {
    if (!opts.pauseBetweenActions) return work();
    busy++;
    capture.resume();
    try {
      return await work();
    } finally {
      if (--busy === 0) capture.pause();
    }
  }
  await recorded(() => sleep(opts.leadInMs ?? LEAD_IN_MS));

  let narrated = false;
  let ended: Promise<{ url: string; durationSeconds: number }> | null = null;
  let endedBy: EndReason | null = null;
  let idleTimer: NodeJS.Timeout | null = null;
  // The cap is on recorded time: motion drawn a frame at a time can run slower than the clock.
  const lengthTimer = setInterval(() => {
    if (capture.durationMs >= maxDurationMs) void finish("length");
  }, LENGTH_CHECK_MS);
  // Idle is time with nothing running: a long action drawn frame by frame is not it.
  const touch = () => {
    if (opts.idleMs === null) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(
      () => (busy > 0 ? touch() : void finish("idle")),
      opts.idleMs,
    );
  };
  touch();

  async function close() {
    await slidePage
      ?.context()
      .close()
      .catch(() => {});
    await opts.close().catch(() => {});
  }

  function finish(by: EndReason) {
    ended ??= (async () => {
      endedBy = by;
      clearInterval(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      if (capture.hasMusic) {
        await recorded(async () => {
          capture.fadeMusic(MUSIC_FADE_MS);
          await sleep(MUSIC_FADE_MS);
        });
      }
      await capture.stop();
      const durationMs = capture.durationMs;
      const url = await sink.finish(capture, narrated);
      await close();
      return { url, durationSeconds: Math.round(durationMs / 1000) };
    })();
    return ended;
  }

  return {
    slug: sink.slug,
    maxDurationMs,
    capture,
    chapters,
    get onSlide() {
      return onSlide;
    },
    get slidePage() {
      return slidePage;
    },
    get elapsedSeconds() {
      return Math.round(capture.durationMs / 1000);
    },
    recorded,
    live() {
      if (ended) {
        throw new SessionError(
          endedBy === "agent"
            ? "This recording already stopped."
            : `This recording stopped on its own (${STOP_REASONS[endedBy!]}). Its link still works: call stop_recording to get it.`,
        );
      }
      touch();
    },
    mark(title: string) {
      const ms = chapters.length ? capture.durationMs : 0;
      const last = chapters.at(-1);
      // Two marks a moment apart are one scene; the later name says more.
      if (last && ms - last.ms < 2000) last.title = title;
      else chapters.push({ ms, title });
    },
    // A page hidden behind a slide is out of the picture, and out of the sound too.
    feedAudio(pcm: Int16Array) {
      if (!onSlide) capture.feed(pcm);
    },
    /*
     * The slide is laid over the last one off camera, with every animation
     * held at zero. Its entrance is then drawn a frame at a time off the
     * clock, like the cursor's motion, so the transition and the words
     * landing are smooth however slowly the page paints.
     */
    async showSlide(slide: Slide) {
      const page = (slidePage ??= await (async () => {
        const p = await opts.slides();
        await p.setContent(slideShell(), {
          waitUntil: "load",
          timeout: 15_000,
        });
        // A slide is short, so its text can't wait for a font that arrives mid-way.
        await Promise.race([
          p.evaluate("window.__cfFontsReady()").catch(() => {}),
          sleep(FONTS_WAIT_MS),
        ]);
        await fitWindow(p.context(), width, height);
        return p;
      })());
      const { html, entrance } = slideLayer(slide);
      const settleMs = (await page.evaluate(
        `window.__cfEnter(${JSON.stringify(html)}, ${JSON.stringify(entrance)}, ${!onSlide})`,
      )) as number;
      await page.evaluate("window.__cfImagesReady()").catch(() => {});
      await recorded(async () => {
        const cdp = await page.context().newCDPSession(page);
        // Paused before the cut, so the wait for the slide page's first frame isn't recorded.
        capture.pause();
        if (!onSlide) {
          await capture.show(pageFeed(page, width, height));
          onSlide = true;
        }
        try {
          const frames = Math.round((settleMs / 1000) * FPS);
          for (let i = 1; i <= frames; i++) {
            await page.evaluate(`window.__cfSeek(${(i * 1000) / FPS})`);
            const { data } = await cdp.send("Page.captureScreenshot", {
              format: "jpeg",
              quality: 85,
              optimizeForSpeed: true,
            });
            capture.step(Buffer.from(data, "base64"));
          }
        } finally {
          capture.resume();
          await cdp.detach().catch(() => {});
        }
        await page.evaluate("window.__cfSettle()").catch(() => {});
        await sleep(SLIDE_HOLD_MS);
      });
    },
    async hideSlide(back: FrameFeed) {
      if (!onSlide) return;
      await capture.show(back);
      onSlide = false;
      await sleep(SETTLE_MS);
    },
    async play(pcm: Int16Array) {
      narrated = true;
      await recorded(async () => {
        await capture.play(pcm);
        await sleep(SETTLE_MS);
      });
    },
    // A bed under everything from here on; it only moves while something is being recorded.
    music: (pcm: Int16Array) => capture.music(pcm),
    stop: () => finish("agent"),
    async cancel() {
      clearTimeout(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      await capture.stop().catch(() => {});
      sink.abort();
      await close();
    },
  };
}
