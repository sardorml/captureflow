import { beforeEach, describe, expect, it, vi } from "vitest";

const findInviteByToken = vi.fn();
const getWorkspaceById = vi.fn();
const listMembers = vi.fn();

vi.mock("@captureflow/quota", () => ({
  findInviteByToken: (...a: unknown[]) => findInviteByToken(...a),
  getWorkspaceById: (...a: unknown[]) => getWorkspaceById(...a),
  listMembers: (...a: unknown[]) => listMembers(...a),
}));
vi.mock("./cf-env", () => ({ getAppWebEnv: async () => ({ DB: {} }) }));

const { inviteContextFromNext } = await import("./invite-context");

const INVITE = {
  workspace_id: "w1",
  email: "them@example.com",
  invited_by_user_id: "u1",
};

beforeEach(() => {
  vi.clearAllMocks();
  findInviteByToken.mockResolvedValue(INVITE);
  getWorkspaceById.mockResolvedValue({ name: "Sam's Workspace" });
  listMembers.mockResolvedValue([
    { user_id: "u1", name: "Sam", email: "sam@example.com" },
  ]);
});

describe("inviteContextFromNext", () => {
  it("names the inviter, the workspace, and the invited address", async () => {
    expect(await inviteContextFromNext("/invite/tok123")).toEqual({
      email: "them@example.com",
      workspaceName: "Sam's Workspace",
      inviterLabel: "Sam",
    });
    expect(findInviteByToken).toHaveBeenCalledWith({}, "tok123");
  });

  it("falls back to the inviter's email when they have no name", async () => {
    listMembers.mockResolvedValue([
      { user_id: "u1", name: "  ", email: "sam@example.com" },
    ]);
    const ctx = await inviteContextFromNext("/invite/tok123");
    expect(ctx?.inviterLabel).toBe("sam@example.com");
  });

  it("is null for a next that is not an invite, without touching the db", async () => {
    for (const next of ["/recordings", "/invite", "/invite/a/b", "/settings"]) {
      expect(await inviteContextFromNext(next)).toBeNull();
    }
    expect(findInviteByToken).not.toHaveBeenCalled();
  });

  it("is null for an expired or already-accepted invite", async () => {
    findInviteByToken.mockResolvedValue(null);
    expect(await inviteContextFromNext("/invite/tok123")).toBeNull();
  });
});
