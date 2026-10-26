/*
 * Below this bitrate the macOS hardware H.264 encoder stalls on a keyframe
 * when fed tab-capture frames, close to three seconds at 1.5 Mbps and still
 * visibly at 2.5 Mbps, and while it stalls the GPU process delivers no frames
 * to anything, the camera included; the mic alone keeps going. The software
 * encoder never holds those frames, so Data saver, Low and Balanced use it
 * and the hardware encoder keeps High and Maximum.
 */
export const SOFTWARE_ENCODE_BELOW_BPS = 3_000_000;

export type EncoderAcceleration = "prefer-hardware" | "prefer-software";

export function encoderAccelerationFor(bitrate: number): EncoderAcceleration {
  return bitrate < SOFTWARE_ENCODE_BELOW_BPS
    ? "prefer-software"
    : "prefer-hardware";
}
