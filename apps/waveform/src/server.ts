import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createPeakCollector, WAVEFORM_BUCKETS } from "./peaks.ts";

const PORT = Number(process.env.PORT ?? 8080);
// Voices survive this rate, and it keeps a long recording's samples small.
const SAMPLE_RATE = 8000;
const TIMEOUT_MS = 15 * 60 * 1000;
const INPUT = ["-protocol_whitelist", "http,https,tcp,tls"];

function hasAudio(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const probe = spawn(
      "ffprobe",
      [
        ...["-hide_banner", "-loglevel", "error", ...INPUT],
        ...["-select_streams", "a", "-show_entries", "stream=index"],
        ...["-of", "csv=p=0", url],
      ],
      { timeout: TIMEOUT_MS, stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    probe.stdout.on("data", (c: Buffer) => (out += c.toString()));
    probe.stderr.on("data", (c: Buffer) => (err += c.toString()));
    probe.on("error", reject);
    probe.on("close", (code) =>
      code === 0
        ? resolve(out.trim().length > 0)
        : reject(new Error(`ffprobe exited ${code}: ${err}`)),
    );
  });
}

function decodePeaks(url: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        ...["-hide_banner", "-loglevel", "error", ...INPUT, "-i", url],
        ...["-map", "0:a:0", "-ac", "1", "-ar", String(SAMPLE_RATE)],
        ...["-f", "f32le", "pipe:1"],
      ],
      { timeout: TIMEOUT_MS, stdio: ["ignore", "pipe", "pipe"] },
    );
    const collector = createPeakCollector();
    let err = "";
    ffmpeg.stdout.on("data", collector.add);
    ffmpeg.stderr.on("data", (c: Buffer) => (err += c.toString()));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0
        ? resolve(collector.finish())
        : reject(new Error(`ffmpeg exited ${code}: ${err}`)),
    );
  });
}

// No auth: containers take traffic only from the Worker that owns them.
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://waveform");
  const send = (status: number, value: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(value));
  };
  if (url.pathname === "/ping") return send(200, { ok: true });
  const media = url.searchParams.get("url");
  if (url.pathname !== "/peaks" || !media || !/^https?:\/\//.test(media)) {
    return send(400, { error: "bad_request" });
  }
  try {
    const peaks = (await hasAudio(media))
      ? await decodePeaks(media)
      : new Float32Array(WAVEFORM_BUCKETS);
    res.writeHead(200, { "content-type": "application/octet-stream" });
    res.end(Buffer.from(peaks.buffer));
  } catch (err) {
    console.error("[waveform]", err);
    send(502, { error: "unreadable" });
  }
}).listen(PORT, () => console.log(`[waveform] listening on ${PORT}`));

process.on("SIGTERM", () => {
  server.close();
  process.exit(0);
});
