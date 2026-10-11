import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getRecording = vi.fn();
const getScreenshot = vi.fn();
const recordingSession = vi.fn();
const screenshotSession = vi.fn();

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "session=1" }),
}));
vi.mock("@/lib/recording/db", () => ({
  getRecording: (...a: unknown[]) => getRecording(...a),
  listComments: async () => [{ id: "c1" }],
  listReactions: async () => [{ id: "r1" }],
  countComments: async () => 0,
  countReactions: async () => 0,
  addComment: async (c: object) => ({ id: "c2", ...c }),
  addReaction: async (r: object) => ({ id: "r2", ...r }),
  updateRecording: vi.fn(),
}));
vi.mock("@/lib/recording/verify-session", () => ({
  verifySessionOrNull: (...a: unknown[]) => recordingSession(...a),
}));
vi.mock("@/lib/recording/cf-env", () => ({
  getCloudflareEnv: async () => ({
    BUCKET: { get: async () => ({ body: "bytes", size: 5 }) },
  }),
}));
vi.mock("@/lib/screenshot/db", () => ({
  getScreenshot: (...a: unknown[]) => getScreenshot(...a),
}));
vi.mock("@/lib/screenshot/r2", () => ({
  getScreenshotBody: async () => ({ body: "png", size: 3 }),
}));
vi.mock("@/lib/screenshot/verify-session", () => ({
  verifySessionOrNull: (...a: unknown[]) => screenshotSession(...a),
}));

const comments = await import("./r/comments/route");
const reactions = await import("./r/reactions/route");
const summary = await import("./r/summary-chapters/[id]/route");
const recordingDownload = await import("./r/download/route");
const screenshotDownload = await import("./s/download/route");

const SLUG = "abcdefgh23";
const OWNER = { userId: "owner", workspaceIds: ["ws"], name: "O", email: "o" };
const MEMBER = {
  userId: "member",
  workspaceIds: ["ws"],
  name: "M",
  email: "m",
};
const STRANGER = { userId: "x", workspaceIds: [], name: "X", email: "x" };

function recording(visibility: string) {
  return {
    slug: SLUG,
    state: "ready",
    visibility,
    userId: "owner",
    workspaceId: "ws",
    durationMs: 10_000,
    summaryChaptersJson: null,
  };
}

function req(path: string, body?: object): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
  });
}

const reads = [
  ["comments", () => comments.GET(req(`/api/r/comments?slug=${SLUG}`))],
  ["reactions", () => reactions.GET(req(`/api/r/reactions?slug=${SLUG}`))],
  [
    "summary",
    () =>
      summary.GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: SLUG }),
      }),
  ],
  [
    "download",
    () => recordingDownload.GET(req(`/api/r/download?slug=${SLUG}`)),
  ],
] as const;

const writes = [
  [
    "comment",
    () => comments.POST(req(`/api/r/comments?slug=${SLUG}`, { body: "hi" })),
  ],
  [
    "reaction",
    () =>
      reactions.POST(
        req(`/api/r/reactions?slug=${SLUG}`, { emoji: "👍", timestampMs: 0 }),
      ),
  ],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each(reads)("GET %s", (_name, call) => {
  it("serves a public recording to anyone", async () => {
    getRecording.mockResolvedValue(recording("public"));
    recordingSession.mockResolvedValue(null);
    expect((await call()).status).toBe(200);
  });

  it("hides a private recording from a signed-out visitor", async () => {
    getRecording.mockResolvedValue(recording("private"));
    recordingSession.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });

  it("hides a private recording from a workspace member", async () => {
    getRecording.mockResolvedValue(recording("private"));
    recordingSession.mockResolvedValue(MEMBER);
    expect((await call()).status).toBe(404);
  });

  it("serves a private recording to its owner", async () => {
    getRecording.mockResolvedValue(recording("private"));
    recordingSession.mockResolvedValue(OWNER);
    expect((await call()).status).toBe(200);
  });

  it("hides a workspace recording from someone outside it", async () => {
    getRecording.mockResolvedValue(recording("workspace"));
    recordingSession.mockResolvedValue(STRANGER);
    expect((await call()).status).toBe(404);
  });

  it("serves a workspace recording to a member", async () => {
    getRecording.mockResolvedValue(recording("workspace"));
    recordingSession.mockResolvedValue(MEMBER);
    expect((await call()).status).toBe(200);
  });

  it("answers 404 for a recording that doesn't exist", async () => {
    getRecording.mockResolvedValue(null);
    recordingSession.mockResolvedValue(OWNER);
    expect((await call()).status).toBe(404);
  });
});

describe.each(writes)("POST %s", (_name, call) => {
  it("requires sign-in", async () => {
    getRecording.mockResolvedValue(recording("public"));
    recordingSession.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });

  it("rejects a signed-in user who can't view the recording", async () => {
    getRecording.mockResolvedValue(recording("private"));
    recordingSession.mockResolvedValue(STRANGER);
    expect((await call()).status).toBe(404);
  });

  it("accepts a workspace member on a workspace recording", async () => {
    getRecording.mockResolvedValue(recording("workspace"));
    recordingSession.mockResolvedValue(MEMBER);
    expect((await call()).status).toBe(200);
  });
});

describe("GET screenshot download", () => {
  const call = () => screenshotDownload.GET(req(`/api/s/download?id=${SLUG}`));
  const screenshot = (visibility: string) => ({
    id: SLUG,
    state: "ready",
    visibility,
    userId: "owner",
    workspaceId: "ws",
  });

  it("serves a public screenshot to anyone", async () => {
    getScreenshot.mockResolvedValue(screenshot("public"));
    screenshotSession.mockResolvedValue(null);
    expect((await call()).status).toBe(200);
  });

  it("hides a private screenshot from a signed-out visitor", async () => {
    getScreenshot.mockResolvedValue(screenshot("private"));
    screenshotSession.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });

  it("hides a workspace screenshot from someone outside it", async () => {
    getScreenshot.mockResolvedValue(screenshot("workspace"));
    screenshotSession.mockResolvedValue(STRANGER);
    expect((await call()).status).toBe(404);
  });

  it("serves a private screenshot to its owner", async () => {
    getScreenshot.mockResolvedValue(screenshot("private"));
    screenshotSession.mockResolvedValue(OWNER);
    expect((await call()).status).toBe(200);
  });
});
