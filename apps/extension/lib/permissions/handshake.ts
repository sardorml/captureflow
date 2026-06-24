export const PERMISSION_FRAME_ID = "captureflow-permission-frame";
export const PERMISSION_MESSAGE_SOURCE = "captureflow-permissions";

// Serialized by chrome.scripting and run in the page: embeds a hidden extension
// iframe that prompts for camera/mic in the current tab, then removes it once the
// iframe posts back. The grant belongs to the extension origin (a content-script
// getUserMedia would grant the page, which is useless to us). Every value arrives
// as an argument because the serialized body can't close over module scope.
export function injectPermissionFrame(
  frameUrl: string,
  frameId: string,
  messageSource: string,
): void {
  document.getElementById(frameId)?.remove();
  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;";
  const origin = new URL(frameUrl).origin;
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== origin || event.data?.source !== messageSource) return;
    window.removeEventListener("message", onMessage);
    iframe.remove();
  };
  window.addEventListener("message", onMessage);
  document.documentElement.appendChild(iframe);
}
