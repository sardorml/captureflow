/*
 * Below this bitrate the macOS hardware H.264 encoder stalls for seconds on a
 * keyframe when fed tab-capture frames, and while it stalls the GPU process
 * delivers no frames to anything, the camera included; the mic alone keeps
 * going. The software encoder never holds those frames, so the low presets
 * use it and the hardware encoder keeps the rest.
 */
export const SOFTWARE_ENCODE_BELOW_BPS = 2_000_000;

export type EncoderAcceleration = "prefer-hardware" | "prefer-software";

export function encoderAccelerationFor(bitrate: number): EncoderAcceleration {
  return bitrate < SOFTWARE_ENCODE_BELOW_BPS
    ? "prefer-software"
    : "prefer-hardware";
}
