import { describe, expect, it } from "vitest";
import { createFmp4Muxer } from "../web/fmp4-mux";
import { concat, fourcc, readerFromBytes, view } from "./bytes";
import {
  createIndexedRecording,
  finishRecordingFile,
  indexRecordingFile,
  type RecordingFile,
} from "./recording-file";

function memoryFile(): RecordingFile & { bytes(): Uint8Array } {
  let bytes = new Uint8Array(0);
  return {
    get size() {
      return bytes.byteLength;
    },
    bytes: () => bytes,
    async read(offset, length) {
      return bytes.slice(offset, offset + length);
    },
    async append(chunk) {
      const next = new Uint8Array(bytes.byteLength + chunk.byteLength);
      next.set(bytes);
      next.set(chunk, bytes.byteLength);
      bytes = next;
    },
    async write(offset, chunk) {
      bytes.set(chunk, offset);
    },
    async truncate(size) {
      bytes = bytes.slice(0, size);
    },
  };
}

function record(target: { push(b: Uint8Array): void }, seconds: number) {
  const muxer = createFmp4Muxer({
    video: { width: 64, height: 64, frameRate: 30 },
    output: (bytes) => target.push(bytes.slice()),
  });
  for (let i = 0; i < seconds * 30; i++) {
    muxer.addVideoChunkRaw(
      new Uint8Array(300),
      i % 60 === 0 ? "key" : "delta",
      (i * 1_000_000) / 30,
      1_000_000 / 30,
      i === 0
        ? {
            decoderConfig: {
              codec: "avc1.42001f",
              codedWidth: 64,
              codedHeight: 64,
              description: new Uint8Array([1, 0x42, 0, 0x1f, 0xff, 0xe0, 0]),
            },
          }
        : undefined,
    );
  }
  return muxer;
}

function sidxCount(bytes: Uint8Array): number {
  for (
    let at = 0;
    at + 8 <= bytes.byteLength;
    at += view(bytes).getUint32(at)
  ) {
    if (fourcc(bytes, at + 4) === "sidx") return view(bytes).getUint16(at + 38);
  }
  return 0;
}

describe("createIndexedRecording", () => {
  it("writes the stream to the file and the index on finish", async () => {
    const file = memoryFile();
    const recording = createIndexedRecording("mp4", file);
    record(recording, 10).finalize();
    const { size, durationMs } = await recording.finish();
    expect(size).toBe(file.size);
    expect(durationMs).toBe(10_000);
    expect(sidxCount(file.bytes())).toBe(5);
  });
});

describe("finishRecordingFile", () => {
  it("recovers a file cut off mid-fragment by a crash", async () => {
    const file = memoryFile();
    const recording = createIndexedRecording("mp4", file);
    record(recording, 10);
    await recording.flushed();
    await file.append(
      new Uint8Array([0, 0, 0x40, 0, 0x6d, 0x6f, 0x6f, 0x66, 1, 2, 3]),
    );
    const before = file.size;

    await finishRecordingFile("mp4", file);
    expect(file.size).toBeLessThan(before);
    expect(sidxCount(file.bytes())).toBeGreaterThan(0);
  });

  it("is safe to run twice", async () => {
    const file = memoryFile();
    const recording = createIndexedRecording("mp4", file);
    record(recording, 6).finalize();
    await recording.finish();
    const once = file.bytes().slice();
    await finishRecordingFile("mp4", file);
    expect(file.bytes()).toEqual(once);
  });
});

describe("indexRecordingFile", () => {
  function unindexed(seconds: number): Uint8Array {
    const chunks: Uint8Array[] = [];
    record({ push: (b) => chunks.push(b) }, seconds).finalize();
    return concat(chunks);
  }

  it("adds the index to a recording made without one", async () => {
    const source = unindexed(10);
    expect(sidxCount(source)).toBe(0);
    const target = memoryFile();
    const result = await indexRecordingFile(
      "mp4",
      readerFromBytes(source),
      target,
    );
    expect(result).toEqual({ size: target.size, durationMs: 10_000 });
    expect(sidxCount(target.bytes())).toBe(5);
  });

  it("leaves an indexed recording alone", async () => {
    const indexed = memoryFile();
    const recording = createIndexedRecording("mp4", indexed);
    record(recording, 4).finalize();
    await recording.finish();
    const target = memoryFile();
    expect(
      await indexRecordingFile("mp4", readerFromBytes(indexed.bytes()), target),
    ).toBeNull();
    expect(target.size).toBe(0);
  });

  it("leaves a file that isn't a fragmented MP4 alone", async () => {
    const target = memoryFile();
    expect(
      await indexRecordingFile(
        "mp4",
        readerFromBytes(new Uint8Array(4096).fill(7)),
        target,
      ),
    ).toBeNull();
    expect(target.size).toBe(0);
  });
});
