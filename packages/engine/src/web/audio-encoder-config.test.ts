import { describe, expect, it } from "vitest";
import { audioEncoderCandidates, containerCodec } from "./audio-encoder-config";

const requested = { sampleRate: 48_000, numberOfChannels: 1, bitrate: 96_000 };

describe("audioEncoderCandidates", () => {
  it("tries AAC at each rate before Opus", () => {
    expect(audioEncoderCandidates(requested)).toEqual([
      {
        codec: "mp4a.40.2",
        sampleRate: 48_000,
        numberOfChannels: 1,
        bitrate: 96_000,
      },
      {
        codec: "mp4a.40.2",
        sampleRate: 48_000,
        numberOfChannels: 1,
        bitrate: 128_000,
      },
      {
        codec: "opus",
        sampleRate: 48_000,
        numberOfChannels: 1,
        bitrate: 96_000,
      },
    ]);
  });
});

describe("containerCodec", () => {
  it("names the track a config lands in", () => {
    const [aac, , opus] = audioEncoderCandidates(requested);
    expect(aac && containerCodec(aac)).toBe("aac");
    expect(opus && containerCodec(opus)).toBe("opus");
  });
});
