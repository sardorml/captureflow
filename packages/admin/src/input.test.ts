import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  hydrateEmail,
  hydrateInviteToken,
  hydratePassword,
  hydrateQuotaInput,
  hydrateRole,
  hydrateUserId,
} from "./input";

const form = (values: Record<string, unknown>) => ({
  get: (name: string) => values[name] ?? null,
});

describe("hydrateQuotaInput", () => {
  it("parses integers and trims the note", () => {
    expect(
      hydrateQuotaInput(
        form({
          storageBytesOverride: "1024",
          activeRecordingsOverride: "10",
          note: "  raised for launch  ",
        }),
      ),
    ).toEqual({
      storageBytesOverride: 1024,
      activeRecordingsOverride: 10,
      note: "raised for launch",
    });
  });

  it("treats blank and missing fields as no override", () => {
    expect(hydrateQuotaInput(form({}))).toEqual({
      storageBytesOverride: null,
      activeRecordingsOverride: null,
      note: null,
    });
  });

  it("rejects values that would disable accounting", () => {
    for (const bad of ["-1", "1e30", "abc", "1.5", "Infinity", "NaN"]) {
      expect(
        hydrateQuotaInput(form({ storageBytesOverride: bad }))
          .storageBytesOverride,
      ).toBeNull();
    }
  });

  it("caps the note length", () => {
    expect(
      hydrateQuotaInput(form({ note: "x".repeat(900) })).note,
    ).toHaveLength(500);
  });
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
