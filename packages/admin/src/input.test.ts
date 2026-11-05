import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  hydrateEmail,
  hydrateInviteToken,
  hydrateLimitOverride,
  hydratePassword,
  hydrateRole,
  hydrateUserId,
} from "./input";

const form = (values: Record<string, unknown>) => ({
  get: (name: string) => values[name] ?? null,
});

describe("hydrateUserId", () => {
  it("accepts id-shaped strings", () => {
    expect(hydrateUserId("abc123_-XY")).toBe("abc123_-XY");
  });

  it("rejects anything that could reach the query as something else", () => {
    for (const bad of [
      "",
      "  ",
      "a b",
      "1' OR '1'='1",
      "../x",
      "x".repeat(65),
    ]) {
      expect(hydrateUserId(bad)).toBeNull();
    }
  });
});

describe("hydrateEmail", () => {
  it("normalizes case and surrounding space", () => {
    expect(hydrateEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("rejects anything that is not an addressable mailbox", () => {
    for (const bad of [
      "",
      "ada",
      "ada@",
      "@example.com",
      "ada@example",
      "a b@example.com",
      `${"x".repeat(250)}@example.com`,
    ]) {
      expect(hydrateEmail(bad)).toBeNull();
    }
  });
});

describe("hydratePassword", () => {
  it("requires a minimum length", () => {
    expect(hydratePassword("x".repeat(MIN_PASSWORD_LENGTH))).toHaveLength(
      MIN_PASSWORD_LENGTH,
    );
    expect(hydratePassword("x".repeat(MIN_PASSWORD_LENGTH - 1))).toBeNull();
  });

  it("rejects an unbounded password rather than hashing it", () => {
    expect(hydratePassword("x".repeat(201))).toBeNull();
  });

  it("keeps the password verbatim, including outer spaces", () => {
    expect(hydratePassword("  spaced pass  ")).toBe("  spaced pass  ");
  });
});

describe("hydrateRole", () => {
  it("accepts the known roles", () => {
    expect(hydrateRole("owner")).toBe("owner");
    expect(hydrateRole("admin")).toBe("admin");
    expect(hydrateRole("viewer")).toBe("viewer");
  });

  it("rejects an unknown or empty role", () => {
    for (const bad of ["", "root", "Owner", "admin ; DROP TABLE"]) {
      expect(hydrateRole(bad)).toBeNull();
    }
  });
});

describe("hydrateInviteToken", () => {
  it("accepts a base64url token", () => {
    expect(hydrateInviteToken("aB3-_x".padEnd(32, "z"))).toHaveLength(32);
  });

  it("rejects short, long and non-token strings", () => {
    for (const bad of ["", "short", "x".repeat(129), "has space", "a+b/c="]) {
      expect(hydrateInviteToken(bad)).toBeNull();
    }
  });
});

describe("hydrateLimitOverride", () => {
  it("reads whole numbers above the defaults, minutes as milliseconds", () => {
    expect(
      hydrateLimitOverride({ recordings: " 100 ", minutes: "15" }),
    ).toEqual({
      ok: true,
      value: { recordings: 100, maxRecordingMs: 15 * 60_000 },
    });
  });

  it("treats a blank field as the default", () => {
    expect(hydrateLimitOverride({ recordings: "", minutes: null })).toEqual({
      ok: true,
      value: { recordings: null, maxRecordingMs: null },
    });
    expect(hydrateLimitOverride({ recordings: "40", minutes: "" })).toEqual({
      ok: true,
      value: { recordings: 40, maxRecordingMs: null },
    });
  });

  it("refuses values that would not raise a limit, or are not whole numbers", () => {
    for (const recordings of [
      "25",
      "0",
      "-5",
      "12.5",
      "1e3",
      "lots",
      "10001",
    ]) {
      const result = hydrateLimitOverride({ recordings, minutes: "" });
      expect(result.ok).toBe(false);
    }
    const minutes = hydrateLimitOverride({ recordings: "", minutes: "5" });
    expect(minutes).toEqual({
      ok: false,
      error:
        "Minutes must be a whole number from 6 to 180, or blank for the default.",
    });
  });
});
