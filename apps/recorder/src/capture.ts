import { spawn } from "node:child_process";
import type { Writable } from "node:stream";
import type { CDPSession, Page } from "playwright";
import {
  CHANNELS,
  createAudioMixer,
  createPacer,
  FPS,
  SAMPLE_RATE,
} from "./pacing";

export type Capture = {
  readonly durationMs: number;
  play(pcm: Int16Array): Promise<void>;
  readonly audio: Uint8Array;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
};

export type CaptureOptions = {
  page: Page;
  width: number;
  height: number;
  bitrate: number;
  onData(bytes: Uint8Array): void;
  ffmpegPath?: string;
};

const TICK_MS = 20;

function write(stream: Writable, chunk: Buffer): void {
  if (!stream.destroyed && stream.writable) stream.write(chunk);
}

/*
 * Records a page the way a screen recorder would: Chrome's screencast hands
 * over a JPEG whenever the page repaints, and the pacer turns that into a
 * steady 30 fps beside the audio mixer's track. ffmpeg encodes both into the
 * same fragmented MP4 the other recorders upload, written as it goes.
 */
// `audio` is the track alone as Opus WebM, the format the server transcribes; complete once stopped.
export async function startCapture(opts: CaptureOptions): Promise<Capture> {
  const { page, width, height } = opts;
  const cdp: CDPSession = await page.context().newCDPSession(page);
  let frame: Buffer | null = null;
  cdp.on("Page.screencastFrame", (event) => {
    frame = Buffer.from(event.data, "base64");
    void cdp
      .send("Page.screencastFrameAck", { sessionId: event.sessionId })
      .catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 85,
    maxWidth: width,
    maxHeight: height,
    everyNthFrame: 1,
  });
  // A still page paints once; this is the frame the first ticks repeat.
  const first = await page.screenshot({ type: "jpeg", quality: 85 });
  frame ??= first;

  const kbps = Math.round(opts.bitrate / 1000);
  const ffmpeg = spawn(
    opts.ffmpegPath ?? "ffmpeg",
    [
      ...["-hide_banner", "-loglevel", "error"],
      ...["-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS)],
      ...["-i", "pipe:0"],
      ...["-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", String(CHANNELS)],
      ...["-i", "pipe:3"],
      ...["-vf", `scale=${width}:${height}:flags=lanczos,format=yuv420p`],
      ...["-c:v", "libx264", "-preset", "veryfast", "-profile:v", "high"],
      ...["-b:v", `${kbps}k`, "-maxrate", `${kbps * 2}k`],
      ...["-bufsize", `${kbps * 2}k`, "-g", String(FPS * 2)],
      ...["-c:a", "aac", "-b:a", "128k"],
      ...[
        "-f",
        "mp4",
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof",
      ],
      "pipe:1",
    ],
    { stdio: ["pipe", "pipe", "pipe", "pipe"] },
  );
  const video = ffmpeg.stdin!;
  const audio = ffmpeg.stdio[3] as Writable;
  ffmpeg.stdout!.on("data", (chunk: Buffer) => opts.onData(chunk));
  let stderr = "";
  ffmpeg.stderr!.on("data", (chunk: Buffer) => {
    stderr = (stderr + chunk.toString()).slice(-2000);
  });
  const exited = new Promise<number>((resolve) =>
    ffmpeg.on("close", (code) => resolve(code ?? 1)),
  );

  const opus = spawn(
    opts.ffmpegPath ?? "ffmpeg",
    [
      ...["-hide_banner", "-loglevel", "error"],
      ...["-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", String(CHANNELS)],
      ...["-i", "pipe:0", "-ac", "1", "-c:a", "libopus", "-b:a", "32k"],
      ...["-f", "webm", "pipe:1"],
    ],
    { stdio: ["pipe", "pipe", "ignore"] },
  );
  const opusChunks: Buffer[] = [];
  opus.stdout!.on("data", (chunk: Buffer) => opusChunks.push(chunk));
  const opusExited = new Promise<void>((resolve) =>
    opus.on("close", () => resolve()),
  );

  const mixer = createAudioMixer();
  const pacer = createPacer(Date.now());
  const feed = () => {
    const { frames, samples } = pacer.due(Date.now());
    for (let i = 0; i < frames && frame; i++) write(video, frame);
    if (samples > 0) {
      const pcm = mixer.take(samples);
      write(audio, pcm);
      write(opus.stdin!, pcm);
    }
  };
  const timer = setInterval(feed, TICK_MS);

  let stopping: Promise<void> | null = null;
  return {
    get durationMs() {
      return pacer.durationMs;
    },
    play: (pcm) => mixer.play(pcm),
    get audio() {
      return new Uint8Array(Buffer.concat(opusChunks));
    },
    pause() {
      feed();
      pacer.pause(Date.now());
    },
    resume: () => pacer.resume(Date.now()),
    stop() {
      stopping ??= (async () => {
        clearInterval(timer);
        feed();
        await cdp.send("Page.stopScreencast").catch(() => {});
        await cdp.detach().catch(() => {});
        video.end();
        audio.end();
        opus.stdin!.end();
        const [code] = await Promise.all([exited, opusExited]);
        if (code !== 0) throw new Error(`ffmpeg exited ${code}: ${stderr}`);
      })();
      return stopping;
    },
  };
}
