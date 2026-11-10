import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The bundle is dist/cli.mjs, so the skill sits one folder up in the package.
const SOURCE = fileURLToPath(
  new URL("../skills/captureflow/SKILL.md", import.meta.url),
);

export function skillDir(argv: string[], cwd = process.cwd()): string {
  const at = argv.indexOf("--dir");
  const custom = at >= 0 ? argv[at + 1] : undefined;
  if (custom) return resolve(cwd, custom, "captureflow");
  const root = argv.includes("--project") ? cwd : homedir();
  return join(root, ".claude", "skills", "captureflow");
}

export async function installSkill(argv: string[]): Promise<string> {
  const dir = skillDir(argv);
  await mkdir(dir, { recursive: true });
  const target = join(dir, "SKILL.md");
  await copyFile(SOURCE, target);
  return target;
}
