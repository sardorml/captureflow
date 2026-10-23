import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getRecording = vi.fn();
const updateRecording = vi.fn();
const deleteRecording = vi.fn();
const resolveToken = vi.fn();
const session = vi.fn();
const putObject = vi.fn();
const upsertTranscript = vi.fn();

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "session=1" }),
}));
vi.mock("@/lib/recording/db", () => ({
  getRecording: (...a: unknown[]) => getRecording(...a),
  updateRecording: (...a: unknown[]) => updateRecording(...a),
  deleteRecording: (...a: unknown[]) => deleteRecording(...a),
  upsertTranscript: (...a: unknown[]) => upsertTranscript(...a),
}));
vi.mock("@/lib/recording/device-tokens", () => ({
  resolveDeviceTokenToUser: (...a: unknown[]) => resolveToken(...a),
}));
vi.mock("@/lib/recording/verify-session", () => ({
  verifySessionOrNull: (...a: unknown[]) => session(...a),
}));
vi.mock("@/lib/recording/r2", () => ({
  abortMultipartUpload: vi.fn(),
  deleteObject: vi.fn(),
  putObject: (...a: unknown[]) => putObject(...a),
  publicUrlFor: async (k: string) => `https://cdn/${k}`,
}));

const del = await import("./r/[id]/route");
const visibility = await import("./r/visibility/route");
const abort = await import("./r/abort/route");
const poster = await import("./r/poster/route");
const transcript = await import("./r/transcript/route");

const SLUG = "abcdefgh23";
const DEVICE = "device-1234";

function row(state = "ready") {
  return {
    slug: SLUG,
    state,
    visibility: "private",
    userId: "owner",
    deviceId: DEVICE,
    workspaceId: null,
    storageKey: "videos/k.mp4",
    posterKey: null,
    webcamStorageKey: null,
    uploadId: state === "pending" ? "up" : null,
    webcamUploadId: null,
  };
}

function req(
  path: string,
  init: { method: string; headers?: Record<string, string>; body?: BodyInit },
): NextRequest {
  return new NextRequest(`http://localhost${path}`, init);
}

const asDevice = { "x-captureflow-device": DEVICE };
const asOwnerApp = { ...asDevice, authorization: "Bearer owner-token" };
const asOtherApp = { ...asDevice, authorization: "Bearer other-token" };

beforeEach(() => {
  vi.clearAllMocks();
  resolveToken.mockImplementation(async (t: string) =>
    t === "owner-token" ? "owner" : t === "other-token" ? "other" : null,
  );
  session.mockResolvedValue(null);
});

const ownerOnly = [
  [
    "DELETE",
    (headers: Record<string, string>) =>
      del.DELETE(req(`/api/r/${SLUG}`, { method: "DELETE", headers }), {
        params: Promise.resolve({ id: SLUG }),
      }),
    deleteRecording,
  ],
  [
    "visibility",
    (headers: Record<string, string>) =>
      visibility.POST(
        req(`/api/r/visibility?slug=${SLUG}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ value: "public" }),
        }),
      ),
    updateRecording,
  ],
] as const;

describe.each(ownerOnly)("%s", (_name, call, effect) => {
  beforeEach(() => getRecording.mockResolvedValue(row()));

  it("refuses the device id on its own", async () => {
    expect((await call(asDevice)).status).toBe(403);
    expect(effect).not.toHaveBeenCalled();
  });

  it("refuses another account's token sent with the right device id", async () => {
    expect((await call(asOtherApp)).status).toBe(403);
    expect(effect).not.toHaveBeenCalled();
  });

  it("refuses a revoked token without falling back to the cookie", async () => {
    session.mockResolvedValue({ userId: "owner" });
    expect(
      (await call({ ...asDevice, authorization: "Bearer revoked-token" }))
        .status,
    ).toBe(403);
    expect(effect).not.toHaveBeenCalled();
  });

  it("accepts the owner's app token", async () => {
    expect((await call(asOwnerApp)).status).toBe(200);
    expect(effect).toHaveBeenCalled();
  });

  it("accepts the owner's browser session", async () => {
    session.mockResolvedValue({ userId: "owner" });
    expect((await call({})).status).toBe(200);
    expect(effect).toHaveBeenCalled();
  });

  it("refuses someone else's browser session", async () => {
    session.mockResolvedValue({ userId: "other" });
    expect((await call({})).status).toBe(403);
    expect(effect).not.toHaveBeenCalled();
  });
});

describe("abort", () => {
  const call = () =>
    abort.POST(
      req("/api/r/abort", {
        method: "POST",
        headers: asDevice,
        body: JSON.stringify({ slug: SLUG }),
      }),
    );

  it("cancels an upload still in flight with just the device id", async () => {
    getRecording.mockResolvedValue(row("pending"));
    expect((await call()).status).toBe(200);
    expect(updateRecording).toHaveBeenCalledWith(SLUG, {
      state: "failed",
      uploadId: null,
    });
  });

  it("leaves a finished recording alone", async () => {
    getRecording.mockResolvedValue(row("ready"));
    expect((await call()).status).toBe(409);
    expect(updateRecording).not.toHaveBeenCalled();
  });
});

describe("poster", () => {
  const call = (headers: Record<string, string>) =>
    poster.POST(
      req(`/api/r/poster?slug=${SLUG}`, {
        method: "POST",
        headers: { ...headers, "content-type": "image/jpeg" },
        body: new Uint8Array([1, 2, 3]),
      }),
    );

  it("takes the device id while the upload is in flight", async () => {
    getRecording.mockResolvedValue(row("pending"));
    expect((await call(asDevice)).status).toBe(200);
    expect(putObject).toHaveBeenCalled();
  });

  it("needs the owner to replace the poster of a finished recording", async () => {
    getRecording.mockResolvedValue(row("ready"));
    expect((await call(asDevice)).status).toBe(403);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("lets the owner's app replace it", async () => {
    getRecording.mockResolvedValue(row("ready"));
    expect((await call(asOwnerApp)).status).toBe(200);
  });
});

describe("transcript", () => {
  const TRANSCRIPT = {
    version: 1,
    language: "en-US",
    source: "chrome-speech-local",
    segments: [{ id: "s1", startMs: 0, endMs: 1000, text: "hi" }],
  };
  const call = (headers: Record<string, string>, body: unknown = TRANSCRIPT) =>
    transcript.POST(
      req("/api/r/transcript", {
        method: "POST",
        headers,
        body: JSON.stringify({ slug: SLUG, transcript: body }),
      }),
    );

  it("takes the device id for a pending or finished recording", async () => {
    getRecording.mockResolvedValue(row("pending"));
    expect((await call(asDevice)).status).toBe(200);
    getRecording.mockResolvedValue(row("ready"));
    expect((await call(asDevice)).status).toBe(200);
    expect(upsertTranscript).toHaveBeenCalledTimes(2);
    expect(upsertTranscript).toHaveBeenLastCalledWith({
      slug: SLUG,
      source: "chrome-speech-local",
      language: "en-US",
      autoJson: JSON.stringify(TRANSCRIPT),
    });
  });

  it("refuses another device", async () => {
    getRecording.mockResolvedValue(row("ready"));
    expect(
      (await call({ "x-captureflow-device": "device-other" })).status,
    ).toBe(403);
    expect(upsertTranscript).not.toHaveBeenCalled();
  });

  it("refuses without a device header", async () => {
    getRecording.mockResolvedValue(row("ready"));
    expect((await call({})).status).toBe(400);
    expect(upsertTranscript).not.toHaveBeenCalled();
  });

  it("rejects a malformed transcript before touching the db", async () => {
    getRecording.mockResolvedValue(row("ready"));
    const res = await call(asDevice, { version: 1, segments: [] });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("invalid_transcript");
    expect(upsertTranscript).not.toHaveBeenCalled();
  });

  it("leaves a failed recording alone", async () => {
    getRecording.mockResolvedValue(row("failed"));
    expect((await call(asDevice)).status).toBe(409);
    expect(upsertTranscript).not.toHaveBeenCalled();
  });
});
