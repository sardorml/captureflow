export const WAVEFORM_BUCKETS = 2000;
// Louder than this share of the buckets counts as a spike and is clipped, so
// one click doesn't flatten a quiet voice.
const NORMALISE_PERCENTILE = 0.98;

/*
 * Peak amplitude per bucket across all channels, scaled so that normal speech
 * fills the lane: the level at the 98th percentile becomes 1 and anything
 * above it clips.
 */
export function waveformBuckets(
  channels: readonly Float32Array[],
  bucketCount: number,
): Float32Array {
  const out = new Float32Array(bucketCount);
  const length = channels[0]?.length ?? 0;
  if (length === 0 || bucketCount <= 0) return out;
  for (let b = 0; b < bucketCount; b++) {
    const start = Math.floor((b * length) / bucketCount);
    const end = Math.max(
      start + 1,
      Math.floor(((b + 1) * length) / bucketCount),
    );
    let peak = 0;
    for (const channel of channels) {
      for (let i = start; i < end && i < channel.length; i++) {
        const v = Math.abs(channel[i]);
        if (v > peak) peak = v;
      }
    }
    out[b] = peak;
  }
  const sorted = Array.from(out).sort((a, b) => a - b);
  const ceiling =
    sorted[
      Math.min(
        sorted.length - 1,
        Math.floor(sorted.length * NORMALISE_PERCENTILE),
      )
    ];
  if (!ceiling || ceiling <= 0) return out;
  for (let i = 0; i < out.length; i++) out[i] = Math.min(1, out[i] / ceiling);
  return out;
}

// The loudest bucket within a span, for drawing fewer bars than buckets.
export function peakBetween(
  buckets: Float32Array,
  fromFraction: number,
  toFraction: number,
): number {
  const start = Math.max(0, Math.floor(fromFraction * buckets.length));
  const end = Math.min(
    buckets.length,
    Math.max(start + 1, Math.ceil(toFraction * buckets.length)),
  );
  let peak = 0;
  for (let i = start; i < end; i++) if (buckets[i] > peak) peak = buckets[i];
  return peak;
}
