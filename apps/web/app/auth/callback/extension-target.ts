// Chrome extension ids are 32 chars from a–p (a base-16 remap of the key hash).
const EXTENSION_ID_RE = /^[a-p]{32}$/;

/*
 * Which extension the freshly minted device token may be handed to. The `ext`
 * param is attacker-influenceable, so it's never trusted on its own:
 *   - malformed id -> null, always;
 *   - production -> must equal the pinned id, and an unset pin refuses every
 *     id rather than handing a token to an attacker-named extension;
 *   - dev -> any well-formed id. The pin lives in wrangler vars, which dev
 *     shares with production, so honouring it here would refuse the unpacked
 *     build — whose id is assigned per machine and cannot match a shipped one.
 */
export function resolveExtensionTarget(
  rawExt: string | undefined,
  pinnedId: string | null | undefined,
  isProduction: boolean,
): string | null {
  if (typeof rawExt !== "string" || !EXTENSION_ID_RE.test(rawExt)) return null;
  if (!isProduction) return rawExt;
  return pinnedId && rawExt === pinnedId ? rawExt : null;
}
