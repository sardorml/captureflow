// Chrome extension ids are 32 chars from a–p (a base-16 remap of the key hash).
const EXTENSION_ID_RE = /^[a-p]{32}$/;

/*
 * Which extension the freshly minted device token may be handed to. The `ext`
 * param is attacker-influenceable, so a malformed id — or one that doesn't match
 * the pinned production id, when configured — yields null and no token is sent.
 * With no pin (dev), any well-formed id is accepted.
 */
export function resolveExtensionTarget(
  rawExt: string | undefined,
  pinnedId: string | null | undefined,
): string | null {
  if (typeof rawExt !== "string" || !EXTENSION_ID_RE.test(rawExt)) return null;
  if (pinnedId && rawExt !== pinnedId) return null;
  return rawExt;
}
