import type { CursorType } from '../../../shared/types'

import arrowUrl from '@/assets/cursors/Cursor=Default.svg'
import pointerUrl from '@/assets/cursors/Cursor=Hand-(Pointing).svg'
import textUrl from '@/assets/cursors/Cursor=Text-Cursor.svg'
import crosshairUrl from '@/assets/cursors/Cursor=Cross.svg'
import openHandUrl from '@/assets/cursors/Cursor=Hand-(Open).svg'
import closedHandUrl from '@/assets/cursors/Cursor=Hand-(Grabbing).svg'
import resizeEwUrl from '@/assets/cursors/Cursor=Resize-West-East.svg'
import resizeNsUrl from '@/assets/cursors/Cursor=Resize-North-South.svg'

type CursorAsset = {
  url: string
  // Hotspot as fraction of image size (0-1)
  hotspotX: number
  hotspotY: number
}

// Hotspots derived from macOS NSCursor hotspot values mapped to each SVG's viewBox.
// Arrow and text report 0x0 from NSCursor; hotspots determined from SVG path geometry.
const CURSOR_ASSETS: Record<CursorType, CursorAsset> = {
  arrow: { url: arrowUrl, hotspotX: 15 / 32, hotspotY: 13 / 32 },
  pointer: { url: pointerUrl, hotspotX: 16.6 / 32, hotspotY: 14.2 / 33 },
  text: { url: textUrl, hotspotX: 16 / 32, hotspotY: 16 / 32 },
  crosshair: { url: crosshairUrl, hotspotX: 16 / 32, hotspotY: 16 / 32 },
  'open-hand': { url: openHandUrl, hotspotX: 16 / 32, hotspotY: 17 / 32 },
  'closed-hand': { url: closedHandUrl, hotspotX: 16 / 32, hotspotY: 17 / 32 },
  'resize-ew': { url: resizeEwUrl, hotspotX: 16 / 32, hotspotY: 16 / 32 },
  'resize-ns': { url: resizeNsUrl, hotspotX: 16 / 32, hotspotY: 16 / 32 }
}

export type CursorImageMap = Map<CursorType, HTMLImageElement>

/** Load all cursor SVGs into Image elements. Returns a map keyed by cursor type. */
export async function loadCursorImages(): Promise<CursorImageMap> {
  const map: CursorImageMap = new Map()

  const entries = Object.entries(CURSOR_ASSETS) as [CursorType, CursorAsset][]
  await Promise.all(
    entries.map(
      ([type, asset]) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            map.set(type, img)
            resolve()
          }
          img.onerror = () => resolve()
          img.src = asset.url
        })
    )
  )

  return map
}

/** Get the hotspot for a cursor type as fraction of image size. */
export function getCursorHotspot(type: CursorType): { x: number; y: number } {
  const asset = CURSOR_ASSETS[type]
  return { x: asset.hotspotX, y: asset.hotspotY }
}
