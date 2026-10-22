export const BUBBLE_FRAME_ID = "captureflow-camera-bubble";
export const GRANT_FRAME_ID = "captureflow-media-grant";

/*
 * Injected via chrome.scripting (serialized): mounts/re-points a circular
 * extension-origin iframe previewing the camera, or standing in for it while
 * the camera is off. The bubble drags, and reports where it was dropped as a
 * raw runtime message so the worker can put it back there next time. Args
 * only — the serialized body can't close over module scope.
 */
export function mountCameraBubble(
  frameUrl: string,
  frameId: string,
  position: { left: number; top: number } | null,
): void {
  const existing = document.getElementById(frameId);
  if (existing) {
    const frame = existing.querySelector("iframe");
    if (frame && frame.src !== frameUrl) frame.src = frameUrl;
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
    "position:fixed;width:220px;height:220px;z-index:2147483647;" +
    "overflow:hidden;border-radius:50%;background:#16181d;" +
    "cursor:grab;touch-action:none;user-select:none;" +
    // Grows in from the centre; unmount plays it back.
    "opacity:0;transform:scale(.6);transition:opacity .18s ease-out," +
    "transform .22s cubic-bezier(.2,.8,.2,1);" +
    (position
      ? `left:${position.left}px;top:${position.top}px;`
      : "bottom:24px;left:24px;");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.style.transition = "none";
  }

  // The frame has nothing to click, so pointer events stay on the root,
  // which is what makes the whole circle a drag handle.
  const iframe = document.createElement("iframe");
  iframe.src = frameUrl;
  iframe.allow = "camera; microphone";
  iframe.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0;" +
    "border-radius:50%;background:transparent;pointer-events:none;";

  root.addEventListener("pointerdown", (event) => {
    const rect = root.getBoundingClientRect();
    const dx = event.clientX - rect.left;
    const dy = event.clientY - rect.top;
    let left = rect.left;
    let top = rect.top;
    root.setPointerCapture(event.pointerId);
    root.style.cursor = "grabbing";
    const move = (ev: PointerEvent) => {
      left = Math.min(Math.max(0, ev.clientX - dx), innerWidth - rect.width);
      top = Math.min(Math.max(0, ev.clientY - dy), innerHeight - rect.height);
      root.style.left = `${left}px`;
      root.style.top = `${top}px`;
      root.style.bottom = "auto";
    };
    const up = () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.style.cursor = "grab";
      chrome.runtime.sendMessage({ bubbleMoved: { left, top } });
    };
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
  });

  root.append(iframe);
  document.documentElement.appendChild(root);
  // Two frames in: the first paints the start state, the second transitions.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      root.style.opacity = "1";
      root.style.transform = "scale(1)";
    }),
  );
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

// Shrinks away, then goes; the id is dropped at once so a remount in the
// meantime starts a fresh bubble instead of adopting the leaving one.
export function unmountCameraBubble(frameId: string): void {
  const root = document.getElementById(frameId);
  if (!root) return;
  root.id = "";
  root.style.pointerEvents = "none";
  root.style.opacity = "0";
  root.style.transform = "scale(.6)";
  setTimeout(() => root.remove(), 240);
}
