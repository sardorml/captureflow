import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  startAudioChunkRecorder,
  type AudioChunk,
  type ChunkMediaRecorder,
} from "./audio-chunk-recorder";

// A MediaRecorder that hands back one blob per run, sized by run number.
function fakeRecorderFactory() {
  const runs: FakeRecorder[] = [];
  class FakeRecorder implements ChunkMediaRecorder {
    state: ChunkMediaRecorder["state"] = "inactive";
    ondataavailable: ChunkMediaRecorder["ondataavailable"] = null;
    onstop: ChunkMediaRecorder["onstop"] = null;
    readonly run = runs.length + 1;
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({
        data: new Blob([new Uint8Array(this.run)]),
      } as BlobEvent);
      this.onstop?.(new Event("stop"));
    }
  }
  return {
    runs,
    create: () => {
      const recorder = new FakeRecorder();
      runs.push(recorder);
      return recorder;
    },
  };
}

const track = {} as MediaStreamTrack;

describe("startAudioChunkRecorder", () => {
  let clockMs = 0;
  const elapsedMs = () => clockMs;

  beforeEach(() => {
    vi.useFakeTimers();
    clockMs = 0;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rotates into a new standalone file every chunkMs and flushes on stop", async () => {
    const factory = fakeRecorderFactory();
    const chunks: AudioChunk[] = [];
    const recorder = startAudioChunkRecorder({
      track,
      elapsedMs,
      chunkMs: 1_000,
      onChunk: (c) => chunks.push(c),
      createRecorder: factory.create,
    });

    clockMs = 1_000;
    await vi.advanceTimersByTimeAsync(1_000);
    clockMs = 1_500;
    await recorder.stop();

    expect(factory.runs).toHaveLength(2);
    expect(chunks.map((c) => [c.startMs, c.endMs, c.bytes.byteLength])).toEqual(
      [
        [0, 1_000, 1],
        [1_000, 1_500, 2],
      ],
    );
  });

  it("closes the chunk on pause and opens a fresh one on resume", async () => {
    const factory = fakeRecorderFactory();
    const chunks: AudioChunk[] = [];
    const recorder = startAudioChunkRecorder({
      track,
      elapsedMs,
      chunkMs: 10_000,
      onChunk: (c) => chunks.push(c),
      createRecorder: factory.create,
    });

    clockMs = 400;
    recorder.pause();
    // The recording clock stands still while paused.
    await vi.advanceTimersByTimeAsync(5_000);
    recorder.resume();
    clockMs = 900;
    await recorder.stop();

    expect(chunks.map((c) => [c.startMs, c.endMs])).toEqual([
      [0, 400],
      [400, 900],
    ]);
  });

  it("drops a chunk that captured no time", async () => {
    const factory = fakeRecorderFactory();
    const chunks: AudioChunk[] = [];
    const recorder = startAudioChunkRecorder({
      track,
      elapsedMs,
      onChunk: (c) => chunks.push(c),
      createRecorder: factory.create,
    });
    await recorder.stop();
    expect(chunks).toEqual([]);
  });

  it("delivers nothing after abort", async () => {
    const factory = fakeRecorderFactory();
    const chunks: AudioChunk[] = [];
    const recorder = startAudioChunkRecorder({
      track,
      elapsedMs,
      chunkMs: 1_000,
      onChunk: (c) => chunks.push(c),
      createRecorder: factory.create,
    });
    clockMs = 500;
    recorder.abort();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(chunks).toEqual([]);
    expect(factory.runs[0]?.state).toBe("inactive");
  });
});
