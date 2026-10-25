// Platform AAC encoders refuse low rates (Brave on macOS rejects 48 kbps at
// every channel count), so a preset's rate is tried first and then each
// higher step until one is accepted.
const AAC_BITRATE_STEPS = [64_000, 96_000, 128_000];

export function aacBitrateCandidates(requested: number): number[] {
  return [requested, ...AAC_BITRATE_STEPS.filter((step) => step > requested)];
}
