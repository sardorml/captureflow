import type { CursorType } from '../../../../shared/types'

// Kept separate from the editor's video-renderer so the share compositing
// encoder stays self-contained in the recorder build.
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  )
}

export function interpolateCursor(
  cursor: { time: number; x: number; y: number; cursorType?: CursorType }[],
  timeMs: number
): { x: number; y: number; cursorType: CursorType } | null {
  if (cursor.length === 0) return null
  if (timeMs <= cursor[0].time) {
    return { x: cursor[0].x, y: cursor[0].y, cursorType: cursor[0].cursorType ?? 'arrow' }
  }
  if (timeMs >= cursor[cursor.length - 1].time) {
    const last = cursor[cursor.length - 1]
    return { x: last.x, y: last.y, cursorType: last.cursorType ?? 'arrow' }
  }
  let lo = 0
  let hi = cursor.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (cursor[mid].time <= timeMs) lo = mid
    else hi = mid
  }
  const p1 = cursor[lo]
  const p2 = cursor[hi]
  const t = (timeMs - p1.time) / (p2.time - p1.time || 1)

  const p0 = cursor[Math.max(0, lo - 1)]
  const p3 = cursor[Math.min(cursor.length - 1, hi + 1)]

  const cursorType = (t < 0.5 ? p1.cursorType : p2.cursorType) ?? 'arrow'

  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
    y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
    cursorType
  }
}
