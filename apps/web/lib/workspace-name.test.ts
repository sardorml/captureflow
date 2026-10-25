import { describe, expect, it } from "vitest";
import { WORKSPACE_NAME_MAX, hydrateWorkspaceName } from "./workspace-name";

describe("hydrateWorkspaceName", () => {
  it("trims a usable name", () => {
    expect(hydrateWorkspaceName("  Design team ")).toEqual({
      ok: true,
      name: "Design team",
    });
  });

  it("rejects blanks and non-strings", () => {
    for (const bad of ["", "   ", null, undefined, 42, ["x"]]) {
      expect(hydrateWorkspaceName(bad).ok).toBe(false);
    }
  });

  it("caps the length", () => {
    expect(hydrateWorkspaceName("a".repeat(WORKSPACE_NAME_MAX)).ok).toBe(true);
    expect(hydrateWorkspaceName("a".repeat(WORKSPACE_NAME_MAX + 1)).ok).toBe(
      false,
    );
  });
});
