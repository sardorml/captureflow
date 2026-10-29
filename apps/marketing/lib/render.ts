import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Composition } from "./library.ts";
import { KIND_DIR, outputName } from "./media.ts";
import {
  HYPERFRAMES_BIN,
  HYPERFRAMES_DIR,
  LIBRARY_DIR,
  STUDIO_PORT,
} from "./paths.ts";

export type RenderResult =
  | { ok: true; file: string }
  | { ok: false; error: string };

function hyperframes(args: string[]): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(HYPERFRAMES_BIN, args, {
      cwd: HYPERFRAMES_DIR,
      env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" },
    });
    let output = "";
    const collect = (chunk: Buffer) => {
      output = (output + chunk.toString()).slice(-8000);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.on("error", (err) => resolve({ ok: false, output: err.message }));
    child.on("close", (code) => resolve({ ok: code === 0, output }));
  });
}

function failure(output: string): RenderResult {
  const lines = output.trim().split("\n").filter(Boolean);
  return { ok: false, error: lines.slice(-6).join("\n") || "Render failed" };
}

export async function renderComposition(c: Composition): Promise<RenderResult> {
  const dir = path.join(LIBRARY_DIR, KIND_DIR[c.kind]);
  await mkdir(dir, { recursive: true });
  const name = outputName(c.kind, c.slug, new Date());
  const out = path.join(dir, name);
  const source = c.source === "index.html" ? [] : ["-c", c.source];

  if (c.kind === "image") {
    // A 1 fps png-sequence of a 1-second composition is exactly one frame.
    const frames = await mkdtemp(path.join(tmpdir(), `cf-image-${c.slug}-`));
    try {
      const run = await hyperframes([
        "render",
        ...source,
        "--format",
        "png-sequence",
        "--fps",
        "1",
        "-o",
        frames,
        "--quiet",
      ]);
      const [first] = (await readdir(frames))
        .filter((f) => f.endsWith(".png"))
        .sort();
      if (!run.ok || !first) return failure(run.output);
      await rename(path.join(frames, first), out);
    } finally {
      await rm(frames, { recursive: true, force: true });
    }
  } else {
    const format = c.kind === "gif" ? ["--format", "gif"] : [];
    const run = await hyperframes([
      "render",
      ...source,
      ...format,
      "-o",
      out,
      "--quiet",
    ]);
    if (!run.ok) return failure(run.output);
  }

  return { ok: true, file: `${KIND_DIR[c.kind]}/${name}` };
}

export async function startStudio(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const run = await hyperframes([
    "preview",
    "--background",
    "--no-open",
    "--port",
    String(STUDIO_PORT),
  ]);
  if (!run.ok)
    return {
      ok: false,
      error: run.output.trim().split("\n").slice(-4).join("\n"),
    };
  return { ok: true, url: `http://localhost:${STUDIO_PORT}` };
}
