export const RECORDER_FRAME_ID = "captureflow-recorder-frame";
export const RECORDER_BACKDROP_ID = "captureflow-recorder-backdrop";

/*
 * Injected via chrome.scripting (serialized): toggles the in-page recorder, or
 * with openOnly just makes sure it's open —
 * a dimmed backdrop with the extension panel floating top-right. Clicking the
 * backdrop closes it page-side (no SW round-trip).
 * Args only — the serialized body can't close over module scope.
 *
 * The iframe is wider than the panel and the card sits inset from its edges
 * (the panel's own padding), so its shadow has room and the gutter is
 * transparent for menus to open beside it. The card paints its rounding and
 * shadow itself, and clicks on the gutter close the panel from inside.
 *
 * color-scheme on the frame is load-bearing: if the panel's used scheme (dark)
 * differs from the embedder's, the transparent gutter is repainted as an
 * opaque white canvas over the page.
 */
export function toggleRecorderOverlay(
  frameUrl: string,
  frameId: string,
  backdropId: string,
  theme: "light" | "dark" | "system",
  openOnly: boolean,
): "opened" | "closed" | "already-open" {
  const existing = document.getElementById(frameId);
  if (existing) {
    if (openOnly) return "already-open";
    existing.remove();
    document.getElementById(backdropId)?.remove();
    return "closed";
  }

  // "system" resolves here, on the page, where the OS setting is readable;
  // the worker has no matchMedia. Dim and veil are repeated verbatim in
  // setRecorderBackdropTheme, since this body can't share a module constant.
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const backdrop = document.createElement("div");
  backdrop.id = backdropId;
  backdrop.style.cssText =
    "position:fixed;inset:0;z-index:2147483646;background:" +
    (dark ? "rgba(0,0,0,.67)" : "rgba(246,245,241,.72)") +
    ";";
  backdrop.addEventListener("click", () => {
    backdrop.remove();
    document.getElementById(frameId)?.remove();
    // Closing page-side keeps this instant, but the worker still has to hear
    // about it — the camera preview it owns outlives the panel otherwise.
    chrome.runtime.sendMessage({ recorderOverlayClosed: true });
  });

  /*
   * Opens on opacity and transform, which the compositor animates on its own
   * thread. Animating `height` instead ran the open through layout on the
   * page's main thread, so it stuttered whenever anything else wanted that
   * thread — switching the camera on mounts an out-of-process frame and calls
   * getUserMedia there, right in the middle of the 150ms.
   */
  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:fixed;top:0;right:0;width:620px;height:0;border:0;" +
    "z-index:2147483647;background:transparent;color-scheme:dark;" +
    "opacity:0;transform:translateY(-6px);transform-origin:100% 0;" +
    "transition:opacity .16s ease-out,transform .16s ease-out;";

  // If no height report ever lands, show the panel at a sane size instead of
  // leaving a 0px (invisible) frame. Literals: serialized body, no outer scope.
  setTimeout(() => {
    const frame = document.getElementById(frameId);
    if (frame instanceof HTMLIFrameElement && frame.style.height === "0px") {
      frame.style.height = "520px";
      frame.dataset.shown = "1";
      frame.style.opacity = "1";
      frame.style.transform = "none";
    }
  }, 600);

  document.documentElement.appendChild(backdrop);
  document.documentElement.appendChild(iframe);
  return "opened";
}

// Height reports flow app → SW → this (chrome.scripting), not postMessage:
// runtime messaging works on every page, unlike page-window message events.
export function setRecorderOverlayHeight(
  height: number,
  frameId: string,
): void {
  const frame = document.getElementById(frameId);
  if (!(frame instanceof HTMLIFrameElement)) return;
  const max = Math.round(window.innerHeight * 0.92);
  frame.style.height = `${Math.min(Math.max(Math.round(height), 0), max)}px`;

  // The first report is what the panel opens on: it is the first height worth
  // showing. Later ones resize a panel that is already up.
  if (frame.dataset.shown === "1") return;
  frame.dataset.shown = "1";
  requestAnimationFrame(() => {
    frame.style.opacity = "1";
    frame.style.transform = "none";
  });
}

export function removeRecorderOverlay(
  frameId: string,
  backdropId: string,
): void {
  document.getElementById(frameId)?.remove();
  document.getElementById(backdropId)?.remove();
}

// The panel repaints the backdrop when its theme changes while it is open.
export function setRecorderBackdropTheme(
  theme: "light" | "dark",
  backdropId: string,
): void {
  const backdrop = document.getElementById(backdropId);
  if (!backdrop) return;
  backdrop.style.background =
    theme === "dark" ? "rgba(0,0,0,.67)" : "rgba(246,245,241,.72)";
}

export const CONTROL_BAR_HOST_ID = "captureflow-control-bar";

// Hides every piece of the extension's page chrome, dim, panel, bubble and
// control bar, so none of it is baked into a screenshot.
export function setRecorderOverlayVisible(
  visible: boolean,
  ids: string[],
): void {
  const value = visible ? "visible" : "hidden";
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) element.style.visibility = value;
  }
}
