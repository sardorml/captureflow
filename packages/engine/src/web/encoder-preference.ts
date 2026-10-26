/*
 * Fed tab-capture frames, the macOS hardware H.264 encoder stalls on
 * keyframes at every bitrate tried, from 1.5 to 5 Mbps, close to three
 * seconds at the start and shorter stalls after; while it stalls the GPU
 * process delivers no frames to anything, the camera included, and only the
 * mic goes on. The software encoder never holds those frames, so every
 * preset uses it.
 */
export type EncoderAcceleration = "prefer-hardware" | "prefer-software";

export const ENCODER_ACCELERATION: EncoderAcceleration = "prefer-software";
