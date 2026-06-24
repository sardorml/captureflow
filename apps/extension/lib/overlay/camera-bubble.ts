export const BUBBLE_FRAME_ID = "captureflow-camera-bubble";

// Serialized by chrome.scripting and run in the page: mounts (or re-points) a
// circular, extension-origin iframe in the bottom-left that previews the camera.
// Running at the extension origin also grabs the camera/mic grant the offscreen
// recorder reuses. Every value arrives as an argument — the serialized body
// can't close over module scope.
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
    "position:fixed;bottom:24px;left:24px;width:160px;height:160px;border:0;" +
    "border-radius:50%;z-index:2147483647;background:transparent;" +
    "box-shadow:0 8px 28px rgba(0,0,0,.35);";
  document.documentElement.appendChild(iframe);
}

export function unmountCameraBubble(frameId: string): void {
  document.getElementById(frameId)?.remove();
}
