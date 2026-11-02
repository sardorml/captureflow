import { spawn } from "node:child_process";
import { CHANNELS, SAMPLE_RATE } from "./pacing";

// Any audio ffmpeg reads (the narration arrives as MP3) into the mixer's PCM.
export function decodeAudio(
  bytes: Uint8Array,
  ffmpegPath = "ffmpeg",
): Promise<Int16Array> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      ...["-hide_banner", "-loglevel", "error", "-i", "pipe:0"],
      ...["-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", String(CHANNELS)],
      "pipe:1",
    ]);
    const chunks: Buffer[] = [];
    let stderr = "";
    ffmpeg.stdout.on("data", (c: Buffer) => chunks.push(c));
    ffmpeg.stderr.on("data", (c: Buffer) => (stderr += c.toString()));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code !== 0)
        return reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
      // Copied so the samples start at an even offset, as Int16Array needs.
      const pcm = Uint8Array.from(Buffer.concat(chunks));
      resolve(new Int16Array(pcm.buffer, 0, Math.floor(pcm.byteLength / 2)));
    });
    ffmpeg.stdin.on("error", () => {});
    ffmpeg.stdin.end(bytes);
  });
}
