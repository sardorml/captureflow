import { describe, expect, it } from "vitest";
import {
  hydrateUserWorkspaces,
  resolveUploadWorkspace,
} from "../lib/auth/workspaces";

describe("user workspaces", () => {
  it("keeps well-formed entries and drops the rest", () => {
    expect(
      hydrateUserWorkspaces([
        {
          id: "a",
          name: "Mine",
          kind: "personal",
          role: "owner",
          isDefault: true,
        },
        { id: "b", name: "Team", kind: "team", role: "member" },
        { id: "", name: "No id" },
        { name: "No id either" },
        "junk",
        null,
      ]),
    ).toEqual([
      {
        id: "a",
        name: "Mine",
        kind: "personal",
        role: "owner",
        isDefault: true,
      },
      { id: "b", name: "Team", kind: "team", role: "member", isDefault: false },
    ]);
    expect(hydrateUserWorkspaces(undefined)).toEqual([]);
    expect(hydrateUserWorkspaces({})).toEqual([]);
  });

  it("falls back from a stale pick to the default", () => {
    const list = hydrateUserWorkspaces([
      { id: "a", name: "Mine", isDefault: true },
      { id: "b", name: "Team", kind: "team", role: "member" },
    ]);
    expect(resolveUploadWorkspace(list, "b")?.id).toBe("b");
    expect(resolveUploadWorkspace(list, "gone")?.id).toBe("a");
    expect(resolveUploadWorkspace(list, undefined)?.id).toBe("a");
    expect(resolveUploadWorkspace([], "a")).toBe(null);
  });
});
