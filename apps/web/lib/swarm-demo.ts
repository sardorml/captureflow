const MAX_URL_LENGTH = 500;

/*
 * The address typed on the demo page, as the url the recorder opens: a bare
 * host gets https, and only a public-looking host name with a dot passes.
 * The recorder resolves the host and refuses private networks itself.
 */
export function hydrateDemoUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || text.length > MAX_URL_LENGTH) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host)) return null;
  if (/^\d+(\.\d+){3}$/.test(host)) return null;
  return url.href;
}

export type SitePreview = {
  url: string;
  host: string;
  title: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
};

const CHECK_TIMEOUT_MS = 10_000;
const HEAD_BYTES = 1024 * 1024;
const USER_AGENT = "Mozilla/5.0 (compatible; CaptureFlow swarm demo preview)";

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(
    /([a-z][a-z0-9:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi,
  )) {
    out[m[1]!.toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

const clean = (text: string | undefined, max: number): string | null => {
  const t = text?.replace(/\s+/g, " ").trim() ?? "";
  return t ? (t.length > max ? `${t.slice(0, max - 1)}…` : t) : null;
};

const absolute = (href: string | undefined, base: string): string | null => {
  if (!href) return null;
  try {
    const u = new URL(href.trim(), base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
};

// What a link to the page would show: its title, description, social image and icon, from the head of its HTML.
export function parseSitePreview(html: string, url: string): SitePreview {
  const meta: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\s[^>]*>/gi)) {
    const a = attrs(m[0]);
    const key = (a.property ?? a.name)?.toLowerCase();
    if (key && a.content !== undefined && !(key in meta)) meta[key] = a.content;
  }
  let icon: string | undefined;
  let touchIcon: string | undefined;
  for (const m of html.matchAll(/<link\s[^>]*>/gi)) {
    const a = attrs(m[0]);
    const rel = (a.rel ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("apple-touch-icon")) touchIcon ??= a.href;
    else if (rel.includes("icon")) icon ??= a.href;
  }
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const parsed = new URL(url);
  return {
    url,
    host: parsed.host,
    title: clean(meta["og:title"] ?? decodeEntities(titleTag ?? ""), 120),
    description: clean(meta["og:description"] ?? meta.description, 200),
    image: absolute(meta["og:image"] ?? meta["twitter:image"], url),
    icon: absolute(touchIcon ?? icon, url) ?? `${parsed.origin}/favicon.ico`,
  };
}

async function readHead(res: Response, limit: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let out = "";
  // Sites that inline their CSS push the meta tags hundreds of KB in, so read to the end of the head.
  while (out.length < limit && !/<\/head\s*>|<body[\s>]/i.test(out)) {
    const { value, done } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return out.slice(0, limit);
}

// Loads the page the way a link preview would; null when nothing answers at that address.
export async function checkSite(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SitePreview | null> {
  let res: Response;
  try {
    res = await fetchImpl(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: { accept: "text/html,*/*;q=0.8", "user-agent": USER_AGENT },
    });
  } catch {
    return null;
  }
  const html = await readHead(res, HEAD_BYTES).catch(() => "");
  return parseSitePreview(html, res.url || url);
}
