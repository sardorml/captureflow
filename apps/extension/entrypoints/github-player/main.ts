import { WEB_BASE } from "@/lib/config";
import {
  parseSharePage,
  shareSlugFromUrl,
  type GithubPlayerMessage,
} from "@/lib/github-embed";
import { PRODUCTION_WEB_BASE } from "@/lib/web-origin";

function tell(message: GithubPlayerMessage): void {
  window.parent.postMessage(message, "https://github.com");
}

async function run(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") ?? "";
  const shareUrl = params.get("url");
  const slug = shareUrl
    ? shareSlugFromUrl(shareUrl, WEB_BASE, PRODUCTION_WEB_BASE)
    : null;
  if (!shareUrl || !slug) {
    return tell({
      type: "captureflow-player-unavailable",
      id,
      reason: `not a CaptureFlow share link: ${shareUrl}`,
    });
  }

  let html: string;
  try {
    const res = await fetch(shareUrl, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    return tell({
      type: "captureflow-player-unavailable",
      id,
      reason: `couldn't load ${shareUrl} (${String(err)})`,
    });
  }
  const preview = parseSharePage(html, shareUrl);
  if (!preview) {
    return tell({
      type: "captureflow-player-unavailable",
      id,
      reason: "this browser can't watch the recording",
    });
  }

  const frame = document.createElement("iframe");
  frame.src = new URL(`/embed/${slug}`, shareUrl).href;
  frame.title = preview.title;
  frame.allow = "fullscreen; autoplay; picture-in-picture";
  frame.allowFullscreen = true;

  const open = document.createElement("a");
  open.className = "open";
  open.href = shareUrl;
  open.target = "_blank";
  open.rel = "noopener";
  open.textContent = "Open in CaptureFlow ↗";

  document.body.append(frame, open);
  tell({
    type: "captureflow-player-ready",
    id,
    width: preview.width,
    height: preview.height,
  });
}

void run();
