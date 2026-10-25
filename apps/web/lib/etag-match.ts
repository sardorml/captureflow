/*
 * The entity tag of an `If-None-Match` header, bare, the way R2's
 * `etagDoesNotMatch` wants it: a single tag with no `W/` prefix and no
 * quotes, which R2 rejects outright. A browser revalidating sends one tag;
 * a list only has its first compared. Undefined when there is nothing to
 * compare against.
 */
export function etagFromIfNoneMatch(header: string | null): string | undefined {
  if (!header) return undefined;
  const first = header.split(",")[0].trim();
  const tag = first.replace(/^W\//, "").replace(/^"(.*)"$/, "$1");
  return tag !== "" && tag !== "*" ? tag : undefined;
}
