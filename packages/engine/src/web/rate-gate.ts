/*
 * A leaky bucket over the encoder's output, the hypothetical reference
 * decoder of H.264 Annex C: encoded bytes fill it, the ceiling drains it in
 * frame time, and a frame that finds it full is not encoded. Chrome's
 * software H.264 encoder cannot skip frames itself, so without this a fast
 * scroll or a playing thumbnail ran several times over the ceiling.
 */
const BUCKET_SECONDS = 2;

export type RateGate = {
  /** Every encoded chunk's size. */
  spent(bytes: number): void;
  /** True when the frame at this timestamp should be skipped. */
  over(timestampUs: number): boolean;
};

export function createRateGate(bitrate: number): RateGate {
  const capacityBits = bitrate * BUCKET_SECONDS;
  let bits = 0;
  let lastUs: number | null = null;
  return {
    spent(bytes) {
      bits += bytes * 8;
    },
    over(timestampUs) {
      if (lastUs !== null && timestampUs > lastUs) {
        bits = Math.max(0, bits - (bitrate * (timestampUs - lastUs)) / 1e6);
      }
      lastUs = timestampUs;
      return bits > capacityBits;
    },
  };
}
