/*
 * Voice chain for a recorded mic, in place of the browser's call-tuned
 * processing: a high-pass takes desk and fan rumble out from under the voice,
 * a compressor evens the level out (Web Audio's applies its own makeup gain,
 * which lifts a quiet laptop mic to a speaking level), and a limiter holds
 * the peaks short of clipping. Measured on a MacBook mic: -33 dB RMS in,
 * -23 dB out; a hot -22 dB mic comes out at -19 dB with peaks under -3 dB.
 */
import { createPeakMeter, type PeakMeter } from "./peak-meter";

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
  peaks: PeakMeter;
  close(): Promise<void>;
};

// The chain runs at 48 kHz whatever the mic delivers: the platform AAC
// encoders take 44.1 or 48 kHz only, and a Bluetooth headset in call mode
// hands over 8 or 16 kHz, which left the mic out of the file.
const CHAIN_SAMPLE_RATE = 48_000;
const PEAK_BUFFER_SAMPLES = 4096;

export function openMicChain(micTrack: MediaStreamTrack): MicChain {
  const context = new AudioContext({ sampleRate: CHAIN_SAMPLE_RATE });
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
  // A ScriptProcessorNode only runs on the way to the destination, so the
  // meter reaches it through a muted gain.
  const meter = createPeakMeter();
  const tap = context.createScriptProcessor(PEAK_BUFFER_SAMPLES, 1, 1);
  tap.onaudioprocess = (e) => meter.push(e.inputBuffer.getChannelData(0));
  const mute = new GainNode(context, { gain: 0 });
  limiter.connect(tap).connect(mute).connect(context.destination);
  void context.resume();
  return {
    stream: sink.stream,
    peaks: meter,
    close: () => context.close(),
  };
}
