import type { Browser } from "playwright";
import {
  openRecording,
  SessionError,
  type Action,
  type RecordingOutput,
} from "@captureflow/agent-recorder";
import { grabArgs, grabContext, screenFeed, type ScreenTarget } from "./screen";

export type ScreenRequest = {
  target: ScreenTarget;
  label: string;
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  output: RecordingOutput;
  maxDurationMs: number;
  width: number;
  height: number;
  ffmpeg: string;
};

const BITRATE = 6_000_000;

export type ScreenSession = Awaited<ReturnType<typeof startScreenSession>>;

/*
 * Records a display or one app's window as it is. What happens on screen
 * comes from the agent's own tools (a shell, osascript, the app itself), so
 * the recording runs straight through instead of pausing between calls, and
 * only slides, waits and narration are acted out here.
 */
export async function startScreenSession(
  slidesBrowser: Browser,
  req: ScreenRequest,
) {
  const { width, height } = req;
  const ctx = await grabContext(req.ffmpeg, req.target.display);
  const feed = screenFeed(
    req.ffmpeg,
    grabArgs(process.platform, req.target, width, height, ctx),
  );
  const slides = await slidesBrowser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-US",
  });
  const rec = await openRecording({
    title: req.title || req.label,
    visibility: req.visibility,
    workspaceId: req.workspaceId,
    width,
    height,
    maxDurationMs: req.maxDurationMs,
    idleMs: null,
    output: req.output,
    feed,
    slides,
    pauseBetweenActions: false,
    bitrate: BITRATE,
    ffmpegPath: req.ffmpeg,
    close: () => slides.close(),
  }).catch(async (err) => {
    await slides.close().catch(() => {});
    throw err;
  });
  rec.mark(req.label);

  return {
    slug: rec.slug,
    maxDurationMs: rec.maxDurationMs,
    chapters: rec.chapters,
    get elapsedSeconds() {
      return rec.elapsedSeconds;
    },
    look() {
      rec.live();
      return {
        recording: req.label,
        onSlide: rec.onSlide,
        image: rec.capture.frame.toString("base64"),
      };
    },
    async act(action: Action) {
      rec.live();
      switch (action.type) {
        case "show_slide":
          rec.mark(action.slide.title);
          return rec.showSlide(action.slide);
        case "hide_slide":
          return rec.hideSlide(feed);
        case "wait":
          return new Promise<void>((r) =>
            setTimeout(r, Math.min(10, Math.max(0, action.seconds)) * 1000),
          );
        default:
          throw new SessionError(
            "A screen recording films whatever happens on screen; it doesn't click or type. Do that with your own tools (run the command, open the app), and narrate as you go.",
          );
      }
    },
    async play(pcm: Int16Array) {
      rec.live();
      await rec.play(pcm);
    },
    stop: rec.stop,
    cancel: rec.cancel,
  };
}
