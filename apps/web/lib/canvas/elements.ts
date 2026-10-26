export type Stroke = { color: string; width: number };

export type CanvasElement =
  | {
      id: string;
      kind: "pen" | "highlighter";
      points: number[];
      x: number;
      y: number;
      stroke: Stroke;
    }
  | {
      id: string;
      kind: "rect" | "ellipse";
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: Stroke;
    }
  | {
      id: string;
      kind: "arrow" | "line";
      points: [number, number, number, number];
      x: number;
      y: number;
      stroke: Stroke;
    }
  | {
      id: string;
      kind: "text";
      x: number;
      y: number;
      text: string;
      color: string;
      size: number;
    };

export type CanvasElementKind = CanvasElement["kind"];

export const CANVAS_COLORS = [
  "#1b1b1f",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#9c36b5",
] as const;

export const STROKE_WIDTHS = [2, 4, 8] as const;

export const TEXT_SIZE = 24;

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// A rectangle drawn from any corner, with non-negative size.
export function normalizeRect(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(from.x, to.x),
    y: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  };
}

// Too small to have been meant: a click where a drag was expected.
export function isDegenerate(element: CanvasElement): boolean {
  switch (element.kind) {
    case "rect":
    case "ellipse":
      return element.width < 2 && element.height < 2;
    case "arrow":
    case "line": {
      const [x1, y1, x2, y2] = element.points;
      return Math.hypot(x2 - x1, y2 - y1) < 2;
    }
    case "text":
      return element.text.trim() === "";
    default:
      return false;
  }
}
