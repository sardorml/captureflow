export type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// The native side writes length-prefixed H.264 + AAC LC records on the streaming
// pipe; the wire parser surfaces them as these events. See src/main/recording-wire.ts
// and native/mac/screen-recorder/RecordingWriter.swift for the on-wire layout.
export type RecordingFrameEvent =
  | {
      kind: "format";
      codedWidth: number;
      codedHeight: number;
      fps: number;
      // avcC box bytes (length-prefixed SPS/PPS), ready to hand to mp4-muxer's per-chunk decoderConfig.description.
      description: Uint8Array<ArrayBuffer>;
    }
  | {
      kind: "chunk";
      type: "key" | "delta";
      // Microseconds since the first emitted chunk.
      timestamp: number;
      duration: number;
      // Length-prefixed NAL units (avc format), ready for muxer.addVideoChunkRaw().
      data: Uint8Array;
    }
  | {
      kind: "audio-format";
      sampleRate: number;
      numberOfChannels: number;
      // AudioSpecificConfig bytes (the same 2-byte descriptor that sits inside an MP4 esds box). mp4-muxer's audio decoderConfig accepts these verbatim as `description`.
      description: Uint8Array<ArrayBuffer>;
    }
  | {
      kind: "audio-chunk";
      // Microseconds since the first audio packet — independent from the video clock; the muxer reconciles them via PTS at write time.
      timestamp: number;
      duration: number;
      // Raw AAC packet bytes (no ADTS header), ready for muxer.addAudioChunkRaw().
      data: Uint8Array;
    }
  | { kind: "end" };

export type WindowAtPoint = {
  id: number;
  name: string;
  owner: string;
  pid: number;
  bounds: WindowBounds;
  cornerRadius?: number;
  iconBase64?: string;
} | null;
