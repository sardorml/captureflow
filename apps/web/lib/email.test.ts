import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./cf-env", () => ({
  getAppWebEnv: async () => ({ RESEND_API_KEY: "re_test" }),
}));

const { sendAccessRequestEmail, sendWorkspaceInviteEmail } =
  await import("./email");

function sentBody() {
  const call = vi.mocked(globalThis.fetch).mock.calls[0];
  return JSON.parse(String((call[1] as RequestInit).body));
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendWorkspaceInviteEmail", () => {
  const invite = {
    to: "them@example.com",
    inviterName: "Sam",
    inviterEmail: "sam@example.com",
    workspaceName: "Sam's Workspace",
    acceptUrl: "https://captureflow.dev/invite/tok",
  };

  it("replies to the inviter, not the unattended sending address", async () => {
    await sendWorkspaceInviteEmail(invite);
    expect(sentBody().reply_to).toBe("sam@example.com");
  });

  it("describes workspaces in both parts without the sharing verb dropped", async () => {
    await sendWorkspaceInviteEmail(invite);
    const { html, text } = sentBody();
    for (const part of [html, text]) {
      expect(part).toContain("teammates share recordings and screenshots");
      expect(part).not.toContain("teammates recording");
    }
  });
});

describe("sendAccessRequestEmail", () => {
  it("replies to the person asking for access", async () => {
    await sendAccessRequestEmail({
      to: "owner@example.com",
      ownerName: "Sam",
      requesterEmail: "asker@example.com",
      requesterName: "Alex",
      artifactKind: "recording",
      artifactTitle: "Standup",
      artifactUrl: "https://captureflow.dev/r/abc",
      message: null,
      manageUrl: "https://captureflow.dev/members",
    });
    expect(sentBody().reply_to).toBe("asker@example.com");
  });
});
