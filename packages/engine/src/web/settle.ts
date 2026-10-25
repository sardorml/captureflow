/*
 * Tells when a burst of motion has just come to rest, from a tiny luma
 * thumbnail of each frame. Under a tight bitrate ceiling a fast scroll leaves
 * the encoder with a smeared reference that takes seconds to refine; a
 * keyframe at the moment the page settles restores it at once.
 */
const MOVE_THRESHOLD = 4;
const MOVING_FRAMES = 3;
const STILL_FRAMES = 4;

export type SettleDetector = {
  /** True once per burst, on the frame the picture has held still long enough. */
  note(luma: ArrayLike<number>): boolean;
};

export function createSettleDetector(): SettleDetector {
  let prev: ArrayLike<number> | null = null;
  let moving = 0;
  let still = 0;
  return {
    note(luma) {
      const last = prev;
      prev = luma;
      if (!last || last.length !== luma.length) return false;
      let diff = 0;
      for (let i = 0; i < luma.length; i++)
        diff += Math.abs(luma[i]! - last[i]!);
      diff /= luma.length;
      if (diff > MOVE_THRESHOLD) {
        moving++;
        still = 0;
        return false;
      }
      if (moving < MOVING_FRAMES) {
        moving = 0;
        return false;
      }
      still++;
      if (still < STILL_FRAMES) return false;
      moving = 0;
      still = 0;
      return true;
    },
  };
}
