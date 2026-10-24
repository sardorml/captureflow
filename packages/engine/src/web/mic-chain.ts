/*
 * Voice chain for a recorded mic, in place of the browser's call-tuned
 * processing: a high-pass takes desk and fan rumble out from under the voice,
 * a compressor with makeup gain brings a quiet laptop mic up to a speaking
 * level without riding between words, and a limiter holds the peaks short of
 * clipping.
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
  makeupDb: 12,
  limiter: {
    threshold: -3,
    knee: 0,
    ratio: 20,
    attack: 0.001,
    release: 0.1,
  },
} as const;

export function dbToGain(db: number): number {
  return 10 ** (db / 20);
}

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
  const makeup = new GainNode(context, { gain: dbToGain(MIC_CHAIN.makeupDb) });
  const limiter = new DynamicsCompressorNode(context, MIC_CHAIN.limiter);
  const sink = context.createMediaStreamDestination();
  source
    .connect(highpass)
    .connect(compressor)
    .connect(makeup)
    .connect(limiter)
    .connect(sink);
  void context.resume();
  return {
    stream: sink.stream,
    close: () => context.close(),
  };
}
