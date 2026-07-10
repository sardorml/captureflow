import type { RecordingFrameEvent } from "../types";
import { noopLogger, type EngineLogger } from "./logger";

// On-wire layout of the binary records the native RecordingWriter emits on the
// streaming pipe (all multi-byte ints little-endian):
//   tag 0x01 — video format desc, sent once after first encode:
//     u32 width | u32 height | u32 fps | u32 descLen | descLen bytes (avcC)
//   tag 0x02 — encoded video chunk, one per output frame:
//     u8 flags (bit0=key) | i64 ptsUs | u32 durationUs | u32 dataLen | dataLen bytes
//   tag 0x03 — audio format, sent once before the first audio chunk:
//     u32 sampleRate | u32 channelCount | u32 descLen |
//     descLen bytes (AudioSpecificConfig)
//   tag 0x04 — encoded audio chunk, one per AAC packet:
//     i64 ptsUs | u32 durationUs | u32 dataLen | dataLen bytes (raw AAC)
//   tag 0xFF — end of stream (1 byte total).

export type RecordingWireParser = {
  push(chunk: Uint8Array): void;
  end(): void;
};

export function createRecordingWireParser(
  onEvent: (event: RecordingFrameEvent) => void,
  logger: EngineLogger = noopLogger,
): RecordingWireParser {
  // Plain Buffer (not an ArrayBuffer-backed alloc) to match the stream chunks'
  // looser ArrayBufferLike backing under TS strict mode.
  let buf: Buffer = Buffer.concat([]);
  let recordingFrameCount = 0;
  let recordingKeyCount = 0;
  let formatEmitted = false;

  function push(chunk: Uint8Array): void {
    const incoming = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    buf = buf.length === 0 ? incoming : Buffer.concat([buf, incoming]);
    while (buf.length > 0) {
      const tag = buf.readUInt8(0);
      if (tag === 0x01) {
        if (buf.length < 1 + 16) break;
        const width = buf.readUInt32LE(1);
        const height = buf.readUInt32LE(5);
        const fps = buf.readUInt32LE(9);
        const descLen = buf.readUInt32LE(13);
        const total = 1 + 16 + descLen;
        if (buf.length < total) break;
        const description = new Uint8Array(buf.slice(17, 17 + descLen));
        buf = buf.slice(total);
        formatEmitted = true;
        logger.info(
          "recording",
          `format: ${width}x${height}@${fps}fps, descLen=${descLen}`,
        );
        onEvent({
          kind: "format",
          codedWidth: width,
          codedHeight: height,
          fps,
          description,
        });
      } else if (tag === 0x02) {
        if (buf.length < 1 + 1 + 8 + 4 + 4) break;
        const flags = buf.readUInt8(1);
        const isKey = (flags & 0x01) !== 0;
        const ptsUs = Number(buf.readBigInt64LE(2));
        const durationUs = buf.readUInt32LE(10);
        const dataLen = buf.readUInt32LE(14);
        const total = 1 + 1 + 8 + 4 + 4 + dataLen;
        if (buf.length < total) break;
        const data = new Uint8Array(buf.slice(18, 18 + dataLen));
        buf = buf.slice(total);
        recordingFrameCount++;
        if (isKey) recordingKeyCount++;
        onEvent({
          kind: "chunk",
          type: isKey ? "key" : "delta",
          timestamp: ptsUs,
          duration: durationUs,
          data,
        });
      } else if (tag === 0x03) {
        if (buf.length < 1 + 12) break;
        const sampleRate = buf.readUInt32LE(1);
        const channelCount = buf.readUInt32LE(5);
        const descLen = buf.readUInt32LE(9);
        const total = 1 + 12 + descLen;
        if (buf.length < total) break;
        const description = new Uint8Array(buf.slice(13, 13 + descLen));
        buf = buf.slice(total);
        logger.info(
          "recording",
          `audio-format: ${sampleRate}Hz, ${channelCount}ch, descLen=${descLen}`,
        );
        onEvent({
          kind: "audio-format",
          sampleRate,
          numberOfChannels: channelCount,
          description,
        });
      } else if (tag === 0x04) {
        if (buf.length < 1 + 8 + 4 + 4) break;
        const ptsUs = Number(buf.readBigInt64LE(1));
        const durationUs = buf.readUInt32LE(9);
        const dataLen = buf.readUInt32LE(13);
        const total = 1 + 8 + 4 + 4 + dataLen;
        if (buf.length < total) break;
        const data = new Uint8Array(buf.slice(17, 17 + dataLen));
        buf = buf.slice(total);
        onEvent({
          kind: "audio-chunk",
          timestamp: ptsUs,
          duration: durationUs,
          data,
        });
      } else if (tag === 0xff) {
        buf = buf.slice(1);
        logger.info(
          "recording",
          `end-of-stream: frames=${recordingFrameCount}, keyframes=${recordingKeyCount}, formatEmitted=${formatEmitted}`,
        );
        onEvent({ kind: "end" });
      } else {
        // Unknown tag means the wire is desynced; drop the rest so payload
        // bytes aren't misread as headers.
        logger.error(
          "recorder",
          `recording-reader: unknown tag 0x${tag.toString(16)}, dropping ${buf.length}B`,
        );
        buf = Buffer.alloc(0);
        break;
      }
    }
  }

  function end(): void {
    if (buf.length > 0) {
      logger.warn(
        "recorder",
        `recording-reader: ${buf.length}B unparsed at stream end`,
      );
    }
  }

  return { push, end };
}
