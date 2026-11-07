import { spawn } from "node:child_process";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CHANNELS, SAMPLE_RATE } from "./pacing";
import { tempoAt, type TempoRamp } from "./tempo";

export type MusicTimeline = TempoRamp & { lengthMs: number };

const STEP_MS = 50;
const FADE_MS = 3000;

/*
 * The stretcher is told its speed at moments of the file, not of the
 * recording, so the recording's clock is walked in small steps and each
 * step's speed is pinned where that step begins in the file.
 */
export function musicTempoCommands(t: MusicTimeline): {
  commands: { at: number; tempo: number }[];
  sourceSeconds: number;
} {
  const commands: { at: number; tempo: number }[] = [];
  let source = 0;
  for (let ms = 0; ms < t.lengthMs; ms += STEP_MS) {
    const tempo = tempoAt(ms + STEP_MS / 2, t);
    commands.push({ at: source / 1000, tempo });
    source += STEP_MS * tempo;
  }
  return { commands, sourceSeconds: source / 1000 };
}

// The file, with its leading silence cut, stretched along the timeline, evened out and faded by its end, as the mixer's PCM.
export async function renderMusic(
  file: string,
  t: MusicTimeline,
  ffmpegPath = "ffmpeg",
): Promise<Int16Array> {
  await stat(file);
  const dir = await mkdtemp(join(tmpdir(), "cf-music-"));
  try {
    const tempo = musicTempoCommands(t);
    const commands = join(dir, "tempo.cmd");
    await writeFile(
      commands,
      tempo.commands
        .map((c) => `${c.at.toFixed(3)} atempo tempo ${c.tempo.toFixed(4)};`)
        .join("\n") + "\n",
    );
    const length = t.lengthMs / 1000;
    // Only as much of the file as the timeline plays is evened out and stretched; a long track costs no more than a short one.
    const filters = [
      "silenceremove=start_periods=1:start_threshold=-45dB",
      `atrim=duration=${(tempo.sourceSeconds + 1).toFixed(3)}`,
      "loudnorm=I=-20:TP=-2:LRA=11",
      `asendcmd=f=${commands.replace(/([\\:])/g, "\\$1")}`,
      "atempo=1",
      `atrim=duration=${length}`,
      `afade=t=out:st=${length - FADE_MS / 1000}:d=${FADE_MS / 1000}`,
      `aresample=${SAMPLE_RATE}`,
    ].join(",");
    const ffmpeg = spawn(
      ffmpegPath,
      [
        ...["-hide_banner", "-loglevel", "error", "-i", file],
        ...["-af", filters, "-f", "s16le"],
        ...["-ac", String(CHANNELS), "-ar", String(SAMPLE_RATE), "pipe:1"],
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const chunks: Buffer[] = [];
    let stderr = "";
    ffmpeg.stdout.on("data", (c: Buffer) => chunks.push(c));
    ffmpeg.stderr.on("data", (c: Buffer) => (stderr += c.toString()));
    const code = await new Promise<number | null>((resolve) =>
      ffmpeg.on("close", resolve),
    );
    if (code !== 0) throw new Error(`ffmpeg exited ${code}: ${stderr.trim()}`);
    const bytes = Buffer.concat(chunks);
    const pcm = new Int16Array(bytes.byteLength >> 1);
    new Uint8Array(pcm.buffer).set(bytes.subarray(0, pcm.byteLength));
    return pcm;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
