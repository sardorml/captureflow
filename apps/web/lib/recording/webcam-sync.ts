/*
 * Keeps the webcam PiP (which carries the mic) in step with the screen video.
 * Pure: the player samples both elements every frame and applies the plan.
 *
 * The screen is master. When it buffers, its clock freezes while still
 * "playing", so the cam must pause rather than run ahead and get yanked back
 * with seeks (each seek flushes the cam's audio decoder, heard as stutter).
 * When the cam buffers, the screen holds so the voice doesn't drop out, but
 * only for so long: a cam that never recovers mustn't freeze playback.
 *
 * `stalled` means an element can't advance from where it is (buffering or
 * mid-seek); `playing` is the viewer's intent, so a sync hold doesn't count
 * as paused.
 */

export const HARD_RESYNC_S = 0.25;
export const NUDGE_DEAD_ZONE_S = 0.04;
export const NUDGE_RATE = 0.04;
export const MAX_HOLD_MS = 6000;
export const HOLD_COOLDOWN_MS = 10_000;

export type MediaSample = {
  paused: boolean;
  time: number;
  rate: number;
  stalled: boolean;
};

export type SyncInput = {
  now: number;
  playing: boolean;
  scrubbing: boolean;
  main: MediaSample;
  cam: MediaSample & { done: boolean };
  holdSince: number | null;
  gaveUpAt: number | null;
};

export type SyncPlan = {
  cam: "play" | "pause" | null;
  seekCamTo: number | null;
  camRate: number | null;
  hold: boolean;
  holdSince: number | null;
  gaveUpAt: number | null;
};

export function planWebcamSync(input: SyncInput): SyncPlan {
  const { now, playing, scrubbing, main, cam } = input;
  const plan: SyncPlan = {
    cam: null,
    seekCamTo: null,
    camRate: null,
    hold: false,
    holdSince: null,
    gaveUpAt: input.gaveUpAt,
  };
  const pauseCam = () => {
    if (!cam.paused) plan.cam = "pause";
  };

  if (!playing || cam.done) {
    if (!cam.done) pauseCam();
    return plan;
  }
  if (scrubbing) return plan;

  if (main.stalled) {
    pauseCam();
    return plan;
  }

  const drift = cam.time - main.time;
  if (cam.stalled) {
    const coolingDown =
      input.gaveUpAt !== null && now - input.gaveUpAt < HOLD_COOLDOWN_MS;
    const holdSince = input.holdSince ?? now;
    if (coolingDown || now - holdSince >= MAX_HOLD_MS) {
      plan.gaveUpAt = coolingDown ? input.gaveUpAt : now;
      return plan;
    }
    pauseCam();
    // Buffering somewhere the screen has left: wait at the screen's time.
    if (Math.abs(drift) > HARD_RESYNC_S) plan.seekCamTo = main.time;
    plan.hold = true;
    plan.holdSince = holdSince;
    return plan;
  }

  if (cam.paused) plan.cam = "play";
  if (Math.abs(drift) > HARD_RESYNC_S) {
    plan.seekCamTo = main.time;
    plan.camRate = main.rate;
  } else if (Math.abs(drift) > NUDGE_DEAD_ZONE_S) {
    plan.camRate = main.rate + (drift < 0 ? NUDGE_RATE : -NUDGE_RATE);
  } else {
    plan.camRate = main.rate;
  }
  if (plan.camRate !== null && Math.abs(plan.camRate - cam.rate) <= 0.001) {
    plan.camRate = null;
  }
  return plan;
}
