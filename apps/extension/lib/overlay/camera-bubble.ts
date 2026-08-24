export const BUBBLE_FRAME_ID = "captureflow-camera-bubble";
export const GRANT_FRAME_ID = "captureflow-media-grant";

/*
 * Injected via chrome.scripting (serialized): mounts/re-points a circular
 * extension-origin iframe previewing the camera. Args only — the serialized body
 * can't close over module scope.
 */
export function mountCameraBubble(frameUrl: string, frameId: string): void {
  const existing = document.getElementById(frameId);
  if (existing) {
    const frame = existing.querySelector("iframe");
    if (frame) frame.src = frameUrl;
    return;
  }
  /*
   * The circle is cut here because the frame's own content has to stay opaque
   * to its corners: it is out-of-process, so a partly-transparent pixel in
   * there composites against a white base rather than against the page and the
   * frame's square shows through as white. The backdrop is also what the user
   * sees for the beat before the frame has loaded.
   */
  const root = document.createElement("div");
  root.id = frameId;
  root.style.cssText =
    "position:fixed;bottom:24px;left:24px;width:220px;height:220px;" +
    "z-index:2147483647;pointer-events:none;overflow:hidden;" +
    "border-radius:50%;background:#16181d;";

  const iframe = document.createElement("iframe");
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0;" +
    "border-radius:50%;background:transparent;";

  root.append(iframe);
  document.documentElement.appendChild(root);
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
