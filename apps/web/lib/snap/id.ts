// Alphabet excludes 0/O/1/I/l to avoid visual ambiguity.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSnapId(length = 10): string {
  const out: string[] = [];
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) {
    out.push(ALPHABET[buf[i]! % ALPHABET.length]!);
  }
  return out.join('');
}

const SNAP_ID_RE = /^[a-zA-Z2-9]{8,16}$/;

export function isValidSnapId(id: unknown): id is string {
  return typeof id === 'string' && SNAP_ID_RE.test(id);
}
