import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/*
 * Secrets the operator didn't set are generated once and kept in
 * <dataDir>/secrets.json, so a fresh `docker compose up` works and sessions
 * survive restarts. A value in the environment always wins.
 */
export function ensureSecrets(
  dataDir: string,
  names: string[],
  env: NodeJS.ProcessEnv = process.env,
): { values: Record<string, string>; generated: string[] } {
  const path = join(dataDir, "secrets.json");
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
  } catch {
    stored = {};
  }
  const values: Record<string, string> = {};
  const generated: string[] = [];
  for (const name of names) {
    const fromEnv = env[name];
    if (fromEnv) {
      values[name] = fromEnv;
      continue;
    }
    if (!stored[name]) {
      stored[name] = randomBytes(32).toString("base64url");
      generated.push(name);
    }
    values[name] = stored[name];
  }
  if (generated.length > 0) {
    writeFileSync(path, JSON.stringify(stored, null, 2), { mode: 0o600 });
  }
  return { values, generated };
}
