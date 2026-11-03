import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { WAVEFORM_BYTES } from "@/lib/recording/waveform";

const getRecording = vi.fn();
const callerOwns = vi.fn();
const computePeaks = vi.fn();
const bucketGet = vi.fn();
const bucketPut = vi.fn();

vi.mock("@/lib/recording/db", () => ({
  getRecording: (...a: unknown[]) => getRecording(...a),
}));
vi.mock("@/lib/recording/caller", () => ({
  callerOwns: (...a: unknown[]) => callerOwns(...a),
}));
vi.mock("@/lib/recording/waveform-compute", () => ({
  computePeaks: (...a: unknown[]) => computePeaks(...a),
}));
vi.mock("@/lib/recording/r2", () => ({
  publicUrlFor: async (k: string) => `https://cdn/${k}`,
}));
vi.mock("@/lib/cf-env", () => ({
  getAppWebEnv: async () => ({
    BUCKET: { get: bucketGet, put: bucketPut },
  }),
}));

const { GET, PUT } = await import("./route");

const SLUG = "abcdefgh23";
const ctx = (id = SLUG) => ({ params: Promise.resolve({ id }) });
const url = (query = "") => `http://x/api/r/waveform/${SLUG}${query}`;
const peaks = () => new Float32Array(WAVEFORM_BYTES / 4);

beforeEach(() => {
  vi.clearAllMocks();
  callerOwns.mockResolvedValue(true);
  bucketGet.mockResolvedValue(null);
  computePeaks.mockResolvedValue(peaks());
  getRecording.mockResolvedValue({
    state: "ready",
    userId: "owner",
    storageKey: "videos/k.mp4",
    webcamStorageKey: "videos/k-webcam.webm",
  });
});

describe("GET", () => {
  it("serves saved peaks without running a job", async () => {
    bucketGet.mockResolvedValue({ body: new ArrayBuffer(WAVEFORM_BYTES) });
    const res = await GET(new NextRequest(url()), ctx());
    expect(res.status).toBe(200);
    expect(computePeaks).not.toHaveBeenCalled();
  });

  it("runs the job once and saves the result", async () => {
    const res = await GET(new NextRequest(url("?track=webcam")), ctx());
    expect(res.status).toBe(200);
    expect(computePeaks.mock.calls[0]?.[1]).toBe("videos/k-webcam.webm");
    expect(bucketPut.mock.calls[0]?.[0]).toBe("videos/k-webcam.webm.peaks");
  });

  it("says so when the job can't run, saving nothing", async () => {
    computePeaks.mockResolvedValue(null);
    expect((await GET(new NextRequest(url()), ctx())).status).toBe(503);
    expect(bucketPut).not.toHaveBeenCalled();
  });

  it("starts no job for anyone but the owner", async () => {
    callerOwns.mockResolvedValue(false);
    expect((await GET(new NextRequest(url()), ctx())).status).toBe(404);
    expect(computePeaks).not.toHaveBeenCalled();
    expect(bucketGet).not.toHaveBeenCalled();
  });

  it("refuses a bad slug or track", async () => {
    expect((await GET(new NextRequest(url()), ctx("nope"))).status).toBe(400);
    const badTrack = new NextRequest(url("?track=other"));
    expect((await GET(badTrack, ctx())).status).toBe(400);
  });
});

describe("PUT", () => {
  const put = (body: BodyInit) =>
    new NextRequest(url(), { method: "PUT", body });

  it("saves valid peaks from the owner", async () => {
    expect((await PUT(put(peaks()), ctx())).status).toBe(204);
    expect(bucketPut.mock.calls[0]?.[0]).toBe("videos/k.mp4.peaks");
  });

  it("refuses anyone else", async () => {
    callerOwns.mockResolvedValue(false);
    expect((await PUT(put(peaks()), ctx())).status).toBe(404);
    expect(bucketPut).not.toHaveBeenCalled();
  });

  it("refuses bytes that aren't peaks", async () => {
    expect((await PUT(put(new Uint8Array(10)), ctx())).status).toBe(400);
    expect(bucketPut).not.toHaveBeenCalled();
  });
});
