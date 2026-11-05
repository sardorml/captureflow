import type { IncomingMessage, ServerResponse } from "node:http";

const NOINDEX = "noindex, nofollow";

const ROBOTS_TXT = `# Nothing on this CaptureFlow is indexed: every response carries
# "X-Robots-Tag: ${NOINDEX}". Crawlers only see that header on what they
# may fetch, so pages are left open to them.
User-agent: *
Disallow: /api/
`;

// The hosted site's own sitemap and summary for language models.
const HOSTED_ONLY = new Set(["/sitemap.xml", "/llms.txt"]);

/*
 * A self-hosted instance is private, so nothing on it belongs in a search
 * index: not its pages, and not the videos and images it serves. The header
 * says so on every response. A Disallow in robots.txt would hide that header
 * from crawlers and leave a linked share page listed by its bare address.
 * Returns true when the request was answered here.
 */
export function answerCrawler(
  req: IncomingMessage,
  res: ServerResponse,
): boolean {
  res.setHeader("x-robots-tag", NOINDEX);
  const [path = ""] = (req.url ?? "").split("?");
  if (path === "/robots.txt") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end(ROBOTS_TXT);
    return true;
  }
  if (HOSTED_ONLY.has(path)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return true;
  }
  return false;
}
