export type ByteReader = {
  readonly size: number;
  read(offset: number, length: number): Promise<Uint8Array>;
};

export function readerFromBytes(bytes: Uint8Array): ByteReader {
  return {
    size: bytes.byteLength,
    read: async (offset, length) =>
      bytes.subarray(offset, Math.min(offset + length, bytes.byteLength)),
  };
}

export function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

export function fourcc(bytes: Uint8Array, at: number): string {
  return String.fromCharCode(
    bytes[at] ?? 0,
    bytes[at + 1] ?? 0,
    bytes[at + 2] ?? 0,
    bytes[at + 3] ?? 0,
  );
}

export function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.byteLength;
  }
  return out;
}
