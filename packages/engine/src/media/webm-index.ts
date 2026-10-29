import { concat, view, type ByteReader } from "./bytes";
import type { BytePatch } from "./fmp4-index";

/*
 * MediaRecorder writes WebM with no Duration and no Cues, so the browser can
 * only seek the camera by searching the file. Recordings carry a Void before
 * the first Cluster; once the camera stops, the patch turns the original Info
 * into a Void and writes Info (with Duration) + Cues into the reserve. Cluster
 * positions are relative to the Segment, so nothing after it moves.
 */
export const WEBM_INDEX_RESERVE_BYTES = 128 * 1024;

const ID = {
  segment: 0x18538067,
  info: 0x1549a966,
  tracks: 0x1654ae6b,
  trackEntry: 0xae,
  trackNumber: 0xd7,
  trackType: 0x83,
  timecodeScale: 0x2ad7b1,
  duration: 0x4489,
  cluster: 0x1f43b675,
  timecode: 0xe7,
  simpleBlock: 0xa3,
  blockGroup: 0xa0,
  block: 0xa1,
  cues: 0x1c53bb6b,
  cuePoint: 0xbb,
  cueTime: 0xb3,
  cueTrackPositions: 0xb7,
  cueTrack: 0xf7,
  cueClusterPosition: 0xf1,
  void: 0xec,
} as const;

const VIDEO_TRACK_TYPE = 1;
const UNKNOWN = -1;

function readId(
  bytes: Uint8Array,
  at: number,
): { id: number; length: number } | null {
  const first = bytes[at];
  if (first === undefined || first === 0) return null;
  const length = Math.clz32(first) - 23;
  if (length > 4 || at + length > bytes.byteLength) return null;
  let id = 0;
  for (let i = 0; i < length; i++) id = id * 256 + (bytes[at + i] ?? 0);
  return { id, length };
}

function readSize(
  bytes: Uint8Array,
  at: number,
): { size: number; length: number } | null {
  const first = bytes[at];
  if (first === undefined || first === 0) return null;
  const length = Math.clz32(first) - 23;
  if (length > 8 || at + length > bytes.byteLength) return null;
  let size = first & (0xff >> length);
  let allOnes = size === 0xff >> length;
  for (let i = 1; i < length; i++) {
    const b = bytes[at + i] ?? 0;
    size = size * 256 + b;
    allOnes &&= b === 0xff;
  }
  return { size: allOnes ? UNKNOWN : size, length };
}

function encodeId(id: number): Uint8Array {
  const bytes: number[] = [];
  for (let v = id; v > 0; v = Math.floor(v / 256)) bytes.unshift(v & 0xff);
  return new Uint8Array(bytes);
}

// Always 8 bytes, so a Void can be resized in place.
function encodeSize8(size: number): Uint8Array {
  const out = new Uint8Array(8);
  let v = size;
  for (let i = 7; i >= 1; i--) {
    out[i] = v & 0xff;
    v = Math.floor(v / 256);
  }
  out[0] = 0x01;
  return out;
}

function encodeSize(size: number): Uint8Array {
  for (let length = 1; length <= 8; length++) {
    if (size < 2 ** (7 * length) - 1) {
      const out = new Uint8Array(length);
      let v = size;
      for (let i = length - 1; i >= 0; i--) {
        out[i] = v & 0xff;
        v = Math.floor(v / 256);
      }
      out[0]! |= 0x80 >> (length - 1);
      return out;
    }
  }
  throw new RangeError("EBML size too large");
}

function element(id: number, body: Uint8Array): Uint8Array {
  return concat([encodeId(id), encodeSize(body.byteLength), body]);
}

function uint(id: number, value: number): Uint8Array {
  const bytes: number[] = [];
  for (let v = value; v > 0 || bytes.length === 0; v = Math.floor(v / 256)) {
    bytes.unshift(v & 0xff);
  }
  return element(id, new Uint8Array(bytes));
}

function float64(id: number, value: number): Uint8Array {
  const body = new Uint8Array(8);
  view(body).setFloat64(0, value);
  return element(id, body);
}

function voidElement(total: number): Uint8Array {
  if (total < 9) throw new RangeError("Void needs at least 9 bytes");
  return concat([
    new Uint8Array([ID.void]),
    encodeSize8(total - 9),
    new Uint8Array(total - 9),
  ]);
}

/*
 * Passes MediaRecorder's stream through, adding the reserve the moment the
 * first Cluster starts. Everything before it is small header elements with
 * known sizes (the Segment's own size is unknown and is only stepped into).
 */
export function createWebmReserver(reserveBytes = WEBM_INDEX_RESERVE_BYTES): {
  write(chunk: Uint8Array): Uint8Array[];
} {
  let pending: Uint8Array = new Uint8Array(0);
  let skip = 0;
  let done = false;

  return {
    write(chunk) {
      if (done) return [chunk];
      const out: Uint8Array[] = [];
      let data = concat([pending, chunk]);
      pending = new Uint8Array(0);
      let at = 0;
      while (at < data.byteLength) {
        if (skip > 0) {
          const n = Math.min(skip, data.byteLength - at);
          out.push(data.subarray(at, at + n));
          skip -= n;
          at += n;
          continue;
        }
        const id = readId(data, at);
        const size = id && readSize(data, at + id.length);
        if (!id || !size) {
          pending = data.slice(at);
          return out;
        }
        if (id.id === ID.cluster) {
          done = true;
          out.push(voidElement(reserveBytes), data.subarray(at));
          return out;
        }
        const headerLength = id.length + size.length;
        out.push(data.subarray(at, at + headerLength));
        at += headerLength;
        if (id.id !== ID.segment) skip = size.size === UNKNOWN ? 0 : size.size;
      }
      return out;
    },
  };
}

export type WebmKeyframe = { time: number; clusterPosition: number };

export type WebmScan = {
  segmentStart: number;
  info: { offset: number; size: number; body: Uint8Array };
  reserve: { offset: number; size: number } | null;
  timecodeScale: number;
  videoTrack: number | null;
  keyframes: WebmKeyframe[];
  durationTicks: number;
  completeBytes: number;
};

const READ_AHEAD = 1 << 20;

function bufferedReader(reader: ByteReader) {
  let start = 0;
  let buffer: Uint8Array = new Uint8Array(0);
  return async (offset: number, length: number): Promise<Uint8Array> => {
    if (offset < start || offset + length > start + buffer.byteLength) {
      start = offset;
      buffer = await reader.read(offset, Math.max(length, READ_AHEAD));
    }
    return buffer.subarray(offset - start, offset - start + length);
  };
}

function parseTracks(body: Uint8Array): number | null {
  for (let at = 0; at < body.byteLength; ) {
    const id = readId(body, at);
    const size = id && readSize(body, at + id.length);
    if (!id || !size || size.size === UNKNOWN) return null;
    const start = at + id.length + size.length;
    if (id.id === ID.trackEntry) {
      let number: number | null = null;
      let type: number | null = null;
      for (let p = start; p < start + size.size; ) {
        const cid = readId(body, p);
        const csize = cid && readSize(body, p + cid.length);
        if (!cid || !csize || csize.size === UNKNOWN) break;
        const cstart = p + cid.length + csize.length;
        let value = 0;
        for (let i = 0; i < csize.size; i++)
          value = value * 256 + (body[cstart + i] ?? 0);
        if (cid.id === ID.trackNumber) number = value;
        if (cid.id === ID.trackType) type = value;
        p = cstart + csize.size;
      }
      if (type === VIDEO_TRACK_TYPE && number !== null) return number;
    }
    at = start + size.size;
  }
  return null;
}

function readUint(bytes: Uint8Array, at: number, length: number): number {
  let value = 0;
  for (let i = 0; i < length; i++) value = value * 256 + (bytes[at + i] ?? 0);
  return value;
}

// Walks every block header; payloads are skipped.
export async function scanWebm(reader: ByteReader): Promise<WebmScan | null> {
  const read = bufferedReader(reader);
  let at = 0;
  let segmentStart = -1;
  let info: WebmScan["info"] | null = null;
  let reserve: WebmScan["reserve"] = null;
  let timecodeScale = 1_000_000;
  let videoTrack: number | null = null;
  const keyframes: WebmKeyframe[] = [];
  let clusterPosition = -1;
  let clusterTime = 0;
  let durationTicks = 0;
  let completeBytes = 0;

  while (at < reader.size) {
    const head = await read(at, Math.min(12, reader.size - at));
    const id = readId(head, 0);
    const size = id && readSize(head, id.length);
    if (!id || !size) break;
    const bodyStart = at + id.length + size.length;
    if (id.id === ID.segment) {
      segmentStart = bodyStart;
      at = bodyStart;
      continue;
    }
    if (id.id === ID.cluster) {
      clusterPosition = at - segmentStart;
      at = bodyStart;
      continue;
    }
    if (size.size === UNKNOWN || bodyStart + size.size > reader.size) break;
    const end = bodyStart + size.size;

    if (id.id === ID.info) {
      const body = (await reader.read(bodyStart, size.size)).slice();
      info = { offset: at, size: end - at, body };
      for (let p = 0; p < body.byteLength; ) {
        const cid = readId(body, p);
        const csize = cid && readSize(body, p + cid.length);
        if (!cid || !csize || csize.size === UNKNOWN) break;
        const cstart = p + cid.length + csize.length;
        if (cid.id === ID.timecodeScale)
          timecodeScale = readUint(body, cstart, csize.size);
        p = cstart + csize.size;
      }
    } else if (id.id === ID.tracks) {
      videoTrack = parseTracks(await reader.read(bodyStart, size.size));
    } else if (id.id === ID.void && clusterPosition < 0 && segmentStart >= 0) {
      reserve = { offset: at, size: end - at };
    } else if (id.id === ID.timecode && clusterPosition >= 0) {
      clusterTime = readUint(await read(bodyStart, size.size), 0, size.size);
    } else if (id.id === ID.simpleBlock || id.id === ID.blockGroup) {
      const blockAt =
        id.id === ID.simpleBlock
          ? bodyStart
          : await blockInGroup(read, bodyStart, end);
      if (blockAt !== null) {
        const block = await read(blockAt, 4);
        const track = (block[0] ?? 0) & 0x7f;
        const relative = view(block).getInt16(1);
        const time = clusterTime + relative;
        const key = id.id === ID.simpleBlock && ((block[3] ?? 0) & 0x80) !== 0;
        if (track === videoTrack && key && clusterPosition >= 0) {
          const last = keyframes[keyframes.length - 1];
          if (!last || last.time < time)
            keyframes.push({ time, clusterPosition });
        }
        durationTicks = Math.max(durationTicks, time);
      }
    }
    completeBytes = end;
    at = end;
  }
  if (segmentStart < 0 || !info) return null;
  return {
    segmentStart,
    info,
    reserve,
    timecodeScale,
    videoTrack,
    keyframes,
    durationTicks,
    completeBytes,
  };
}

async function blockInGroup(
  read: (offset: number, length: number) => Promise<Uint8Array>,
  start: number,
  end: number,
): Promise<number | null> {
  for (let p = start; p < end; ) {
    const head = await read(p, Math.min(12, end - p));
    const id = readId(head, 0);
    const size = id && readSize(head, id.length);
    if (!id || !size || size.size === UNKNOWN) return null;
    const body = p + id.length + size.length;
    if (id.id === ID.block) return body;
    p = body + size.size;
  }
  return null;
}

/*
 * Old Info → Void; reserve → Info (with Duration) + Cues + Void filler. One
 * contiguous patch from the old Info to the end of the reserve, Tracks
 * included unchanged. Past the reserve's capacity, cues are thinned evenly.
 */
export async function webmIndexPatch(
  reader: ByteReader,
  scan: WebmScan,
  lastFrameTicks = 0,
): Promise<BytePatch | null> {
  const { reserve, info, videoTrack } = scan;
  if (!reserve || videoTrack === null || reserve.offset < info.offset)
    return null;

  const between = await reader.read(
    info.offset + info.size,
    reserve.offset - info.offset - info.size,
  );
  const durationTicks = scan.durationTicks + lastFrameTicks;
  const newInfo = element(
    ID.info,
    concat([stripDuration(info.body), float64(ID.duration, durationTicks)]),
  );

  let keyframes = scan.keyframes;
  let cues = cuesElement(keyframes, videoTrack);
  const room = reserve.size - newInfo.byteLength - 9;
  while (cues.byteLength > room && keyframes.length > 1) {
    keyframes = keyframes.filter((_, i) => i % 2 === 0);
    cues = cuesElement(keyframes, videoTrack);
  }
  if (cues.byteLength > room) return null;

  const filler = reserve.size - newInfo.byteLength - cues.byteLength;
  return {
    offset: info.offset,
    bytes: concat([
      voidElement(info.size),
      between,
      newInfo,
      cues,
      voidElement(filler),
    ]),
  };
}

function stripDuration(body: Uint8Array): Uint8Array {
  const kept: Uint8Array[] = [];
  for (let p = 0; p < body.byteLength; ) {
    const id = readId(body, p);
    const size = id && readSize(body, p + id.length);
    if (!id || !size || size.size === UNKNOWN) break;
    const end = p + id.length + size.length + size.size;
    if (id.id !== ID.duration) kept.push(body.subarray(p, end));
    p = end;
  }
  return concat(kept);
}

function cuesElement(keyframes: WebmKeyframe[], track: number): Uint8Array {
  return element(
    ID.cues,
    concat(
      keyframes.map((k) =>
        element(
          ID.cuePoint,
          concat([
            uint(ID.cueTime, k.time),
            element(
              ID.cueTrackPositions,
              concat([
                uint(ID.cueTrack, track),
                uint(ID.cueClusterPosition, k.clusterPosition),
              ]),
            ),
          ]),
        ),
      ),
    ),
  );
}
