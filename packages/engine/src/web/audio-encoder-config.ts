import { aacBitrateCandidates } from "./aac-bitrate";

const AAC_CODEC = "mp4a.40.2";
const OPUS_CODEC = "opus";

export type AudioContainerCodec = "aac" | "opus";

export type RequestedAudio = {
  sampleRate: number;
  numberOfChannels: number;
  bitrate: number;
};

/*
 * Encoder configs for the mic in the order they are tried: AAC at the
 * preset's rate and each step above it, then Opus. Chrome on desktop Linux
 * has no AAC encoder at all (crbug.com/40942807); Opus in the same fMP4 keeps
 * the mic there instead of dropping it.
 */
export function audioEncoderCandidates(
  requested: RequestedAudio,
): AudioEncoderConfig[] {
  return [
    ...aacBitrateCandidates(requested.bitrate).map((bitrate) => ({
      ...requested,
      codec: AAC_CODEC,
      bitrate,
    })),
    { ...requested, codec: OPUS_CODEC },
  ];
}

export function containerCodec(
  config: AudioEncoderConfig,
): AudioContainerCodec {
  return config.codec === OPUS_CODEC ? "opus" : "aac";
}
