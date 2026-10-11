import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  hydrateEmail,
  hydrateInviteToken,
  hydratePassword,
  hydrateGrantInput,
  hydrateQuotaInput,
  hydrateRole,
  hydrateUserId,
} from "./input";

const form = (values: Record<string, unknown>) => ({
  get: (name: string) => values[name] ?? null,
});

const GiB = 1024 ** 3;
const NOW = Date.parse("2026-10-11T12:00:00Z");

describe("hydrateQuotaInput", () => {
  it("converts the amount by its unit and trims the note", () => {
    expect(
      hydrateQuotaInput(
        form({
          storageAmount: "1.5",
          storageUnit: "GB",
          note: "  raised for launch  ",
        }),
      ),
    ).toEqual({
      ok: true,
      value: { storageBytesOverride: 1.5 * GiB, note: "raised for launch" },
    });
    expect(
      hydrateQuotaInput(form({ storageAmount: "2", storageUnit: "TB" })),
    ).toMatchObject({
      ok: true,
      value: { storageBytesOverride: 2 * 1024 * GiB },
    });
  });

  it("treats a blank amount as no override", () => {
    expect(hydrateQuotaInput(form({}))).toEqual({
      ok: true,
      value: { storageBytesOverride: null, note: null },
    });
  });

  it("refuses malformed amounts instead of clearing the override", () => {
    for (const bad of ["-1", "1e3", "abc", "Infinity", "NaN", "1,5", " 2 GB"]) {
      expect(
        hydrateQuotaInput(form({ storageAmount: bad, storageUnit: "GB" })).ok,
      ).toBe(false);
    }
  });

  it("refuses an unknown unit and anything over 1 PB", () => {
    expect(
      hydrateQuotaInput(form({ storageAmount: "1", storageUnit: "PB" })).ok,
    ).toBe(false);
    expect(
      hydrateQuotaInput(form({ storageAmount: "1025", storageUnit: "TB" })).ok,
    ).toBe(false);
  });

  it("caps the note length", () => {
    const res = hydrateQuotaInput(form({ note: "x".repeat(900) }));
    expect(res.ok && res.value.note).toHaveLength(500);
  });
});

describe("hydrateGrantInput", () => {
  it("revokes on none", () => {
    expect(hydrateGrantInput(form({ plan: "none" }), NOW)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("grants a known plan with no end date", () => {
    expect(hydrateGrantInput(form({ plan: "1849425" }), NOW)).toEqual({
      ok: true,
      value: { variantId: "1849425", expiresAt: null },
    });
  });

  it("runs a grant through the end of its last day, UTC", () => {
    expect(
      hydrateGrantInput(form({ plan: "1849420", until: "2026-12-31" }), NOW),
    ).toEqual({
      ok: true,
      value: {
        variantId: "1849420",
        expiresAt: Date.parse("2027-01-01T00:00:00Z"),
      },
    });
  });

  it("accepts today as the last day", () => {
    expect(
      hydrateGrantInput(form({ plan: "1849420", until: "2026-10-11" }), NOW).ok,
    ).toBe(true);
  });

  it("refuses unknown plans, past dates and junk dates", () => {
    expect(hydrateGrantInput(form({ plan: "999" }), NOW).ok).toBe(false);
    expect(hydrateGrantInput(form({}), NOW).ok).toBe(false);
    expect(
      hydrateGrantInput(form({ plan: "1849420", until: "2026-10-10" }), NOW).ok,
    ).toBe(false);
    for (const bad of ["tomorrow", "2026-13-45", "2026-1-1"]) {
      expect(
        hydrateGrantInput(form({ plan: "1849420", until: bad }), NOW).ok,
      ).toBe(false);
    }
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
