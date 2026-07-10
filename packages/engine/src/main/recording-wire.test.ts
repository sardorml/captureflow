import { describe, expect, it, vi } from "vitest";
import { createRecordingWireParser } from "./recording-wire";
import type { RecordingFrameEvent } from "../types";

function formatRecord(
  width: number,
  height: number,
  fps: number,
  desc: number[],
): Buffer {
  const b = Buffer.alloc(17 + desc.length);
  b.writeUInt8(0x01, 0);
  b.writeUInt32LE(width, 1);
  b.writeUInt32LE(height, 5);
  b.writeUInt32LE(fps, 9);
  b.writeUInt32LE(desc.length, 13);
  Buffer.from(desc).copy(b, 17);
  return b;
}

function videoRecord(
  isKey: boolean,
  ptsUs: number,
  durationUs: number,
  data: number[],
): Buffer {
  const b = Buffer.alloc(18 + data.length);
  b.writeUInt8(0x02, 0);
  b.writeUInt8(isKey ? 1 : 0, 1);
  b.writeBigInt64LE(BigInt(ptsUs), 2);
  b.writeUInt32LE(durationUs, 10);
  b.writeUInt32LE(data.length, 14);
  Buffer.from(data).copy(b, 18);
  return b;
}

function audioFormatRecord(
  sampleRate: number,
  channels: number,
  desc: number[],
): Buffer {
  const b = Buffer.alloc(13 + desc.length);
  b.writeUInt8(0x03, 0);
  b.writeUInt32LE(sampleRate, 1);
  b.writeUInt32LE(channels, 5);
  b.writeUInt32LE(desc.length, 9);
  Buffer.from(desc).copy(b, 13);
  return b;
}

function audioRecord(
  ptsUs: number,
  durationUs: number,
  data: number[],
): Buffer {
  const b = Buffer.alloc(17 + data.length);
  b.writeUInt8(0x04, 0);
  b.writeBigInt64LE(BigInt(ptsUs), 1);
  b.writeUInt32LE(durationUs, 9);
  b.writeUInt32LE(data.length, 13);
  Buffer.from(data).copy(b, 17);
  return b;
}

function collect(): {
  events: RecordingFrameEvent[];
  onEvent: (e: RecordingFrameEvent) => void;
} {
  const events: RecordingFrameEvent[] = [];
  return { events, onEvent: (e) => events.push(e) };
}

describe("createRecordingWireParser", () => {
  it("parses a video format record", () => {
    const { events, onEvent } = collect();
    const parser = createRecordingWireParser(onEvent);
    parser.push(formatRecord(1920, 1080, 60, [1, 2, 3, 4]));
    expect(events).toEqual([
      {
        kind: "format",
        codedWidth: 1920,
        codedHeight: 1080,
        fps: 60,
        description: new Uint8Array([1, 2, 3, 4]),
      },
    ]);
  });

  it("parses key and delta video chunks", () => {
    const { events, onEvent } = collect();
    const parser = createRecordingWireParser(onEvent);
    parser.push(
      Buffer.concat([
        videoRecord(true, 0, 16_666, [9, 9]),
        videoRecord(false, 16_666, 16_666, [7]),
      ]),
    );
    expect(events).toEqual([
      {
        kind: "chunk",
        type: "key",
        timestamp: 0,
        duration: 16_666,
        data: new Uint8Array([9, 9]),
      },
      {
        kind: "chunk",
        type: "delta",
        timestamp: 16_666,
        duration: 16_666,
        data: new Uint8Array([7]),
      },
    ]);
  });

  it("parses audio format and audio chunks", () => {
    const { events, onEvent } = collect();
    const parser = createRecordingWireParser(onEvent);
    parser.push(
      Buffer.concat([
        audioFormatRecord(48_000, 2, [0x11, 0x90]),
        audioRecord(0, 21_333, [5, 5, 5]),
      ]),
    );
    expect(events).toEqual([
      {
        kind: "audio-format",
        sampleRate: 48_000,
        numberOfChannels: 2,
        description: new Uint8Array([0x11, 0x90]),
      },
      {
        kind: "audio-chunk",
        timestamp: 0,
        duration: 21_333,
        data: new Uint8Array([5, 5, 5]),
      },
    ]);
  });

  it("reassembles records split across arbitrary push boundaries", () => {
    const { events, onEvent } = collect();
    const parser = createRecordingWireParser(onEvent);
    const wire = Buffer.concat([
      formatRecord(1280, 720, 30, [1, 2]),
      videoRecord(true, 100, 200, [3, 4, 5]),
      Buffer.from([0xff]),
    ]);
    for (let i = 0; i < wire.length; i += 3) {
      parser.push(wire.subarray(i, Math.min(i + 3, wire.length)));
    }
    expect(events.map((e) => e.kind)).toEqual(["format", "chunk", "end"]);
    expect(events[1]).toMatchObject({
      timestamp: 100,
      duration: 200,
      data: new Uint8Array([3, 4, 5]),
    });
  });

  it("emits end-of-stream on 0xFF", () => {
    const { events, onEvent } = collect();
    const parser = createRecordingWireParser(onEvent);
    parser.push(Buffer.from([0xff]));
    expect(events).toEqual([{ kind: "end" }]);
  });

  it("drops the buffered remainder on an unknown tag", () => {
    const { events, onEvent } = collect();
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const parser = createRecordingWireParser(onEvent, logger);
    parser.push(
      Buffer.concat([
        Buffer.from([0xab, 1, 2, 3]),
        videoRecord(true, 0, 1, []),
      ]),
    );
    expect(events).toEqual([]);
    expect(logger.error).toHaveBeenCalledOnce();
    // The next push starts on a clean buffer.
    parser.push(formatRecord(640, 480, 24, []));
    expect(events.map((e) => e.kind)).toEqual(["format"]);
  });

  it("warns about unparsed bytes at stream end", () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const parser = createRecordingWireParser(() => {}, logger);
    parser.push(formatRecord(1920, 1080, 60, [1, 2, 3]).subarray(0, 10));
    parser.end();
    expect(logger.warn).toHaveBeenCalledWith(
      "recorder",
      expect.stringContaining("10B unparsed"),
    );
  });

  it("ends cleanly with an empty buffer", () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const parser = createRecordingWireParser(() => {}, logger);
    parser.push(Buffer.from([0xff]));
    parser.end();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
