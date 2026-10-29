import { describe, expect, it } from "vitest";
import { CHANNELS, createAudioMixer, createPacer, SAMPLE_RATE } from "./pacing";

describe("createPacer", () => {
  it("writes exactly what wall-clock time is owed, catching up after a late tick", () => {
    const pacer = createPacer(0);
    expect(pacer.due(100)).toEqual({ frames: 3, samples: 4800 });
    expect(pacer.due(1000)).toEqual({
      frames: 27,
      samples: SAMPLE_RATE - 4800,
    });
    expect(pacer.due(1000)).toEqual({ frames: 0, samples: 0 });
    expect(pacer.durationMs).toBe(1000);
  });

  it("leaves paused time out of the recording", () => {
    const pacer = createPacer(0);
    pacer.due(1000);
    pacer.pause(1000);
    expect(pacer.due(5000)).toEqual({ frames: 0, samples: 0 });
    pacer.resume(9000);
    expect(pacer.due(9500)).toEqual({ frames: 15, samples: 24_000 });
    expect(pacer.durationMs).toBe(1500);
  });
});

describe("createAudioMixer", () => {
  it("plays clips in order over silence and says when each is done", async () => {
    const mixer = createAudioMixer();
    let done = false;
    const played = mixer
      .play(Int16Array.from([1, 2, 3, 4]))
      .then(() => (done = true));
    const first = new Int16Array(mixer.take(1).buffer.slice(0));
    expect(Array.from(first)).toEqual([1, 2]);
    const rest = new Int16Array(mixer.take(3).buffer.slice(0));
    expect(rest.length).toBe(3 * CHANNELS);
    expect(Array.from(rest)).toEqual([3, 4, 0, 0, 0, 0]);
    await played;
    expect(done).toBe(true);
    expect(mixer.playing).toBe(false);
  });
});
