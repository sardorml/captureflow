import { describe, expect, it } from "vitest";
import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import { createSharedClock } from "./shared-clock";

// Chrome's raw stamps as measured: screen ~2.7 days of uptime, mic page time.
const SCREEN_RAW_US = 230_493_173_800;
const MIC_RAW_US = 13_085_300;
const FRAME_US = 33_333;
const AAC_US = 21_333;

function fakeNow(startUs = 5_000_000) {
  let t = startUs;
  return {
    now: () => t,
    advance(us: number) {
      t += us;
    },
  };
}

describe("createSharedClock", () => {
  it("starts each track at the moment its first sample was read", () => {
    const clock = fakeNow();
    const track = createSharedClock(clock.now);
    const video = track();
    const audio = track();

    clock.advance(40_000);
    video.noteSample(SCREEN_RAW_US);
    clock.advance(15_000);
    audio.noteSample(MIC_RAW_US);

    expect(video.toShared(SCREEN_RAW_US)).toBe(40_000);
    expect(audio.toShared(MIC_RAW_US)).toBe(55_000);
  });

  it("keeps each track's own spacing", () => {
    const clock = fakeNow();
    const video = createSharedClock(clock.now)();
    video.noteSample(SCREEN_RAW_US);
    const first = video.toShared(SCREEN_RAW_US);
    expect(video.toShared(SCREEN_RAW_US + 10 * FRAME_US) - first).toBe(
      10 * FRAME_US,
    );
  });

  it("never starts a later-muxed track before the first one muxed", () => {
    const clock = fakeNow();
    const track = createSharedClock(clock.now);
    const video = track();
    const audio = track();

    // The mic is read first, but the screen's chunk reaches the muxer first.
    clock.advance(10_000);
    audio.noteSample(MIC_RAW_US);
    clock.advance(30_000);
    video.noteSample(SCREEN_RAW_US);

    expect(video.toShared(SCREEN_RAW_US)).toBe(40_000);
    expect(audio.toShared(MIC_RAW_US)).toBe(40_000);
    expect(audio.toShared(MIC_RAW_US + AAC_US)).toBe(40_000 + AAC_US);
  });

  it("clamps an encoder's primed first output to the start", () => {
    const clock = fakeNow();
    const audio = createSharedClock(clock.now)();
    clock.advance(20_000);
    audio.noteSample(MIC_RAW_US);
    expect(audio.toShared(MIC_RAW_US - AAC_US)).toBe(20_000);
    expect(audio.toShared(MIC_RAW_US)).toBe(20_000);
  });

  it("handles a chunk with no noted sample", () => {
    const clock = fakeNow();
    const video = createSharedClock(clock.now)();
    expect(video.toShared(SCREEN_RAW_US)).toBe(0);
  });
});

/*
 * The whole bug end to end: Chrome's raw stamps through the shared clock into
 * the real muxer, with the screen's first frames muxed before any mic sample,
 * then each track's start read back from the fragments it wrote.
 */
describe("muxed screen + mic recording", () => {
  function mux(clocked: boolean) {
    const clock = fakeNow();
    const track = createSharedClock(clock.now);
    const video = track();
    const audio = track();
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      fastStart: "fragmented",
      firstTimestampBehavior: "cross-track-offset",
      video: { codec: "avc", width: 1920, height: 1080, frameRate: 30 },
      audio: { codec: "aac", numberOfChannels: 1, sampleRate: 48_000 },
    });
    const avcC = new Uint8Array([
      1, 0x64, 0, 0x28, 0xff, 0xe1, 0, 4, 0x67, 0x64, 0, 0x28, 1, 0, 4, 0x68,
      0xee, 0x3c, 0x80,
    ]);
    const asc = new Uint8Array([0x11, 0x88]);

    let vi = 0;
    let ai = 0;
    const addVideo = () => {
      const raw = SCREEN_RAW_US + vi * FRAME_US;
      video.noteSample(raw);
      muxer.addVideoChunkRaw(
        new Uint8Array(64),
        vi % 30 === 0 ? "key" : "delta",
        clocked ? video.toShared(raw) : raw,
        FRAME_US,
        vi === 0
          ? { decoderConfig: { codec: "avc1.640028", description: avcC } }
          : undefined,
      );
      vi++;
    };
    const addAudio = () => {
      const raw = MIC_RAW_US + ai * AAC_US;
      audio.noteSample(raw);
      muxer.addAudioChunkRaw(
        new Uint8Array(32),
        "key",
        clocked ? audio.toShared(raw) : raw,
        AAC_US,
        ai === 0
          ? {
              decoderConfig: {
                codec: "mp4a.40.2",
                sampleRate: 48_000,
                numberOfChannels: 1,
                description: asc,
              },
            }
          : undefined,
      );
      ai++;
    };

    for (let i = 0; i < 3; i++) {
      addVideo();
      clock.advance(FRAME_US);
    }
    for (let t = 0; t < 4_000_000; t += 1_000) {
      clock.advance(1_000);
      if (t % AAC_US < 1_000) addAudio();
      if (t % FRAME_US < 1_000) addVideo();
    }
    muxer.finalize();
    return trackStartsSeconds(new Uint8Array(target.buffer));
  }

  it("reproduces the bug without the shared clock", () => {
    const starts = mux(false);
    expect(Math.max(...starts.video)).toBeGreaterThan(200_000);
  });

  it("starts both tracks together near zero with it", () => {
    const starts = mux(true);
    expect(starts.video[0]).toBeLessThan(0.2);
    expect(starts.audio[0]).toBeLessThan(0.2);
    expect(Math.abs(starts.video[0]! - starts.audio[0]!)).toBeLessThan(0.15);
  });

  it("never jumps a track's timeline between fragments", () => {
    const starts = mux(true);
    for (const list of [starts.video, starts.audio]) {
      for (let i = 1; i < list.length; i++) {
        const gap = list[i]! - list[i - 1]!;
        expect(gap).toBeGreaterThanOrEqual(0);
        // mp4-muxer cuts fragments up to ~2s long; the bug jumped ~2.7 days.
        expect(gap).toBeLessThan(2.5);
      }
    }
  });
});

// Each fragment's baseMediaDecodeTime (tfdt), in seconds, per track.
function trackStartsSeconds(bytes: Uint8Array): {
  video: number[];
  audio: number[];
} {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const timescale = new Map<number, number>();
  const handler = new Map<number, string>();
  const starts = { video: [] as number[], audio: [] as number[] };
  const type = (at: number) =>
    String.fromCharCode(...bytes.subarray(at + 4, at + 8));
  const CONTAINERS = new Set(["moov", "trak", "mdia", "moof", "traf"]);

  let trackId = 0;
  const walk = (start: number, end: number) => {
    for (let at = start; at < end; ) {
      const size = view.getUint32(at);
      const name = type(at);
      if (name === "tkhd") trackId = view.getUint32(at + 20);
      if (name === "mdhd") timescale.set(trackId, view.getUint32(at + 20));
      if (name === "hdlr")
        handler.set(
          trackId,
          String.fromCharCode(...bytes.subarray(at + 16, at + 20)),
        );
      if (name === "tfhd") trackId = view.getUint32(at + 12);
      if (name === "tfdt") {
        const version = bytes[at + 8];
        const t =
          version === 1
            ? Number(view.getBigUint64(at + 12))
            : view.getUint32(at + 12);
        const seconds = t / timescale.get(trackId)!;
        (handler.get(trackId) === "vide" ? starts.video : starts.audio).push(
          seconds,
        );
      }
      if (CONTAINERS.has(name)) walk(at + 8, at + size);
      at += size;
    }
  };
  walk(0, bytes.length);
  return starts;
}
