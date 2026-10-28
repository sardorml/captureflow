import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyPublicOrigin, ORIGIN_SENTINEL } from "./origin";
import { ensureSecrets } from "./secrets";

function tempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

describe("applyPublicOrigin", () => {
  it("rewrites only files carrying the sentinel, and can be re-pointed later", () => {
    const app = tempDir("cf-origin-");
    const next = join(app, ".next");
    mkdirSync(join(next, "static", "chunks"), { recursive: true });
    const chunk = join(next, "static", "chunks", "a.js");
    const page = join(next, "page.html");
    const untouched = join(next, "b.js");
    writeFileSync(chunk, `const u = "${ORIGIN_SENTINEL}/media";`);
    writeFileSync(page, `<a href="${ORIGIN_SENTINEL}/r/x">`);
    writeFileSync(untouched, "const u = 1;");

    expect(applyPublicOrigin(next, "https://rec.example.com")).toBe(2);
    expect(readFileSync(chunk, "utf8")).toBe(
      'const u = "https://rec.example.com/media";',
    );
    expect(readFileSync(page, "utf8")).toBe(
      '<a href="https://rec.example.com/r/x">',
    );

    expect(applyPublicOrigin(next, "http://localhost:3000")).toBe(2);
    expect(readFileSync(chunk, "utf8")).toBe(
      'const u = "http://localhost:3000/media";',
    );
    expect(readFileSync(untouched, "utf8")).toBe("const u = 1;");
  });
});

describe("ensureSecrets", () => {
  it("generates missing secrets once, keeps them, and lets the environment win", () => {
    const data = tempDir("cf-secrets-");
    const first = ensureSecrets(data, ["A", "B"], {});
    expect(first.generated).toEqual(["A", "B"]);
    expect(first.values.A).toMatch(/^[\w-]{43}$/);
    expect(statSync(join(data, "secrets.json")).mode & 0o777).toBe(0o600);

    const second = ensureSecrets(data, ["A", "B"], { B: "from-env" });
    expect(second.generated).toEqual([]);
    expect(second.values).toEqual({ A: first.values.A, B: "from-env" });
  });
});
