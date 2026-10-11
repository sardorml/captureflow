/*
 * Puts every track of one recording on a single timeline. Chrome stamps
 * screen and camera frames with a clock counting from system boot, and mic
 * samples with one counting from page load, so the raw timestamps of a screen
 * + mic recording sit days apart. mp4-muxer's cross-track offset assumes one
 * clock: it shifted the screen by the mic's base and left the video days into
 * the file, which played as one frozen frame over a multi-day duration.
 *
 * Each track keeps its own spacing and starts at the moment its first sample
 * was read (`now`, in µs since the clock was made). A track whose first chunk
 * reaches the muxer after another's never starts before it, so the muxer's
 * base, the earliest first timestamp, can't move once set.
 *
 * Per track: noteSample(raw) as each sample goes into its encoder, then
 * toShared(raw) on each encoded chunk.
 */
export type TrackClock = {
  noteSample(rawUs: number): void;
  toShared(rawUs: number): number;
};

export function createSharedClock(nowUs: () => number): () => TrackClock {
  const originUs = nowUs();
  let muxStartUs: number | null = null;

  return () => {
    let readAtUs: number | null = null;
    let firstRawUs = 0;
    let shiftUs: number | null = null;
    return {
      noteSample(rawUs) {
        if (readAtUs !== null) return;
        readAtUs = Math.max(0, nowUs() - originUs);
        firstRawUs = rawUs;
      },
      toShared(rawUs) {
        const startUs = Math.max(readAtUs ?? 0, muxStartUs ?? 0);
        muxStartUs ??= startUs;
        shiftUs ??= startUs - (readAtUs === null ? rawUs : firstRawUs);
        // An encoder may stamp its first output a little before its first
        // input (AAC priming); never below the muxer's start.
        return Math.max(rawUs + shiftUs, muxStartUs);
      },
    };
  };
}
