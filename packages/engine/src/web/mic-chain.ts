/*
 * Voice chain for a recorded mic, in place of the browser's call-tuned
 * processing: a high-pass takes desk and fan rumble out from under the voice,
 * a compressor evens the level out (Web Audio's applies its own makeup gain,
 * which lifts a quiet laptop mic to a speaking level), and a limiter holds
 * the peaks short of clipping. Measured on a MacBook mic: -33 dB RMS in,
 * -23 dB out; a hot -22 dB mic comes out at -19 dB with peaks under -3 dB.
 */
export const MIC_CHAIN = {
  highpassHz: 90,
  compressor: {
    threshold: -30,
    knee: 10,
    ratio: 6,
    attack: 0.005,
    release: 0.2,
  },
  limiter: {
    threshold: -3,
    knee: 0,
    ratio: 20,
    attack: 0.001,
    release: 0.1,
  },
} as const;

export type MicChain = {
  stream: MediaStream;
  close(): Promise<void>;
};

export function openMicChain(micTrack: MediaStreamTrack): MicChain {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(new MediaStream([micTrack]));
  const highpass = new BiquadFilterNode(context, {
    type: "highpass",
    frequency: MIC_CHAIN.highpassHz,
    Q: 0.7,
  });
  const compressor = new DynamicsCompressorNode(context, MIC_CHAIN.compressor);
  const limiter = new DynamicsCompressorNode(context, MIC_CHAIN.limiter);
  const sink = context.createMediaStreamDestination();
  source.connect(highpass).connect(compressor).connect(limiter).connect(sink);
  void context.resume();
  return {
    stream: sink.stream,
    close: () => context.close(),
  };
}
