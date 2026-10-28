import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

// Baked into NEXT_PUBLIC_* at image build time, swapped for APP_URL at boot.
export const ORIGIN_SENTINEL = "https://captureflow-selfhost-origin.invalid";

const TEXT_FILE = /\.(js|mjs|cjs|json|html|rsc|body|meta|txt|map)$/;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory()
      ? walk(full)
      : TEXT_FILE.test(entry.name)
        ? [full]
        : [];
  });
}

/*
 * Next inlines NEXT_PUBLIC_* into both server and client chunks at build, so
 * a prebuilt image can't learn its own URL from the environment. The first
 * boot records which files carry the sentinel and keeps pristine copies;
 * every boot rewrites them from those copies, so changing APP_URL later works.
 */
export function applyPublicOrigin(nextDir: string, origin: string): number {
  const pristineDir = join(nextDir, "..", ".selfhost-pristine");
  const manifestPath = join(pristineDir, "files.json");
  let files: string[];
  if (existsSync(manifestPath)) {
    files = JSON.parse(readFileSync(manifestPath, "utf8")) as string[];
  } else {
    files = walk(nextDir)
      .filter((file) => readFileSync(file, "utf8").includes(ORIGIN_SENTINEL))
      .map((file) => relative(nextDir, file));
    for (const file of files) {
      const copy = join(pristineDir, file);
      mkdirSync(dirname(copy), { recursive: true });
      copyFileSync(join(nextDir, file), copy);
    }
    mkdirSync(pristineDir, { recursive: true });
    writeFileSync(manifestPath, JSON.stringify(files));
  }
  for (const file of files) {
    const pristine = readFileSync(join(pristineDir, file), "utf8");
    writeFileSync(
      join(nextDir, file),
      pristine.replaceAll(ORIGIN_SENTINEL, origin),
    );
  }
  return files.length;
}
