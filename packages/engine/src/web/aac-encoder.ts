import createModule, { type AacModule } from "./vendor/aac/aac";

const AAC_CODEC = "mp4a.40.2";

export type AacEncoderConfig = {
  sampleRate: number;
  numberOfChannels: number;
  bitrate: number;
};

export type AacFrame = {
  data: Uint8Array;
  timestampUs: number;
  durationUs: number;
};

export type AacEncoder = {
  decoderConfig: AudioDecoderConfig;
  encode(data: AudioData): AacFrame[];
  flush(): AacFrame[];
  close(): void;
};

export type PcmInput = {
  planes: Float32Array[];
  frames: number;
  timestampUs: number;
};

export type PcmFrame = {
  samples: Float32Array;
  pts: number;
};

export type FrameFeeder = {
  push(input: PcmInput): PcmFrame[];
  drain(): PcmFrame | null;
};

/*
 * Cuts the mic's planar buffers into interleaved encoder frames, each stamped
 * in samples with the capture time of its first sample. Buffers that follow
 * each other on the capture clock keep one running count; a jump past one
 * frame (a pause) re-anchors the count instead of dragging the frame times.
 */
export function createFrameFeeder(
  frameSize: number,
  channels: number,
  sampleRate: number,
): FrameFeeder {
  const frameUs = (frameSize / sampleRate) * 1_000_000;
  let pending = new Float32Array(frameSize * channels * 2);
  let pendingFrames = 0;
  let startUs = 0;

  const take = (): PcmFrame => {
    const pts = Math.round((startUs * sampleRate) / 1_000_000);
    const samples = pending.slice(0, frameSize * channels);
    pending.copyWithin(0, frameSize * channels, pendingFrames * channels);
    pendingFrames -= frameSize;
    startUs += frameUs;
    return { samples, pts };
  };

  return {
    push(input) {
      const predictedUs = startUs + (pendingFrames / sampleRate) * 1_000_000;
      if (
        pendingFrames === 0 ||
        Math.abs(input.timestampUs - predictedUs) > frameUs
      ) {
        startUs = input.timestampUs - (pendingFrames / sampleRate) * 1_000_000;
      }
      const needed = (pendingFrames + input.frames) * channels;
      if (needed > pending.length) {
        const grown = new Float32Array(needed * 2);
        grown.set(pending.subarray(0, pendingFrames * channels));
        pending = grown;
      }
      for (let ch = 0; ch < channels; ch++) {
        const plane = input.planes[ch];
        for (let i = 0; i < input.frames; i++) {
          pending[(pendingFrames + i) * channels + ch] = plane?.[i] ?? 0;
        }
      }
      pendingFrames += input.frames;
      const out: PcmFrame[] = [];
      while (pendingFrames >= frameSize) out.push(take());
      return out;
    },
    drain() {
      if (pendingFrames === 0) return null;
      pending.fill(0, pendingFrames * channels, frameSize * channels);
      pendingFrames = frameSize;
      return take();
    },
  };
}

function planesOf(data: AudioData, channels: number): Float32Array[] {
  const planes: Float32Array[] = [];
  for (let ch = 0; ch < Math.min(channels, data.numberOfChannels); ch++) {
    const plane = new Float32Array(data.numberOfFrames);
    data.copyTo(plane, { planeIndex: ch, format: "f32-planar" });
    planes.push(plane);
  }
  return planes;
}

let modulePromise: Promise<AacModule> | null = null;

function loadModule(): Promise<AacModule> {
  modulePromise ??= createModule();
  return modulePromise;
}

// FFmpeg's AAC-LC encoder, so the file carries AAC on every platform rather
// than only where the browser ships an encoder of its own.
export async function createAacEncoder(
  config: AacEncoderConfig,
): Promise<AacEncoder> {
  const m = await loadModule();
  const init = m.cwrap("init_encoder", "number", [
    "number",
    "number",
    "number",
  ]);
  const frameSizeOf = m.cwrap("get_encoder_frame_size", "number", ["number"]);
  const extradata = m.cwrap("get_encoder_extradata", "number", ["number"]);
  const extradataSize = m.cwrap("get_encoder_extradata_size", "number", [
    "number",
  ]);
  const inputPtr = m.cwrap("get_encode_input_ptr", "number", [
    "number",
    "number",
  ]);
  const sendFrame = m.cwrap("send_frame", "number", ["number", "number"]);
  const receivePacket = m.cwrap("receive_packet", "number", ["number"]);
  const encodedData = m.cwrap("get_encoded_data", "number", ["number"]);
  const encodedPts = m.cwrap("get_encoded_pts", "number", ["number"]);
  const encodedDuration = m.cwrap("get_encoded_duration", "number", ["number"]);
  const flushStart = m.cwrap("flush_encoder_start", null, ["number"]);
  const reset = m.cwrap("reset_encoder", null, ["number"]);
  const closeEncoder = m.cwrap("close_encoder", null, ["number"]);

  const { sampleRate, numberOfChannels, bitrate } = config;
  const ctx = init(numberOfChannels, sampleRate, bitrate);
  if (ctx === 0) {
    throw new Error(
      `aac: encoder refused ${sampleRate} Hz, ${numberOfChannels} ch at ${bitrate} bps`,
    );
  }
  const frameSize = frameSizeOf(ctx);
  const descriptionPtr = extradata(ctx);
  const description = m.HEAPU8.slice(
    descriptionPtr,
    descriptionPtr + extradataSize(ctx),
  );
  const feeder = createFrameFeeder(frameSize, numberOfChannels, sampleRate);
  const toUs = (samples: number): number =>
    Math.round((samples / sampleRate) * 1_000_000);
  let closed = false;

  const drainPackets = (): AacFrame[] => {
    const frames: AacFrame[] = [];
    for (;;) {
      const size = receivePacket(ctx);
      if (size <= 0) break;
      const ptr = encodedData(ctx);
      frames.push({
        data: m.HEAPU8.slice(ptr, ptr + size),
        timestampUs: toUs(Number(encodedPts(ctx))),
        durationUs: toUs(encodedDuration(ctx)),
      });
    }
    return frames;
  };

  const encodeFrame = (frame: PcmFrame): AacFrame[] => {
    const bytes = new Uint8Array(
      frame.samples.buffer,
      frame.samples.byteOffset,
      frame.samples.byteLength,
    );
    const ptr = inputPtr(ctx, bytes.byteLength);
    if (ptr === 0) throw new Error("aac: no input buffer");
    m.HEAPU8.set(bytes, ptr);
    const ret = sendFrame(ctx, BigInt(frame.pts));
    if (ret < 0) throw new Error(`aac: encode failed (${ret})`);
    return drainPackets();
  };

  return {
    decoderConfig: {
      codec: AAC_CODEC,
      sampleRate,
      numberOfChannels,
      description,
    },
    encode(data) {
      if (closed) return [];
      const input = {
        planes: planesOf(data, numberOfChannels),
        frames: data.numberOfFrames,
        timestampUs: data.timestamp,
      };
      return feeder.push(input).flatMap(encodeFrame);
    },
    flush() {
      if (closed) return [];
      const last = feeder.drain();
      const frames = last ? encodeFrame(last) : [];
      flushStart(ctx);
      frames.push(...drainPackets());
      reset(ctx);
      return frames;
    },
    close() {
      if (closed) return;
      closed = true;
      closeEncoder(ctx);
    },
  };
}
