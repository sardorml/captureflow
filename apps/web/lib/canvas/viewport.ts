export type Viewport = { x: number; y: number; scale: number };

export type Point = { x: number; y: number };

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 8;
export const ZOOM_STEP = 1.2;

export function toWorld(view: Viewport, screen: Point): Point {
  return {
    x: (screen.x - view.x) / view.scale,
    y: (screen.y - view.y) / view.scale,
  };
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

// Zooms so the world point under `anchor` stays under it.
export function zoomAround(
  view: Viewport,
  anchor: Point,
  scale: number,
): Viewport {
  const next = clampScale(scale);
  const world = toWorld(view, anchor);
  return {
    scale: next,
    x: anchor.x - world.x * next,
    y: anchor.y - world.y * next,
  };
}

export function panBy(view: Viewport, dx: number, dy: number): Viewport {
  return { ...view, x: view.x + dx, y: view.y + dy };
}

// Wheel deltas come in pixels, lines or pages; trackpad pinches arrive as
// ctrl+wheel. One notch of a mouse wheel is about 100 px.
export function wheelScale(deltaY: number, deltaMode: number): number {
  const px =
    deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  return Math.exp(-px / 300);
}
