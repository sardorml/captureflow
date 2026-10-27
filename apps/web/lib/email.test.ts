import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./cf-env", () => ({
  getAppWebEnv: async () => ({ RESEND_API_KEY: "re_test" }),
}));

const {
  CHROME_EXTENSION_URL,
  sendAccessRequestEmail,
  sendWelcomeEmail,
  sendWorkspaceInviteEmail,
} = await import("./email");

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
    role: "member" as const,
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

describe("sendWelcomeEmail", () => {
  it("greets by first name and links the extension and dashboard", async () => {
    await sendWelcomeEmail({
      to: "new@example.com",
      name: "Alex <b>Kim</b>",
      appUrl: "https://captureflow.dev/",
    });
    const { subject, html, text, reply_to } = sentBody();
    expect(subject).toBe("Welcome to CaptureFlow");
    expect(reply_to).toBeUndefined();
    expect(text).toMatch(/^Hi Alex,/);
    expect(html).not.toContain("<b>");
    for (const part of [html, text]) {
      expect(part).toContain(CHROME_EXTENSION_URL);
      expect(part).toContain("https://captureflow.dev/recordings");
    }
  });

  it("falls back to a plain greeting without a name", async () => {
    await sendWelcomeEmail({
      to: "new@example.com",
      name: "  ",
      appUrl: "https://captureflow.dev",
    });
    expect(sentBody().text).toMatch(/^Hi there,/);
  });
});
