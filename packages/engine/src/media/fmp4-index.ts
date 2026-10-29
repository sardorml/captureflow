import { concat, fourcc, view, type ByteReader } from "./bytes";

/*
 * A fragmented MP4 has no index of its fragments, so a browser walks every
 * moof with its own range request before it starts playing — a minute or more
 * on a long recording. Recordings carry room for a `sidx` right after `moov`
 * (a `free` box) and get the index written into it once the last fragment
 * exists. Fragment offsets are relative to each moof, so the reserve moves
 * nothing; `mfra` is dropped because its absolute offsets would be off by it.
 */
export const FMP4_INDEX_RESERVE_BYTES = 64 * 1024;

const SIDX_HEADER_BYTES = 40;
const SIDX_REFERENCE_BYTES = 12;
const BOX_HEADER_BYTES = 8;

export type Fmp4Fragment = {
  offset: number;
  size: number;
  time: number;
  duration: number;
};

export type Fmp4Scan = {
  trackId: number;
  timescale: number;
  reserve: { offset: number; size: number } | null;
  fragments: Fmp4Fragment[];
  // End of the last complete fragment: everything past it is a cut-off write.
  completeBytes: number;
};

export type BytePatch = { offset: number; bytes: Uint8Array };

function freeBox(size: number): Uint8Array {
  const box = new Uint8Array(size);
  view(box).setUint32(0, size);
  box.set([0x66, 0x72, 0x65, 0x65], 4);
  return box;
}

/*
 * Rewrites the muxer's output stream on the way to storage: a reserve after
 * moov, no mfra. Box headers may arrive split across writes.
 */
export function createFmp4Reserver(reserveBytes = FMP4_INDEX_RESERVE_BYTES): {
  write(chunk: Uint8Array): Uint8Array[];
} {
  let header: Uint8Array = new Uint8Array(0);
  let remaining = 0;
  let forward = true;
  let type = "";
  let reserved = false;

  return {
    write(chunk) {
      const out: Uint8Array[] = [];
      let at = 0;
      while (at < chunk.byteLength) {
        if (remaining > 0) {
          const n = Math.min(remaining, chunk.byteLength - at);
          if (forward) out.push(chunk.subarray(at, at + n));
          remaining -= n;
          at += n;
          if (remaining === 0 && type === "moov" && !reserved) {
            reserved = true;
            out.push(freeBox(reserveBytes));
          }
          continue;
        }
        const need =
          header.byteLength >= 8 && readSize32(header) === 1 ? 16 : 8;
        const take = Math.min(need - header.byteLength, chunk.byteLength - at);
        header = concat([header, chunk.subarray(at, at + take)]);
        at += take;
        if (header.byteLength < need) continue;
        if (need === 8 && readSize32(header) === 1) continue;
        const size =
          need === 16
            ? Number(view(header).getBigUint64(8))
            : readSize32(header);
        type = fourcc(header, 4);
        forward = type !== "mfra";
        if (forward) out.push(header);
        // size 0 means "to the end of the file"
        remaining = size === 0 ? Number.MAX_SAFE_INTEGER : size - need;
        header = new Uint8Array(0);
        if (remaining === 0 && type === "moov" && !reserved) {
          reserved = true;
          out.push(freeBox(reserveBytes));
        }
      }
      return out;
    },
  };
}

function readSize32(header: Uint8Array): number {
  return view(header).getUint32(0);
}

type Box = { type: string; start: number; end: number; body: number };

function* children(bytes: Uint8Array, start: number, end: number) {
  let at = start;
  while (at + BOX_HEADER_BYTES <= end) {
    let size = view(bytes).getUint32(at);
    let body = at + BOX_HEADER_BYTES;
    if (size === 1) {
      size = Number(view(bytes).getBigUint64(at + 8));
      body += 8;
    } else if (size === 0) {
      size = end - at;
    }
    if (size < BOX_HEADER_BYTES || at + size > end) return;
    const box: Box = {
      type: fourcc(bytes, at + 4),
      start: at,
      end: at + size,
      body,
    };
    yield box;
    at += size;
  }
}

function child(bytes: Uint8Array, parent: Box, type: string): Box | null {
  for (const box of children(bytes, parent.body, parent.end)) {
    if (box.type === type) return box;
  }
  return null;
}

function videoTrack(moov: Uint8Array): {
  trackId: number;
  timescale: number;
  defaultDuration: number;
} | null {
  const root: Box = { type: "moov", start: 0, end: moov.byteLength, body: 8 };
  const dv = view(moov);
  const defaults = new Map<number, number>();
  const mvex = child(moov, root, "mvex");
  if (mvex) {
    for (const trex of children(moov, mvex.body, mvex.end)) {
      if (trex.type === "trex") {
        defaults.set(dv.getUint32(trex.body + 4), dv.getUint32(trex.body + 12));
      }
    }
  }
  for (const trak of children(moov, root.body, root.end)) {
    if (trak.type !== "trak") continue;
    const tkhd = child(moov, trak, "tkhd");
    const mdia = child(moov, trak, "mdia");
    const hdlr = mdia && child(moov, mdia, "hdlr");
    const mdhd = mdia && child(moov, mdia, "mdhd");
    if (!tkhd || !hdlr || !mdhd) continue;
    if (fourcc(moov, hdlr.body + 8) !== "vide") continue;
    const trackId = dv.getUint32(tkhd.body + (moov[tkhd.body] === 1 ? 20 : 12));
    const timescale = dv.getUint32(
      mdhd.body + (moov[mdhd.body] === 1 ? 20 : 12),
    );
    return { trackId, timescale, defaultDuration: defaults.get(trackId) ?? 0 };
  }
  return null;
}

function fragmentTiming(
  moof: Uint8Array,
  trackId: number,
  trexDuration: number,
): { time: number; duration: number } | null {
  const root: Box = { type: "moof", start: 0, end: moof.byteLength, body: 8 };
  const dv = view(moof);
  for (const traf of children(moof, root.body, root.end)) {
    if (traf.type !== "traf") continue;
    const tfhd = child(moof, traf, "tfhd");
    if (!tfhd || dv.getUint32(tfhd.body + 4) !== trackId) continue;
    const tfhdFlags = dv.getUint32(tfhd.body) & 0xffffff;
    let cursor = tfhd.body + 8;
    if (tfhdFlags & 0x01) cursor += 8;
    if (tfhdFlags & 0x02) cursor += 4;
    const defaultDuration =
      tfhdFlags & 0x08 ? dv.getUint32(cursor) : trexDuration;
    const tfdt = child(moof, traf, "tfdt");
    let time = 0;
    if (tfdt) {
      time =
        moof[tfdt.body] === 1
          ? Number(dv.getBigUint64(tfdt.body + 4))
          : dv.getUint32(tfdt.body + 4);
    }
    let duration = 0;
    let firstOffset: number | null = null;
    for (const trun of children(moof, traf.body, traf.end)) {
      if (trun.type !== "trun") continue;
      const version = moof[trun.body] ?? 0;
      const flags = dv.getUint32(trun.body) & 0xffffff;
      const count = dv.getUint32(trun.body + 4);
      let at = trun.body + 8;
      if (flags & 0x001) at += 4;
      if (flags & 0x004) at += 4;
      for (let i = 0; i < count; i++) {
        duration += flags & 0x100 ? dv.getUint32(at) : defaultDuration;
        if (flags & 0x100) at += 4;
        if (flags & 0x200) at += 4;
        if (flags & 0x400) at += 4;
        if (flags & 0x800) {
          if (firstOffset === null) {
            firstOffset = version === 1 ? dv.getInt32(at) : dv.getUint32(at);
          }
          at += 4;
        }
      }
    }
    return { time: time + (firstOffset ?? 0), duration };
  }
  return null;
}

function reserveEnd(reserve: Fmp4Scan["reserve"]): number {
  return reserve ? reserve.offset + reserve.size : -1;
}

// Reads box headers and moofs only; mdat payloads are skipped.
export async function scanFmp4(reader: ByteReader): Promise<Fmp4Scan | null> {
  let at = 0;
  let track: ReturnType<typeof videoTrack> = null;
  let reserve: Fmp4Scan["reserve"] = null;
  let previous = "";
  let moof: {
    offset: number;
    size: number;
    time: number;
    duration: number;
  } | null = null;
  const fragments: Fmp4Fragment[] = [];
  let completeBytes = 0;

  while (at + BOX_HEADER_BYTES <= reader.size) {
    const head = await reader.read(at, 16);
    if (head.byteLength < BOX_HEADER_BYTES) break;
    let size = view(head).getUint32(0);
    if (size === 1) {
      if (head.byteLength < 16) break;
      size = Number(view(head).getBigUint64(8));
    }
    const type = fourcc(head, 4);
    if (size < BOX_HEADER_BYTES || at + size > reader.size) break;

    if (type === "moov") {
      track = videoTrack(await reader.read(at, size));
      completeBytes = at + size;
    } else if (
      (type === "free" || type === "sidx") &&
      (previous === "moov" || reserveEnd(reserve) === at)
    ) {
      // An earlier index (free filler + sidx) counts as the reserve again.
      reserve = reserve
        ? { offset: reserve.offset, size: reserve.size + size }
        : { offset: at, size };
      completeBytes = at + size;
    } else if (type === "moof" && track) {
      const timing = fragmentTiming(
        await reader.read(at, size),
        track.trackId,
        track.defaultDuration,
      );
      moof = timing ? { offset: at, size, ...timing } : null;
    } else if (type === "mdat" && moof) {
      fragments.push({
        offset: moof.offset,
        size: moof.size + size,
        time: moof.time,
        duration: moof.duration,
      });
      completeBytes = at + size;
      moof = null;
    } else if (type === "ftyp") {
      completeBytes = at + size;
    }
    previous = type;
    at += size;
  }
  if (!track) return null;
  return {
    trackId: track.trackId,
    timescale: track.timescale,
    reserve,
    fragments,
    completeBytes,
  };
}

/*
 * The free filler + sidx that replace the reserve. The sidx goes last so it
 * sits right before the first moof: Chrome ignores a non-zero first_offset and
 * falls back to walking every fragment. Past the reserve's capacity,
 * neighbouring fragments share a reference (each still starts on a keyframe),
 * so the index always fits.
 */
export function fmp4IndexPatch(scan: Fmp4Scan): BytePatch | null {
  const { reserve, fragments } = scan;
  if (!reserve || fragments.length === 0) return null;
  const capacity = Math.floor(
    (reserve.size - SIDX_HEADER_BYTES - BOX_HEADER_BYTES) /
      SIDX_REFERENCE_BYTES,
  );
  if (capacity < 1) return null;
  const perReference = Math.ceil(fragments.length / capacity);
  const references: { size: number; duration: number }[] = [];
  for (let i = 0; i < fragments.length; i += perReference) {
    const group = fragments.slice(i, i + perReference);
    references.push({
      size: group.reduce((n, f) => n + f.size, 0),
      duration: group.reduce((n, f) => n + f.duration, 0),
    });
  }
  const sidxSize = SIDX_HEADER_BYTES + SIDX_REFERENCE_BYTES * references.length;
  const fillerSize = reserve.size - sidxSize;
  const first = fragments[0];
  if (!first || fillerSize < BOX_HEADER_BYTES) return null;

  const sidx = new Uint8Array(sidxSize);
  const dv = view(sidx);
  dv.setUint32(0, sidxSize);
  sidx.set([0x73, 0x69, 0x64, 0x78], 4);
  dv.setUint32(8, 0x01000000);
  dv.setUint32(12, scan.trackId);
  dv.setUint32(16, scan.timescale);
  dv.setBigUint64(20, BigInt(first.time));
  dv.setBigUint64(28, 0n);
  dv.setUint16(36, 0);
  dv.setUint16(38, references.length);
  references.forEach((ref, i) => {
    const at = SIDX_HEADER_BYTES + i * SIDX_REFERENCE_BYTES;
    dv.setUint32(at, ref.size & 0x7fffffff);
    dv.setUint32(at + 4, ref.duration);
    dv.setUint32(at + 8, 0x90000000);
  });
  return { offset: reserve.offset, bytes: concat([freeBox(fillerSize), sidx]) };
}
