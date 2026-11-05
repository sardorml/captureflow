import { describe, expect, it } from "vitest";
import { createAacEncoder, createFrameFeeder } from "./aac-encoder";

const SAMPLE_RATE = 48_000;
const toUs = (samples: number) => (samples / SAMPLE_RATE) * 1_000_000;

describe("createFrameFeeder", () => {
  it("interleaves channels and stamps each frame with its first sample", () => {
    const feeder = createFrameFeeder(4, 2, SAMPLE_RATE);
    const planes = [
      Float32Array.from([1, 2, 3, 4, 5, 6]),
      Float32Array.from([-1, -2, -3, -4, -5, -6]),
    ];
    const frames = feeder.push({ planes, frames: 6, timestampUs: toUs(100) });
    expect(frames).toHaveLength(1);
    expect(Array.from(frames[0]!.samples)).toEqual([
      1, -1, 2, -2, 3, -3, 4, -4,
    ]);
    expect(frames[0]!.pts).toBe(100);
    const rest = feeder.drain();
    expect(Array.from(rest!.samples)).toEqual([5, -5, 6, -6, 0, 0, 0, 0]);
    expect(rest!.pts).toBe(104);
    expect(feeder.drain()).toBeNull();
  });

  it("keeps one running count across adjoining buffers", () => {
    const feeder = createFrameFeeder(4, 1, SAMPLE_RATE);
    feeder.push({
      planes: [new Float32Array(3)],
      frames: 3,
      timestampUs: toUs(10),
    });
    const frames = feeder.push({
      planes: [new Float32Array(5)],
      frames: 5,
      timestampUs: toUs(13) + 7,
    });
    expect(frames.map((f) => f.pts)).toEqual([10, 14]);
  });

  it("re-anchors after a gap", () => {
    const feeder = createFrameFeeder(4, 1, SAMPLE_RATE);
    feeder.push({
      planes: [new Float32Array(2)],
      frames: 2,
      timestampUs: toUs(10),
    });
    const frames = feeder.push({
      planes: [new Float32Array(2)],
      frames: 2,
      timestampUs: toUs(1000),
    });
    expect(frames.map((f) => f.pts)).toEqual([998]);
  });

  it("fills a missing plane with silence", () => {
    const feeder = createFrameFeeder(2, 2, SAMPLE_RATE);
    const [frame] = feeder.push({
      planes: [Float32Array.from([0.5, 0.25])],
      frames: 2,
      timestampUs: 0,
    });
    expect(Array.from(frame!.samples)).toEqual([0.5, 0, 0.25, 0]);
  });
});

describe("createAacEncoder", () => {
  const sine = (frames: number, offset: number): Float32Array =>
    Float32Array.from(
      { length: frames },
      (_, i) =>
        Math.sin((2 * Math.PI * 440 * (offset + i)) / SAMPLE_RATE) * 0.5,
    );

  // AudioData is a browser type; the encoder only reads these members.
  const audioData = (frames: number, offset: number) =>
    ({
      numberOfFrames: frames,
      numberOfChannels: 1,
      timestamp: toUs(offset),
      copyTo(dest: Float32Array) {
        dest.set(sine(frames, offset));
      },
    }) as unknown as AudioData;

  it("encodes a second of mono audio into AAC-LC frames", async () => {
    const encoder = await createAacEncoder({
      sampleRate: SAMPLE_RATE,
      numberOfChannels: 1,
      bitrate: 96_000,
    });
    expect(encoder.decoderConfig.codec).toBe("mp4a.40.2");
    // AudioSpecificConfig opens with AAC-LC, 48 kHz (index 3), mono.
    expect(
      Array.from(encoder.decoderConfig.description as Uint8Array).slice(0, 2),
    ).toEqual([0x11, 0x88]);

    const frames = [];
    for (let offset = 0; offset < SAMPLE_RATE; offset += 480) {
      frames.push(...encoder.encode(audioData(480, offset)));
    }
    frames.push(...encoder.flush());
    encoder.close();

    const frameUs = Math.round(toUs(1024));
    expect(frames.length).toBeGreaterThanOrEqual(
      Math.floor(SAMPLE_RATE / 1024),
    );
    expect(frames.every((f) => f.data.byteLength > 0)).toBe(true);
    expect(frames.every((f) => f.durationUs === frameUs)).toBe(true);
    for (let i = 1; i < frames.length; i++) {
      const step = frames[i]!.timestampUs - frames[i - 1]!.timestampUs;
      expect(Math.abs(step - frameUs)).toBeLessThanOrEqual(1);
    }
    const total = frames.reduce((n, f) => n + f.data.byteLength, 0);
    expect(total).toBeGreaterThan(8_000);
    expect(total).toBeLessThan(20_000);
  });
});
