import { describe, expect, it } from "vitest";
import {
  HOLD_COOLDOWN_MS,
  MAX_HOLD_MS,
  NUDGE_RATE,
  planWebcamSync,
  type SyncInput,
  type SyncPlan,
} from "./webcam-sync";

function input(over: {
  main?: Partial<SyncInput["main"]>;
  cam?: Partial<SyncInput["cam"]>;
  rest?: Partial<Omit<SyncInput, "main" | "cam">>;
}): SyncInput {
  return {
    now: 100_000,
    playing: true,
    scrubbing: false,
    holdSince: null,
    gaveUpAt: null,
    smoothedDrift: null,
    nudging: false,
    ...over.rest,
    main: { paused: false, time: 10, rate: 1, stalled: false, ...over.main },
    cam: {
      paused: false,
      time: 10,
      rate: 1,
      stalled: false,
      done: false,
      ...over.cam,
    },
  };
}

const idle: Partial<SyncPlan> = { cam: null, seekCamTo: null, hold: false };

describe("planWebcamSync", () => {
  it("leaves a cam that's in step alone", () => {
    expect(planWebcamSync(input({}))).toMatchObject({
      ...idle,
      camRate: null,
    });
  });

  it("starts the cam when the screen plays", () => {
    expect(planWebcamSync(input({ cam: { paused: true } })).cam).toBe("play");
  });

  it("pauses the cam when the viewer pauses", () => {
    const plan = planWebcamSync(
      input({ main: { paused: true }, rest: { playing: false } }),
    );
    expect(plan).toMatchObject({ cam: "pause", hold: false });
  });

  describe("screen buffering", () => {
    it("pauses the cam instead of letting it run ahead", () => {
      const plan = planWebcamSync(input({ main: { stalled: true } }));
      expect(plan).toMatchObject({
        cam: "pause",
        seekCamTo: null,
        hold: false,
      });
    });

    // The bug this replaces: the frozen screen clock let the cam drift past
    // the resync threshold, so it was seeked back every ~250ms.
    it("never seeks the cam while the screen is stuck, however far apart", () => {
      for (const camTime of [10.3, 11, 15]) {
        const plan = planWebcamSync(
          input({ main: { stalled: true }, cam: { time: camTime } }),
        );
        expect(plan.seekCamTo).toBe(null);
      }
    });

    it("resumes the cam once the screen recovers", () => {
      const plan = planWebcamSync(
        input({ cam: { paused: true, time: 10.01 } }),
      );
      expect(plan).toMatchObject({ cam: "play", seekCamTo: null });
    });
  });

  describe("drift", () => {
    it("ignores drift under the dead zone", () => {
      expect(planWebcamSync(input({ cam: { time: 10.03 } })).camRate).toBe(
        null,
      );
    });

    it("speeds a lagging cam up without seeking", () => {
      const plan = planWebcamSync(input({ cam: { time: 9.9 } }));
      expect(plan).toMatchObject({ seekCamTo: null, camRate: 1 + NUDGE_RATE });
    });

    it("slows a cam that's ahead without seeking", () => {
      const plan = planWebcamSync(input({ cam: { time: 10.1 } }));
      expect(plan).toMatchObject({ seekCamTo: null, camRate: 1 - NUDGE_RATE });
    });

    it("follows the screen's playback speed", () => {
      const plan = planWebcamSync(input({ main: { rate: 1.5 } }));
      expect(plan.camRate).toBe(1.5);
    });

    it("smooths a jittery sample instead of nudging on it", () => {
      const plan = planWebcamSync(
        input({ cam: { time: 9.9 }, rest: { smoothedDrift: 0 } }),
      );
      expect(plan.camRate).toBe(null);
      expect(plan.nudging).toBe(false);
      expect(plan.smoothedDrift).toBeCloseTo(-0.015);
    });

    it("keeps a nudge going until the drift is well inside the band", () => {
      const plan = planWebcamSync(
        input({
          cam: { time: 9.95, rate: 1 + NUDGE_RATE },
          rest: { smoothedDrift: -0.05, nudging: true },
        }),
      );
      expect(plan.nudging).toBe(true);
      expect(plan.camRate).toBe(null);
    });

    it("ends a nudge inside the inner band", () => {
      const plan = planWebcamSync(
        input({
          cam: { time: 10, rate: 1 + NUDGE_RATE },
          rest: { smoothedDrift: -0.015, nudging: true },
        }),
      );
      expect(plan.nudging).toBe(false);
      expect(plan.camRate).toBe(1);
    });

    it("forgets the drift while paused", () => {
      const plan = planWebcamSync(
        input({
          rest: { playing: false, smoothedDrift: -0.05, nudging: true },
        }),
      );
      expect(plan.smoothedDrift).toBe(null);
      expect(plan.nudging).toBe(false);
    });

    it("seeks the cam when drift is too large to nudge, ending any nudge", () => {
      const plan = planWebcamSync(
        input({ main: { time: 42 }, cam: { rate: 1 + NUDGE_RATE } }),
      );
      expect(plan).toMatchObject({ seekCamTo: 42, camRate: 1, hold: false });
    });
  });

  describe("cam buffering", () => {
    it("holds the screen so the voice doesn't drop out", () => {
      const plan = planWebcamSync(input({ cam: { stalled: true } }));
      expect(plan).toMatchObject({ hold: true, holdSince: 100_000 });
    });

    it("keeps the original hold start across frames", () => {
      const plan = planWebcamSync(
        input({ cam: { stalled: true }, rest: { holdSince: 98_000 } }),
      );
      expect(plan).toMatchObject({ hold: true, holdSince: 98_000 });
    });

    it("moves a cam stuck at an old position to the screen's time", () => {
      const plan = planWebcamSync(
        input({ main: { time: 30 }, cam: { stalled: true, time: 5 } }),
      );
      expect(plan).toMatchObject({ hold: true, seekCamTo: 30 });
    });

    it("doesn't seek again once the cam is already at the screen's time", () => {
      const plan = planWebcamSync(input({ cam: { stalled: true, time: 10 } }));
      expect(plan.seekCamTo).toBe(null);
    });

    it("releases the hold when the cam can play", () => {
      const plan = planWebcamSync(
        input({ cam: { paused: true }, rest: { holdSince: 99_000 } }),
      );
      expect(plan).toMatchObject({ hold: false, holdSince: null, cam: "play" });
    });

    it("gives up after the hold limit so a dead cam can't freeze playback", () => {
      const plan = planWebcamSync(
        input({
          cam: { stalled: true },
          rest: { holdSince: 100_000 - MAX_HOLD_MS },
        }),
      );
      expect(plan).toMatchObject({ hold: false, gaveUpAt: 100_000 });
    });

    it("doesn't hold again during the cooldown", () => {
      const plan = planWebcamSync(
        input({
          cam: { stalled: true },
          rest: { gaveUpAt: 100_000 - HOLD_COOLDOWN_MS + 1 },
        }),
      );
      expect(plan.hold).toBe(false);
    });

    it("can hold again after the cooldown", () => {
      const plan = planWebcamSync(
        input({
          cam: { stalled: true },
          rest: { gaveUpAt: 100_000 - HOLD_COOLDOWN_MS },
        }),
      );
      expect(plan.hold).toBe(true);
    });
  });

  it("does nothing mid-scrub", () => {
    const plan = planWebcamSync(
      input({ main: { time: 50 }, rest: { scrubbing: true } }),
    );
    expect(plan).toMatchObject(idle);
  });

  it("stops managing a cam track that has ended", () => {
    const plan = planWebcamSync(
      input({ main: { time: 50 }, cam: { stalled: true, done: true } }),
    );
    expect(plan).toMatchObject({ ...idle, camRate: null });
  });
});
