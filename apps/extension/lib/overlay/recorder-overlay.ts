export const RECORDER_FRAME_ID = "captureflow-recorder-frame";
export const RECORDER_BACKDROP_ID = "captureflow-recorder-backdrop";

/*
 * Injected via chrome.scripting (serialized): toggles the in-page recorder —
 * a blurred/dimmed backdrop with the extension panel floating top-right. Clicking the backdrop closes it page-side (no SW round-trip).
 * Args only — the serialized body can't close over module scope.
 *
 * The iframe is wider than the panel: the card hugs its right edge and the
 * gutter is transparent, so the panel's own menus can open beside it instead
 * of being clipped at its edge. The card paints its rounding and shadow
 * itself, and clicks on the gutter close the panel from inside.
 *
 * color-scheme on the frame is load-bearing: if the panel's used scheme (dark)
 * differs from the embedder's, the transparent gutter is repainted as an
 * opaque white canvas over the page.
 */
export function toggleRecorderOverlay(
  frameUrl: string,
  frameId: string,
  backdropId: string,
): boolean {
  const existing = document.getElementById(frameId);
  if (existing) {
    existing.remove();
    document.getElementById(backdropId)?.remove();
    return false;
  }

  const backdrop = document.createElement("div");
  backdrop.id = backdropId;
  backdrop.style.cssText =
    "position:fixed;inset:0;z-index:2147483646;background:rgba(10,11,14,.45);" +
    "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);";
  backdrop.addEventListener("click", () => {
    backdrop.remove();
    document.getElementById(frameId)?.remove();
    // Closing page-side keeps this instant, but the worker still has to hear
    // about it — the camera preview it owns outlives the panel otherwise.
    chrome.runtime.sendMessage({ recorderOverlayClosed: true });
  });

  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:fixed;top:14px;right:14px;width:548px;height:0;border:0;" +
    "z-index:2147483647;background:transparent;color-scheme:dark;" +
    "transition:height .15s ease;";

  // If no height report ever lands, show the panel at a sane size instead of
  // leaving a 0px (invisible) frame. Literals: serialized body, no outer scope.
  setTimeout(() => {
    const frame = document.getElementById(frameId);
    if (frame instanceof HTMLIFrameElement && frame.style.height === "0px") {
      frame.style.height = "440px";
    }
  }, 600);

  document.documentElement.appendChild(backdrop);
  document.documentElement.appendChild(iframe);
  return true;
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
}

export function removeRecorderOverlay(
  frameId: string,
  backdropId: string,
): void {
  document.getElementById(frameId)?.remove();
  document.getElementById(backdropId)?.remove();
}

// Screenshot capture hides the overlay for a frame so the blur and panel
// never end up baked into the captured image.
export function setRecorderOverlayVisible(
  visible: boolean,
  frameId: string,
  backdropId: string,
): void {
  const value = visible ? "visible" : "hidden";
  const frame = document.getElementById(frameId);
  const backdrop = document.getElementById(backdropId);
  if (frame) frame.style.visibility = value;
  if (backdrop) backdrop.style.visibility = value;
}
