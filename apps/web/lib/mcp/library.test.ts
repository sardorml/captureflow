import { describe, expect, it, vi } from "vitest";

vi.mock("../current-workspace", () => ({
  resolveCurrentWorkspace: async () => ({ workspace: { id: "ws-current" } }),
}));

const { LibraryError, resolveWorkspaceId, transcriptToText } =
  await import("./library");

const user = {
  userId: "u1",
  memberships: [{ workspace_id: "ws-team" }, { workspace_id: "ws-current" }],
} as Parameters<typeof resolveWorkspaceId>[0];

describe("resolveWorkspaceId", () => {
  it("uses a workspace the user belongs to, else the current one", async () => {
    expect(await resolveWorkspaceId(user, "ws-team")).toBe("ws-team");
    expect(await resolveWorkspaceId(user, undefined)).toBe("ws-current");
  });

  it("refuses a workspace the user is not in", async () => {
    await expect(resolveWorkspaceId(user, "ws-other")).rejects.toBeInstanceOf(
      LibraryError,
    );
  });
});

describe("transcriptToText", () => {
  const transcript = {
    version: 1 as const,
    language: "en",
    segments: [
      { id: "a", startMs: 0, endMs: 4_000, text: " Hello there " },
      { id: "b", startMs: 5_000, endMs: 9_000, text: "Cut this part" },
      { id: "c", startMs: 65_000, endMs: 70_000, text: "A minute in" },
    ],
  };

  it("timestamps each line and leaves out what the owner cut", () => {
    expect(
      transcriptToText(transcript, [{ startMs: 4_500, endMs: 9_500 }]),
    ).toBe("[0:00] Hello there\n[1:05] A minute in");
  });
});
