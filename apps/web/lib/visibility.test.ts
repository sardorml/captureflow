import { describe, expect, it } from "vitest";
import { canViewResource } from "./visibility";

const owner = { userId: "u1", workspaceIds: ["w1", "w2"] };
const member = { userId: "u2", workspaceIds: ["w1"] };
const stranger = { userId: "u3", workspaceIds: ["w9"] };

describe("canViewResource", () => {
  it("public is viewable by anyone, including anonymous", () => {
    const r = { visibility: "public", userId: "u1", workspaceId: null };
    expect(canViewResource(null, r)).toBe(true);
    expect(canViewResource(stranger, r)).toBe(true);
  });

  it("private is viewable only by the owner", () => {
    const r = { visibility: "private", userId: "u1", workspaceId: null };
    expect(canViewResource(null, r)).toBe(false);
    expect(canViewResource(owner, r)).toBe(true);
    expect(canViewResource(stranger, r)).toBe(false);
  });

  it("workspace is viewable by the owner or a workspace member", () => {
    const r = { visibility: "workspace", userId: "u1", workspaceId: "w1" };
    expect(canViewResource(null, r)).toBe(false);
    expect(canViewResource(owner, r)).toBe(true); // owner
    expect(canViewResource(member, r)).toBe(true); // member of w1
    expect(canViewResource(stranger, r)).toBe(false); // neither
  });

  it("workspace with no workspaceId denies non-owners", () => {
    const r = { visibility: "workspace", userId: "u1", workspaceId: null };
    expect(canViewResource(member, r)).toBe(false);
    expect(canViewResource(stranger, r)).toBe(false);
  });

  it("unknown visibility denies by default", () => {
    const r = { visibility: "archived", userId: "u1", workspaceId: "w1" };
    expect(canViewResource(owner, r)).toBe(false);
  });
});
