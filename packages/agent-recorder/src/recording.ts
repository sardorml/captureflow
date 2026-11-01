import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { finished } from "node:stream/promises";
import {
  startRecordingUpload,
  type RecordingUpload,
} from "@captureflow/engine/media";
import type { BrowserContext, Page } from "playwright";
import { fitBitrate, nearBudget } from "./budget";
import {
  pageFeed,
  startCapture,
  type Capture,
  type FrameFeed,
} from "./capture";
import { renderSlide, type Slide } from "./slide";
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
  slides: BrowserContext;
  pauseBetweenActions: boolean;
  bitrate: number;
  ffmpegPath?: string;
  close(): Promise<void>;
};

export type Chapter = { ms: number; title: string };

type EndReason = "agent" | "idle" | "length" | "size";

const STOP_REASONS = {
  idle: "no action for a while",
  length: "it reached its length limit",
  size: "it reached its plan's size limit",
};
const SETTLE_MS = 600;
// Long enough for the slide's staggered entrance to finish on camera.
const SLIDE_IN_MS = 1200;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  await recorded(() => sleep(1000));

  let narrated = false;
  let ended: Promise<{ url: string; durationSeconds: number }> | null = null;
  let endedBy: EndReason | null = null;
  let idleTimer: NodeJS.Timeout | null = null;
  const lengthTimer = setTimeout(() => void finish("length"), maxDurationMs);
  const touch = () => {
    if (opts.idleMs === null) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => void finish("idle"), opts.idleMs);
  };
  touch();

  function finish(by: EndReason) {
    ended ??= (async () => {
      endedBy = by;
      clearTimeout(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      await capture.stop();
      const durationMs = capture.durationMs;
      const url = await sink.finish(capture, narrated);
      await opts.close().catch(() => {});
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
    async showSlide(slide: Slide) {
      slidePage ??= await opts.slides.newPage();
      await slidePage.setContent(renderSlide(slide), {
        waitUntil: "load",
        timeout: 15_000,
      });
      await slidePage.evaluate(() => document.fonts.ready).catch(() => {});
      await capture.show(pageFeed(slidePage, width, height));
      onSlide = true;
      await sleep(SLIDE_IN_MS);
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
    stop: () => finish("agent"),
    async cancel() {
      clearTimeout(lengthTimer);
      if (idleTimer) clearTimeout(idleTimer);
      await capture.stop().catch(() => {});
      sink.abort();
      await opts.close().catch(() => {});
    },
  };
}
