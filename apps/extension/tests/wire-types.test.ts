import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * Drift guard for the deliberately forked wire types (PLAN.md Decision 5): the
 * extension may not import from apps/web, so this compares the shared type
 * declarations textually. A mismatch means one side of the protocol changed —
 * update both files.
 */

const SHARED_TYPES = [
  "RecordingVisibility",
  "InitRequest",
  "InitResponse",
  "PartResponse",
  "FinalizeRequest",
  "FinalizeResponse",
  "AbortRequest",
  "RecordingApiError",
] as const;

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

function extractTypes(source: string): Map<string, string> {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  const types = new Map<string, string>();
  const re = /export type (\w+) =/g;
  for (let match = re.exec(stripped); match; match = re.exec(stripped)) {
    let index = re.lastIndex;
    let depth = 0;
    while (index < stripped.length) {
      const ch = stripped[index];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ";" && depth === 0) break;
      index++;
    }
    types.set(
      match[1]!,
      stripped.slice(re.lastIndex, index).replace(/\s+/g, " ").trim(),
    );
  }
  return types;
}

describe("wire types stay in sync with apps/web", () => {
  const extension = extractTypes(read("../lib/api/types.ts"));
  const web = extractTypes(read("../../web/lib/recording/types.ts"));

  it.each([...SHARED_TYPES])("%s matches", (name) => {
    expect(extension.get(name), `${name} missing in extension`).toBeDefined();
    expect(web.get(name), `${name} missing in web`).toBeDefined();
    expect(extension.get(name)).toBe(web.get(name));
  });
});
