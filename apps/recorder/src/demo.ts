import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SessionError, type Session } from "@captureflow/agent-recorder";

const END_CARD = {
  layout: "end_card" as const,
  title: "Record your screen. Share a link.",
  subtitle: "Screen recordings and agent-made videos, open source",
  cta: "captureflow.dev",
  logo: true,
};
const END_CARD_SECONDS = 2.5;
// Someone is waiting on this one, and every second of build is drawn a frame
// at a time: a dozen screens of the page, under a minute.
const DEMO_BUILD = { screens: 12, maxSeconds: 45 };

let music: Promise<string | null> | null = null;

const seconds = (from: number, to: number) => Math.round((to - from) / 1000);

// The track set with RECORDER_MUSIC: a path, or an address fetched once per container.
function resolveMusic(): Promise<string | null> {
  music ??= (async () => {
    const source = process.env.RECORDER_MUSIC;
    if (!source) return null;
    if (!/^https?:/.test(source)) return source;
    const res = await fetch(source);
    if (!res.ok) throw new Error(`music ${source}: ${res.status}`);
    const dir = join(tmpdir(), "cf-demo-music");
    await mkdir(dir, { recursive: true });
    const file = join(dir, "track");
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    return file;
  })();
  music.catch(() => (music = null));
  return music;
}

/*
 * The whole swarm demo on a started presentation: the page is rebuilt with
 * the preset, the end card shown, and the recording stopped and uploaded.
 * Anything that fails cancels the recording so nothing half-made is kept.
 */
export async function runDemo(
  session: Session,
  url: string,
): Promise<{ url: string; durationSeconds: number | null }> {
  try {
    const track = await resolveMusic().catch((err) => {
      console.warn("[recorder] music unavailable", err);
      return null;
    });
    const startedAt = Date.now();
    const built = await session.rebuild({ url, music: track, ...DEMO_BUILD });
    const builtAt = Date.now();
    await session.act({ type: "show_slide", slide: END_CARD });
    await session.act({ type: "wait", seconds: END_CARD_SECONDS });
    const result = await session.stop();
    console.log(
      `[recorder] demo ${new URL(url).host}: built in ${seconds(startedAt, builtAt)}s (prepared ${seconds(0, built.prepareMs)}s, drawn ${seconds(0, built.drawMs)}s), done in ${seconds(startedAt, Date.now())}s`,
    );
    return result;
  } catch (err) {
    await session.cancel().catch(() => {});
    if (err instanceof SessionError) throw err;
    console.error("[recorder] demo failed", err);
    throw new SessionError("The demo couldn't be made.");
  }
}
