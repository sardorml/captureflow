import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { configDir } from "./config";

export const run = promisify(execFile);

const installing = new Map<string, Promise<string>>();

/*
 * The big optional pieces (ffmpeg, the Kokoro voice model's runtime) install
 * on first use into the config folder, so `npx` stays a quick download and a
 * machine that never needs them never fetches them.
 */
export function ensurePackage(name: string, version: string): Promise<string> {
  const dir = join(
    configDir(),
    "runtime",
    `${name.replace("/", "+")}@${version}`,
  );
  const entry = join(dir, "node_modules", name, "package.json");
  if (existsSync(entry)) return Promise.resolve(dir);
  let job = installing.get(dir);
  if (!job) {
    job = (async () => {
      await mkdir(dir, { recursive: true });
      await new Promise<void>((resolve, reject) => {
        const npm = spawn(
          process.platform === "win32" ? "npm.cmd" : "npm",
          [
            "install",
            "--no-save",
            "--no-audit",
            "--no-fund",
            "--prefix",
            dir,
            `${name}@${version}`,
          ],
          {
            stdio: ["ignore", "ignore", "pipe"],
            shell: process.platform === "win32",
          },
        );
        let stderr = "";
        npm.stderr.on(
          "data",
          (c: Buffer) => (stderr = (stderr + c).slice(-2000)),
        );
        npm.on("error", reject);
        npm.on("close", (code) =>
          code === 0
            ? resolve()
            : reject(new Error(`npm install ${name} failed: ${stderr}`)),
        );
      });
      return dir;
    })();
    installing.set(dir, job);
    job.catch(() => installing.delete(dir));
  }
  return job;
}

export async function importInstalled<T>(
  dir: string,
  name: string,
): Promise<T> {
  const resolved = createRequire(join(dir, "package.json")).resolve(name);
  return (await import(pathToFileURL(resolved).href)) as T;
}

let ffmpeg: Promise<string> | null = null;

// The ffmpeg on PATH when there is one (it usually has the screen devices), else a static build.
export function resolveFfmpeg(override: string | null): Promise<string> {
  if (override) return Promise.resolve(override);
  ffmpeg ??= (async () => {
    try {
      await run("ffmpeg", ["-hide_banner", "-version"]);
      return "ffmpeg";
    } catch {
      const dir = await ensurePackage("ffmpeg-static", "5.3.0");
      const mod = await importInstalled<{ default: string | null }>(
        dir,
        "ffmpeg-static",
      );
      if (!mod.default) throw new Error("No ffmpeg build for this platform.");
      return mod.default;
    }
  })();
  ffmpeg.catch(() => (ffmpeg = null));
  return ffmpeg;
}
