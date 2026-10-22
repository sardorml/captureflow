export const AREA_SELECT_ID = "captureflow-area-select";

// A viewport rectangle in CSS pixels, with the ratio to turn it into the
// device pixels captureVisibleTab hands back.
export type PageArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  dpr: number;
};

const isFinitePx = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function isPageArea(value: unknown): value is PageArea {
  if (typeof value !== "object" || value === null) return false;
  const area = value as Record<string, unknown>;
  return (
    isFinitePx(area.x) &&
    isFinitePx(area.y) &&
    isFinitePx(area.width) &&
    isFinitePx(area.height) &&
    isFinitePx(area.dpr) &&
    area.width > 0 &&
    area.height > 0 &&
    area.dpr > 0
  );
}

/*
 * Injected via chrome.scripting (serialized): a crosshair sheet over the page
 * where a drag draws the rectangle to capture. Reports the result as a raw
 * runtime message the worker relays, since this body can't close over module
 * scope. Escape, or a drag too small to mean anything, reports null.
 */
export function selectPageArea(sheetId: string): void {
  document.getElementById(sheetId)?.remove();

  const sheet = document.createElement("div");
  sheet.id = sheetId;
  sheet.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;cursor:crosshair;" +
    "background:rgba(0,0,0,.25);touch-action:none;user-select:none;";

  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;display:none;box-sizing:border-box;" +
    "border:1.5px solid #0485f7;background:rgba(4,133,247,.12);" +
    "box-shadow:0 0 0 9999px rgba(0,0,0,.25);pointer-events:none;";
  const size = document.createElement("div");
  size.style.cssText =
    "position:absolute;top:100%;left:0;margin-top:6px;padding:2px 6px;" +
    "border-radius:6px;background:#0485f7;color:#fff;" +
    "font:600 11px/1.4 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;";
  box.appendChild(size);
  sheet.appendChild(box);

  let start: { x: number; y: number } | null = null;
  let rect = { x: 0, y: 0, width: 0, height: 0 };

  const finish = (area: typeof rect | null): void => {
    document.removeEventListener("keydown", onKey, true);
    sheet.remove();
    chrome.runtime.sendMessage({
      captureflowArea: area && { ...area, dpr: window.devicePixelRatio },
    });
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    finish(null);
  };

  sheet.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    sheet.setPointerCapture(event.pointerId);
    start = { x: event.clientX, y: event.clientY };
    // The sheet's own dim gives way to the box's cut-out once there is one.
    sheet.style.background = "transparent";
    box.style.display = "block";
  });
  sheet.addEventListener("pointermove", (event) => {
    if (!start) return;
    const x = Math.max(0, Math.min(start.x, event.clientX));
    const y = Math.max(0, Math.min(start.y, event.clientY));
    const right = Math.min(window.innerWidth, Math.max(start.x, event.clientX));
    const bottom = Math.min(
      window.innerHeight,
      Math.max(start.y, event.clientY),
    );
    rect = { x, y, width: right - x, height: bottom - y };
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    size.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  });
  sheet.addEventListener("pointerup", () => {
    if (!start) return;
    finish(rect.width >= 4 && rect.height >= 4 ? rect : null);
  });
  document.addEventListener("keydown", onKey, true);
  document.documentElement.appendChild(sheet);
}
