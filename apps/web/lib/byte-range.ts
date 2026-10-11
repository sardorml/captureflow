export type ByteRange =
  | { offset: number; length?: number }
  | { suffix: number };

// A single-range `Range` header as R2 takes it. Undefined means serve the
// whole object; null means the header can't be satisfied (416).
export function parseByteRange(
  header: string | null,
): ByteRange | null | undefined {
  if (!header) return undefined;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return undefined;
  const [, startRaw, endRaw] = m;
  if (!startRaw) {
    const suffix = Number(endRaw);
    return endRaw && suffix > 0 ? { suffix } : null;
  }
  const offset = Number(startRaw);
  if (!endRaw) return { offset };
  const end = Number(endRaw);
  if (end < offset) return null;
  return { offset, length: end - offset + 1 };
}

// The inclusive byte span a range covers in an object of `size` bytes, or
// null when it starts past the end.
export function resolveByteRange(
  range: ByteRange,
  size: number,
): { start: number; end: number } | null {
  if ("suffix" in range) {
    if (size === 0) return null;
    return { start: Math.max(0, size - range.suffix), end: size - 1 };
  }
  if (range.offset >= size) return null;
  const end =
    range.length === undefined
      ? size - 1
      : Math.min(size - 1, range.offset + range.length - 1);
  return { start: range.offset, end };
}
