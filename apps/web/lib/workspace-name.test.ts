import { describe, expect, it } from "vitest";
import { WORKSPACE_NAME_MAX, hydrateWorkspaceName } from "./workspace-name";

const COPY = { empty: "empty", tooLong: "too long (max {max})" };

describe("hydrateWorkspaceName", () => {
  it("trims a usable name", () => {
    expect(hydrateWorkspaceName("  Design team ", COPY)).toEqual({
      ok: true,
      name: "Design team",
    });
  });

  it("rejects blanks and non-strings", () => {
    for (const bad of ["", "   ", null, undefined, 42, ["x"]]) {
      expect(hydrateWorkspaceName(bad, COPY).ok).toBe(false);
    }
  });

  it("caps the length", () => {
    expect(hydrateWorkspaceName("a".repeat(WORKSPACE_NAME_MAX), COPY).ok).toBe(
      true,
    );
    expect(
      hydrateWorkspaceName("a".repeat(WORKSPACE_NAME_MAX + 1), COPY).ok,
    ).toBe(false);
  });
});
