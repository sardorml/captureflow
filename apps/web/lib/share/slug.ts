const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSlug(length = 10): string {
  const out: string[] = [];
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) {
    out.push(ALPHABET[buf[i]! % ALPHABET.length]!);
  }
  return out.join('');
}

const SLUG_RE = /^[a-zA-Z2-9]{8,16}$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}
