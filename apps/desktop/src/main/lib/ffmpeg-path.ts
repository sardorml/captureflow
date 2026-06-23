import { existsSync } from "fs";
import { resolve } from "path";
import { app } from "electron";

let cached: string;

export function getFfmpegPath(): string {
  if (cached) return cached;

  if (app.isPackaged) {
    // ffmpeg-static is in `asarUnpack`; resourcesPath has no `app.asar` segment to replace.
    cached = resolve(
      process.resourcesPath,
      "app.asar.unpacked",
      "node_modules",
      "ffmpeg-static",
      "ffmpeg",
    );
    return cached;
  }

  const candidates = [
    resolve(__dirname, "../../node_modules/ffmpeg-static/ffmpeg"),
    resolve(__dirname, "../../../../node_modules/ffmpeg-static/ffmpeg"),
    resolve(__dirname, "../../../../../node_modules/ffmpeg-static/ffmpeg"),
  ];

  cached = candidates.find(existsSync) ?? "ffmpeg";
  return cached;
}
