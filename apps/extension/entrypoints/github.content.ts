import { WEB_BASE } from "@/lib/config";
import { shareSlugFromUrl, type GithubPlayerMessage } from "@/lib/github-embed";
import { PRODUCTION_WEB_BASE } from "@/lib/web-origin";

const EMBEDDED = "data-captureflow-embed";
const MAX_WIDTH = 440;

/*
 * GitHub strips iframes from Markdown, so a pasted share link renders as a bare
 * link. This puts a player above each one. The frame is an extension page:
 * GitHub's CSP would block a frame pointing at the web app, but not one served
 * by the extension.
 */
function embed(link: HTMLAnchorElement, id: string): void {
  const frame = document.createElement("iframe");
  const src = new URL(browser.runtime.getURL("/github-player.html"));
  src.searchParams.set("id", id);
  src.searchParams.set("url", link.href);
  frame.src = src.href;
  frame.title = "CaptureFlow recording";
  frame.allow = "fullscreen; autoplay; picture-in-picture";
  frame.allowFullscreen = true;
  frame.dataset.captureflowFrame = id;
  Object.assign(frame.style, {
    display: "block",
    width: "100%",
    maxWidth: `${MAX_WIDTH}px`,
    aspectRatio: "16 / 9",
    border: "0",
    borderRadius: "6px",
    marginBottom: "4px",
    background: "#000",
  });
  link.before(frame);
}

// Only a bare pasted link gets a player; a link written into a sentence stays text.
function isBareLink(link: HTMLAnchorElement): boolean {
  const text = link.textContent?.trim() ?? "";
  return text === link.href || text === link.href.replace(/\/$/, "");
}

function scan(root: ParentNode): void {
  for (const link of root.querySelectorAll<HTMLAnchorElement>(
    `.markdown-body a[href]:not([${EMBEDDED}])`,
  )) {
    link.setAttribute(EMBEDDED, "");
    if (!isBareLink(link)) continue;
    if (!shareSlugFromUrl(link.href, WEB_BASE, PRODUCTION_WEB_BASE)) continue;
    embed(link, crypto.randomUUID());
  }
}

function onPlayerMessage(event: MessageEvent<GithubPlayerMessage>): void {
  if (event.origin !== new URL(browser.runtime.getURL("/")).origin) return;
  const message = event.data;
  const frame = document.querySelector<HTMLIFrameElement>(
    `iframe[data-captureflow-frame="${CSS.escape(message?.id ?? "")}"]`,
  );
  if (!frame) return;
  if (message.type === "captureflow-player-unavailable") {
    console.info(`[CaptureFlow] No player: ${message.reason}`);
    frame.remove();
  } else if (message.type === "captureflow-player-ready") {
    frame.style.aspectRatio = `${message.width} / ${message.height}`;
  }
}

export default defineContentScript({
  matches: ["https://github.com/*"],
  exclude: ["firefox"],
  main() {
    window.addEventListener("message", onPlayerMessage);
    scan(document);
    let queued = false;
    // GitHub renders comments client-side and swaps pages without reloading.
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan(document);
      });
    }).observe(document.body, { childList: true, subtree: true });
  },
});
