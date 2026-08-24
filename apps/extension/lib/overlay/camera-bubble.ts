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
  const root = document.createElement("div");
  root.id = frameId;
  root.style.cssText =
    "position:fixed;bottom:24px;left:24px;width:220px;height:220px;" +
    "z-index:2147483647;pointer-events:none;";

  /*
   * Nothing inside the frame may be partly transparent: it is out-of-process,
   * so those pixels composite against a white base rather than against the
   * page, and a rounded edge or a shadow drawn in there fringes white. The
   * frame paints opaque video and nothing else.
   */
  const iframe = document.createElement("iframe");
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0;" +
    "border-radius:50%;background:transparent;";

  /*
   * That leaves the page-side clip, which for an out-of-process frame is a
   * composited layer clip Chrome does not antialias — the circle came out
   * stair-stepped. This ring is ordinary page content, so its edges are
   * antialiased. Its band runs r=105..113 either side of the frame's r=110
   * boundary, which is the only thing hiding those steps, and the z-index is
   * what keeps it there: the frame is composited, and without an explicit
   * layer above it the ring can end up painting behind the very edge it is
   * covering. The drop shadow rides on the ring so it follows a smooth circle.
   */
  const ring = document.createElement("div");
  ring.style.cssText =
    "position:absolute;left:-3px;top:-3px;width:226px;height:226px;z-index:1;" +
    "box-sizing:border-box;border:8px solid #16181d;border-radius:50%;" +
    "box-shadow:0 8px 28px rgba(0,0,0,.35);";

  root.append(iframe, ring);
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
