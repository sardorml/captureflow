/*
 * Writes a seek index into a recording made before recordings carried one:
 *
 *   tsx scripts/index-recording.ts <in> <out>
 *
 * Prints {"format", "indexed", "size", "durationMs"} as JSON. When indexed is
 * false nothing was written to <out> (already indexed, or not indexable).
 */
import { open, rm, type FileHandle } from "node:fs/promises";
import {
  indexRecordingFile,
  type ByteReader,
  type RecordingFile,
  type RecordingFormat,
} from "../src/media";

function reader(fh: FileHandle, size: number): ByteReader {
  return {
    size,
    async read(offset, length) {
      const bytes = new Uint8Array(
        Math.max(0, Math.min(length, size - offset)),
      );
      const { bytesRead } = await fh.read(bytes, 0, bytes.byteLength, offset);
      return bytes.subarray(0, bytesRead);
    },
  };
}

function writer(fh: FileHandle): RecordingFile {
  let size = 0;
  return {
    get size() {
      return size;
    },
    read: (offset, length) => reader(fh, size).read(offset, length),
    async append(bytes) {
      await fh.write(bytes, 0, bytes.byteLength, size);
      size += bytes.byteLength;
    },
    async write(offset, bytes) {
      await fh.write(bytes, 0, bytes.byteLength, offset);
      size = Math.max(size, offset + bytes.byteLength);
    },
    async truncate(next) {
      await fh.truncate(next);
      size = next;
    },
  };
}

async function formatOf(source: ByteReader): Promise<RecordingFormat | null> {
  const head = await source.read(0, 8);
  if (
    head[0] === 0x1a &&
    head[1] === 0x45 &&
    head[2] === 0xdf &&
    head[3] === 0xa3
  )
    return "webm";
  if (String.fromCharCode(...head.subarray(4, 8)) === "ftyp") return "mp4";
  return null;
}

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: tsx scripts/index-recording.ts <in> <out>");
  process.exit(2);
}

const src = await open(input, "r");
const source = reader(src, (await src.stat()).size);
const format = await formatOf(source);
const dst = await open(output, "w+");
const result = format
  ? await indexRecordingFile(format, source, writer(dst))
  : null;
await Promise.all([src.close(), dst.close()]);
if (!result) await rm(output, { force: true });
console.log(
  JSON.stringify({
    format,
    indexed: !!result,
    size: result?.size ?? source.size,
    durationMs: result?.durationMs ?? null,
  }),
);
