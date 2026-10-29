import {
  listUploadParts,
  listUploadSegments,
  putUploadPart,
  putUploadSegment,
} from "./db";
import {
  putObject,
  readObjectRange,
  uploadPart,
  type R2UploadedPart,
} from "./r2";
import { segmentPrefixFor } from "./object-keys";
import { isValidSlug } from "./slug";
import type { RecordingRow, RecordingStream, UploadSegment } from "./types";

/*
 * Segmented uploads (migration 0028). The recorder sends its file as small
 * byte-addressed pieces while it records; R2 wants 5 MiB multipart parts, so
 * every whole part the pieces cover is copied into the multipart upload as it
 * fills, and finalize builds what is left. Part 1 is always built last: the
 * recorder rewrites the file's first bytes with the seek index when it stops.
 */
export const PART_BYTES = 5 * 1024 * 1024;
export const MAX_SEGMENT_BYTES = 16 * 1024 * 1024;
const MAX_OFFSET = 10_000 * PART_BYTES;
// Parts held in memory at once while building; a Worker has 128 MB.
const BUILD_CONCURRENCY = 3;

export type SegmentRead = { offset: number; start: number; length: number };

export type SegmentTarget = { storageKey: string; uploadId: string };

export type StreamParams = { slug: string; stream: RecordingStream };

export type SegmentParams = StreamParams & { offset: number };

export function hydrateStreamParams(
  params: URLSearchParams,
): StreamParams | null {
  const slug = params.get("slug");
  const stream = params.get("stream") ?? "screen";
  if (!isValidSlug(slug) || (stream !== "screen" && stream !== "webcam"))
    return null;
  return { slug, stream };
}

export function hydrateSegmentParams(
  params: URLSearchParams,
): SegmentParams | null {
  const target = hydrateStreamParams(params);
  const rawOffset = params.get("offset");
  if (!target || !rawOffset) return null;
  const offset = Number(rawOffset);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > MAX_OFFSET)
    return null;
  return { ...target, offset };
}

// The multipart upload a stream's pieces go into, or null once it is closed.
export function segmentTarget(
  row: RecordingRow,
  stream: RecordingStream,
): SegmentTarget | null {
  if (row.state !== "pending") return null;
  if (stream === "screen") {
    return row.uploadId
      ? { storageKey: row.storageKey, uploadId: row.uploadId }
      : null;
  }
  if (row.webcamState !== "pending") return null;
  return row.webcamUploadId && row.webcamStorageKey
    ? { storageKey: row.webcamStorageKey, uploadId: row.webcamUploadId }
    : null;
}

function segmentKey(storageKey: string, offset: number): string {
  return `${segmentPrefixFor(storageKey)}${offset}`;
}

// How far from `from` the pieces reach without a gap.
export function coveredBytes(segments: UploadSegment[], from = 0): number {
  let end = from;
  for (const s of [...segments].sort((a, b) => a.offset - b.offset)) {
    if (s.offset > end) break;
    end = Math.max(end, s.offset + s.size);
  }
  return end;
}

/*
 * The reads that make up [start, end), or null if a byte is missing. Pieces
 * may overlap (a resumed upload sends the file again in other cuts); the
 * bytes agree, so the longest-reaching piece is taken at each point.
 */
export function planReads(
  segments: UploadSegment[],
  start: number,
  end: number,
): SegmentRead[] | null {
  const reads: SegmentRead[] = [];
  let at = start;
  while (at < end) {
    let best: UploadSegment | null = null;
    for (const s of segments) {
      if (s.offset <= at && at < s.offset + s.size) {
        if (!best || s.offset + s.size > best.offset + best.size) best = s;
      }
    }
    if (!best) return null;
    const length = Math.min(end, best.offset + best.size) - at;
    reads.push({ offset: best.offset, start: at - best.offset, length });
    at += length;
  }
  return reads;
}

/*
 * Where the pieces are known to reach without reading them: parts 2..k
 * built while recording mean bytes [0, k·P) were all there.
 */
export function builtThrough(built: Set<number>): number {
  let k = 1;
  while (built.has(k + 1)) k++;
  return k === 1 ? 0 : k * PART_BYTES;
}

// Parts 2.. that the pieces fully cover and nobody has built yet.
export function partsReadyToBuild(
  covered: number,
  built: Set<number>,
): number[] {
  const ready: number[] = [];
  for (let n = 2; n * PART_BYTES <= covered; n++) {
    if (!built.has(n)) ready.push(n);
  }
  return ready;
}

/*
 * The parts a file of sizeBytes is completed from: a part built while
 * recording is kept only if it is whole and inside the final size (a crash
 * cuts the file back), and part 1 is always rebuilt for the index.
 */
export function partsToBuild(sizeBytes: number, built: Set<number>): number[] {
  const last = Math.max(1, Math.ceil(sizeBytes / PART_BYTES));
  const rebuild: number[] = [];
  for (let n = 1; n <= last; n++) {
    if (n === 1 || !built.has(n) || n * PART_BYTES > sizeBytes) rebuild.push(n);
  }
  return rebuild;
}

export async function storeSegment(
  slug: string,
  stream: RecordingStream,
  target: SegmentTarget,
  offset: number,
  body: ArrayBuffer,
): Promise<void> {
  await putObject(
    segmentKey(target.storageKey, offset),
    body,
    "application/octet-stream",
    "no-store",
  );
  await putUploadSegment(slug, stream, { offset, size: body.byteLength });
}

async function buildPart(
  target: SegmentTarget,
  segments: UploadSegment[],
  partNumber: number,
  sizeBytes: number,
): Promise<R2UploadedPart> {
  const start = (partNumber - 1) * PART_BYTES;
  const end = Math.min(partNumber * PART_BYTES, sizeBytes);
  const reads = planReads(segments, start, end);
  if (!reads) throw new Error(`segments miss part ${partNumber}`);
  const chunks = await Promise.all(
    reads.map(async (r) => {
      const bytes = await readObjectRange(
        segmentKey(target.storageKey, r.offset),
        r.start,
        r.length,
      );
      if (!bytes || bytes.byteLength !== r.length) {
        throw new Error(`segment ${r.offset} is short`);
      }
      return bytes;
    }),
  );
  const body = new Uint8Array(end - start);
  let at = 0;
  for (const chunk of chunks) {
    body.set(chunk, at);
    at += chunk.byteLength;
  }
  return uploadPart(
    target.storageKey,
    target.uploadId,
    partNumber,
    body.buffer,
  );
}

async function inBatches<T, R>(
  items: T[],
  size: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return out;
}

// Reads only the pieces past the parts already built.
async function uploadProgress(slug: string, stream: RecordingStream) {
  const built = new Set(
    (await listUploadParts(slug, stream)).map((p) => p.partNumber),
  );
  const base = builtThrough(built);
  const segments = await listUploadSegments(
    slug,
    stream,
    Math.max(0, base - MAX_SEGMENT_BYTES),
  );
  return { built, segments, covered: coveredBytes(segments, base) };
}

// How far from byte 0 the server has the stream without a gap.
export async function uploadedThrough(
  slug: string,
  stream: RecordingStream,
): Promise<number> {
  return (await uploadProgress(slug, stream)).covered;
}

// Runs after each piece lands; finalize builds anything this misses.
export async function buildCoveredParts(
  slug: string,
  stream: RecordingStream,
  target: SegmentTarget,
): Promise<void> {
  const { built, segments, covered } = await uploadProgress(slug, stream);
  const ready = partsReadyToBuild(covered, built);
  for (const n of ready) {
    const part = await buildPart(target, segments, n, n * PART_BYTES);
    await putUploadPart(slug, stream, part);
  }
}

// Null when the pieces don't cover the file yet.
export async function completeSegmentParts(
  slug: string,
  stream: RecordingStream,
  target: SegmentTarget,
  sizeBytes: number,
): Promise<R2UploadedPart[] | null> {
  const [segments, built] = await Promise.all([
    listUploadSegments(slug, stream),
    listUploadParts(slug, stream),
  ]);
  if (coveredBytes(segments) < sizeBytes) return null;
  const kept = new Map(built.map((p) => [p.partNumber, p]));
  const rebuild = partsToBuild(sizeBytes, new Set(kept.keys()));
  const fresh = await inBatches(rebuild, BUILD_CONCURRENCY, (n) =>
    buildPart(target, segments, n, sizeBytes),
  );
  for (const part of fresh) kept.set(part.partNumber, part);
  const last = Math.max(1, Math.ceil(sizeBytes / PART_BYTES));
  return [...kept.values()]
    .filter((p) => p.partNumber <= last)
    .sort((a, b) => a.partNumber - b.partNumber);
}

export type FinalizeSource =
  | { parts: R2UploadedPart[]; segments?: undefined }
  | { segments: true; parts?: undefined };

// What finalize completes the upload from: the client's parts or the pieces.
export function hydrateFinalizeSource(body: {
  parts?: unknown;
  segments?: unknown;
}): FinalizeSource | null {
  if (body.segments === true) return { segments: true };
  if (!Array.isArray(body.parts) || body.parts.length === 0) return null;
  const parts: R2UploadedPart[] = [];
  for (const p of body.parts as unknown[]) {
    const part = p as Partial<R2UploadedPart> | null;
    if (
      !part ||
      typeof part.partNumber !== "number" ||
      typeof part.etag !== "string" ||
      part.etag.length === 0
    ) {
      return null;
    }
    parts.push({ partNumber: part.partNumber, etag: part.etag });
  }
  return { parts };
}

/*
 * The parts finalize completes with. A segmented upload that isn't fully
 * there yet answers null: the recording stays pending so the client can send
 * the rest and finalize again.
 */
export async function resolveFinalizeParts(
  source: FinalizeSource,
  slug: string,
  stream: RecordingStream,
  target: SegmentTarget,
  sizeBytes: number,
): Promise<R2UploadedPart[] | null> {
  if (source.parts) return source.parts;
  return completeSegmentParts(slug, stream, target, sizeBytes);
}
