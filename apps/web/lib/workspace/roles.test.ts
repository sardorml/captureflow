import { describe, expect, it } from "vitest";
import {
  WORKSPACE_ROLES,
  can,
  hydrateAssignableRole,
  hydrateWorkspaceRole,
  isSeatRole,
} from "@captureflow/quota";

describe("workspace role policy", () => {
  it("lets only the owner administer", () => {
    for (const action of [
      "invite",
      "manage-members",
      "manage-workspace",
    ] as const) {
      expect(can("owner", action)).toBe(true);
      expect(can("member", action)).toBe(false);
      expect(can("viewer", action)).toBe(false);
    }
  });

  it("keeps viewers to watching and commenting", () => {
    expect(can("viewer", "view")).toBe(true);
    expect(can("viewer", "comment")).toBe(true);
    expect(can("viewer", "record")).toBe(false);
    expect(can("member", "record")).toBe(true);
  });

  it("lets everyone but the owner leave", () => {
    expect(can("owner", "leave")).toBe(false);
    expect(can("member", "leave")).toBe(true);
    expect(can("viewer", "leave")).toBe(true);
  });

  it("treats an unknown or missing role as nothing", () => {
    expect(can(null, "view")).toBe(false);
    expect(can(undefined, "view")).toBe(false);
  });

  it("bills exactly the roles that record", () => {
    expect(WORKSPACE_ROLES.filter(isSeatRole)).toEqual(["owner", "member"]);
  });

  it("hydrates stored and submitted roles safely", () => {
    expect(hydrateWorkspaceRole("legacy-role")).toBe("viewer");
    expect(hydrateWorkspaceRole("owner")).toBe("owner");
    expect(hydrateAssignableRole("owner")).toBe("member");
    expect(hydrateAssignableRole("viewer")).toBe("viewer");
    expect(hydrateAssignableRole(undefined)).toBe("member");
  });
});
