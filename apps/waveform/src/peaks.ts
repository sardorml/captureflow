export const WAVEFORM_BUCKETS = 2000;
const SAMPLES_PER_BLOCK = 16;
const BYTES_PER_SAMPLE = 4;

// Reads ffmpeg's 32-bit little-endian float samples. The length is only known
// at the end and a long recording won't fit in memory, so samples are reduced
// to blocks as they arrive and the blocks to buckets when they stop.
export function createPeakCollector(): {
  add: (chunk: Buffer) => void;
  finish: () => Float32Array;
} {
  const blocks: number[] = [];
  let tail: Buffer = Buffer.alloc(0);
  let peak = 0;
  let seen = 0;

  return {
    add(chunk) {
      const bytes = tail.length > 0 ? Buffer.concat([tail, chunk]) : chunk;
      const usable = bytes.length - (bytes.length % BYTES_PER_SAMPLE);
      for (let at = 0; at < usable; at += BYTES_PER_SAMPLE) {
        peak = Math.max(peak, Math.abs(bytes.readFloatLE(at)));
        if (++seen === SAMPLES_PER_BLOCK) {
          blocks.push(peak);
          peak = 0;
          seen = 0;
        }
      }
      tail = bytes.subarray(usable);
    },
    finish() {
      if (seen > 0) blocks.push(peak);
      const out = new Float32Array(WAVEFORM_BUCKETS);
      if (blocks.length === 0) return out;
      for (let b = 0; b < WAVEFORM_BUCKETS; b++) {
        const start = Math.floor((b * blocks.length) / WAVEFORM_BUCKETS);
        const end = Math.max(
          start + 1,
          Math.floor(((b + 1) * blocks.length) / WAVEFORM_BUCKETS),
        );
        let loudest = 0;
        for (let i = start; i < end && i < blocks.length; i++) {
          if (blocks[i]! > loudest) loudest = blocks[i]!;
        }
        out[b] = loudest;
      }
      return out;
    },
  };
}
