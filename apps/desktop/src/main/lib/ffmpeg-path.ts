import { existsSync } from 'fs'
import { resolve } from 'path'
import { app } from 'electron'

let cached: string

export function getFfmpegPath(): string {
  if (cached) return cached

  if (app.isPackaged) {
    // ffmpeg-static is listed in `asarUnpack`, so the binary lives at
    // `<App>/Contents/Resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg`.
    // `process.resourcesPath` is `<App>/Contents/Resources` — it does NOT contain
    // `app.asar`, so the previous `.replace('app.asar', 'app.asar.unpacked')` was
    // a silent no-op that pointed spawn at a non-existent path and made every
    // export fail with "No active pipe export".
    cached = resolve(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      'ffmpeg-static',
      'ffmpeg'
    )
    return cached
  }

  // Development — walk up from out/main to find node_modules
  const candidates = [
    resolve(__dirname, '../../node_modules/ffmpeg-static/ffmpeg'),
    resolve(__dirname, '../../../../node_modules/ffmpeg-static/ffmpeg'),
    resolve(__dirname, '../../../../../node_modules/ffmpeg-static/ffmpeg')
  ]

  cached = candidates.find(existsSync) ?? 'ffmpeg'
  return cached
}
