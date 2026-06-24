// Chrome extension ids are 32 chars from a–p (a base-16 remap of the key hash).
const EXTENSION_ID_RE = /^[a-p]{32}$/;

/*
 * Which extension the freshly minted device token may be handed to. The `ext`
 * param is attacker-influenceable, so it's never trusted on its own:
 *   - malformed id -> null;
 *   - a configured pin (production) -> must match exactly, else null;
 *   - no pin -> only honored when allowUnpinned is set (dev). Production runs
 *     fail-closed (allowUnpinned = false), so an unset pin refuses every id
 *     rather than handing a token to an arbitrary extension.
 */
export function resolveExtensionTarget(
  rawExt: string | undefined,
  pinnedId: string | null | undefined,
  allowUnpinned: boolean,
): string | null {
  if (typeof rawExt !== "string" || !EXTENSION_ID_RE.test(rawExt)) return null;
  if (pinnedId) return rawExt === pinnedId ? rawExt : null;
  return allowUnpinned ? rawExt : null;
}
