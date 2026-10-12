const SLUG_RE = /^[a-zA-Z2-9]{8,16}$/;

export type GithubPlayerMessage =
  | {
      type: "captureflow-player-ready";
      id: string;
      width: number;
      height: number;
    }
  | { type: "captureflow-player-unavailable"; id: string; reason: string };

export type SharePreview = {
  videoUrl: string;
  posterUrl: string | null;
  title: string;
  width: number;
  height: number;
};

// The slug of a CaptureFlow share link on one of `webBases`' origins, or null.
export function shareSlugFromUrl(
  href: string,
  ...webBases: string[]
): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!webBases.some((base) => new URL(base).origin === url.origin)) {
    return null;
  }
  const match = /^\/r\/([^/]+)\/?$/.exec(url.pathname);
  const slug = match?.[1];
  return slug && SLUG_RE.test(slug) ? slug : null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function metaContents(html: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = /\b(?:property|name)="([^"]+)"/i.exec(tag)?.[1];
    const content = /\bcontent="([^"]*)"/i.exec(tag)?.[1];
    if (key && content !== undefined && !out.has(key)) {
      out.set(key, decodeEntities(content));
    }
  }
  return out;
}

/*
 * Reads the player inputs off a share page's link-preview tags. The page only
 * emits them to a visitor allowed to watch, so a recording this browser can't
 * see comes back null and the link is left alone. Media URLs may be relative
 * (private recordings get a signed /api/r/m/ link), so they resolve against
 * the page.
 */
export function parseSharePage(
  html: string,
  pageUrl: string,
): SharePreview | null {
  const meta = metaContents(html);
  const video = meta.get("og:video");
  if (!video) return null;
  const poster = meta.get("og:image");
  const width = Number(meta.get("og:video:width")) || 1280;
  const height = Number(meta.get("og:video:height")) || 720;
  return {
    videoUrl: new URL(video, pageUrl).href,
    posterUrl: poster ? new URL(poster, pageUrl).href : null,
    title: meta.get("og:title") ?? "CaptureFlow recording",
    width,
    height,
  };
}
