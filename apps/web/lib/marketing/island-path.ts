export const ISLAND_DROP = 14;
const ISLAND_RADIUS = 24;
const SHOULDER = { width: 11, height: 14 };
const KAPPA = 0.5523;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/*
 * The nav island's outline at `p` (0 attached, 1 floating). Each top corner is
 * one cubic that runs from the concave shoulder at rest to a convex rounded
 * corner, so the shape bends between them without ever splitting.
 */
export function islandPath(w: number, h: number, p: number) {
  if (!w || !h) return "";
  const r = ISLAND_RADIUS;
  const k = r * KAPPA;
  const t = Math.min(1.15, Math.max(0, p));
  const [a, b, c, d] = [
    [lerp(-SHOULDER.width, r, t), 0],
    [lerp(-SHOULDER.width + 6, r - k, t), lerp(1, 0, t)],
    [0, lerp(7, r - k, t)],
    [0, lerp(SHOULDER.height, r, t)],
  ];
  const mx = (x: number) => w - x;
  return [
    `M${a[0]} ${a[1]}`,
    `L${mx(a[0])} ${a[1]}`,
    `C${mx(b[0])} ${b[1]} ${mx(c[0])} ${c[1]} ${mx(d[0])} ${d[1]}`,
    `L${w} ${h - r}`,
    `C${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h}`,
    `L${r} ${h}`,
    `C${r - k} ${h} 0 ${h - r + k} 0 ${h - r}`,
    `L${d[0]} ${d[1]}`,
    `C${c[0]} ${c[1]} ${b[0]} ${b[1]} ${a[0]} ${a[1]}`,
    "Z",
  ].join(" ");
}
