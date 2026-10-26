type HeaderSource = Pick<Headers, "get">;

/*
 * One key per viewer for `recording_views`: the user id when signed in, else
 * a hash of the client's address and browser, so a refresh is the same
 * anonymous viewer and the address itself is never stored.
 */
export async function viewerKeyFor(
  userId: string | null,
  headers: HeaderSource,
): Promise<string> {
  if (userId) return `u:${userId}`;
  const address =
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  const agent = headers.get("user-agent") ?? "";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${address}\n${agent}`),
  );
  const hex = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `a:${hex.slice(0, 16)}`;
}
