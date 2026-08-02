export const BUBBLE_FRAME_ID = "captureflow-camera-bubble";
export const GRANT_FRAME_ID = "captureflow-media-grant";

/*
 * Injected via chrome.scripting (serialized): mounts/re-points a circular
 * extension-origin iframe previewing the camera. Args only — the serialized body
 * can't close over module scope.
 */
export function mountCameraBubble(frameUrl: string, frameId: string): void {
  const existing = document.getElementById(frameId);
  if (existing instanceof HTMLIFrameElement) {
    existing.src = frameUrl;
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:fixed;bottom:24px;left:24px;width:220px;height:220px;border:0;" +
    "border-radius:50%;z-index:2147483647;background:transparent;" +
    "box-shadow:0 8px 28px rgba(0,0,0,.35);";
  document.documentElement.appendChild(iframe);
}

/*
 * Near-invisible variant for the combined camera+mic grant: the native prompt
 * is attributed to the extension frame, so the frame must be in the page, but
 * nothing should render. 1×1 (not display:none — Chrome may not service
 * getUserMedia from an undisplayed frame).
 */
export function mountGrantFrame(frameUrl: string, frameId: string): void {
  if (document.getElementById(frameId)) return;
  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:fixed;bottom:0;left:0;width:1px;height:1px;border:0;" +
    "opacity:0;pointer-events:none;z-index:2147483647;";
  document.documentElement.appendChild(iframe);
}

export function unmountCameraBubble(frameId: string): void {
  document.getElementById(frameId)?.remove();
}
