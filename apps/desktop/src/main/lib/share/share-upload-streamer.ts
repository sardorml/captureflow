/**
 * ShareUploadStreamer (main process)
 * ──────────────────────────────────
 * Holds the in-flight state for one share recording. Owns two parallel
 * R2 multipart streams (screen + optional webcam), buffers bytes into
 * 5+ MiB parts, POSTs each via /part + /webcam-part as they
 * fill, and finalizes both at stop.
 *
 * Lifecycle:
 *   start(meta)            — POST /init at record START. Returns
 *                            the slug; renderer arms the pipeline.
 *   pushScreenBytes(buf)   — fire-and-forget; buffers + flushes parts
 *   pushWebcamBytes(buf)     when threshold hit.
 *   finish(meta)           — flush any tails, POST /finalize +
 *                            /webcam-finalize, return edit URL.
 *   abort()                — discard state. Worker cron reaps stale
 *                            `pending` rows; no /abort call.
 *
 * Connectivity: on `setShareConnectivity('offline')` the streamer pauses
 * POSTs and queues bytes. On `'online'`, it drains.
 *
 * Single-instance: only one share session is live at a time (the user
 * can only record one stream at a time), so the streamer module holds
 * a single session ref. Concurrent attempts to start a new session
 * abort the previous one.
 */

import { loadDeviceId } from '../device-id'
import { logInfo, logWarn } from '../logger'
import { onShareConnectivityChange, getShareConnectivity } from './share-connectivity'
import { getActiveWorkspaceId } from './share-workspaces'
import { CHUNK_BYTES, postBytes, postJson, ShareApiHttpError } from './share-api-client'
import { buildShareEditUrl } from './share-edit-url'
import { handleUploadError, type ShareUploadFailure } from './share-error-handler'
import type {
  ShareFinishMeta,
  ShareFinishResult,
  ShareStartMeta,
  ShareStartResult
} from '../../../shared/types'

type InitResponse = {
  slug: string
  uploadId: string
  storageKey: string
  webcamUploadId?: string
  webcamStorageKey?: string
}

type PartResponse = { partNumber: number; etag: string }
type FinalizeResponse = { url: string }

type Stream = {
  // R2 multipart upload id; null if this stream isn't in use (e.g.
  // webcam stream when the recording has no camera).
  uploadId: string | null
  partNumber: number
  etags: { partNumber: number; etag: string }[]
  // In-memory buffer of un-shipped bytes. Drained into a single part
  // POST when the buffer reaches CHUNK_BYTES, and again on finish().
  buf: Uint8Array[]
  bufBytes: number
  // Sum of all bytes ever pushed to this stream (across already-shipped
  // parts and the pending buffer). Reported to /finalize.
  totalBytes: number
  // Mutex: only one part POST in flight at a time per stream. Lets the
  // renderer fire pushBytes() at any rate; the streamer queues bytes
  // and pumps them out as parts complete.
  inFlight: Promise<void> | null
  // Path suffix used to build the part URL. Distinguishes screen
  // (`/part`) from webcam (`/webcam-part`).
  partPath: string
}

type Session = {
  slug: string
  deviceId: string
  hasWebcam: boolean
  screen: Stream
  webcam: Stream
  // Latched when the connectivity emitter says offline; bytes still
  // buffer in memory, but the flusher returns early until reconnect.
  paused: boolean
  unsubConnectivity: () => void
  // Marks abort() so any in-flight pushBytes/flush short-circuits
  // without raising. The streamer module ref is also cleared, so a
  // new session can claim the slot immediately.
  aborted: boolean
  // Latched once finishShareUpload starts draining the tail. flushTail claims
  // part numbers WITHOUT setting stream.inFlight, so a late renderer push must
  // not also run pumpStream and race for the same part numbers — this flag
  // stops new pumps for the rest of the session.
  finishing: boolean
}

let session: Session | null = null

function makeStream(uploadId: string | null, partPath: string): Stream {
  return {
    uploadId,
    partNumber: 1,
    etags: [],
    buf: [],
    bufBytes: 0,
    totalBytes: 0,
    inFlight: null,
    partPath
  }
}

export async function startShareUpload(meta: ShareStartMeta): Promise<ShareStartResult> {
  if (session) {
    // Caller didn't await abort() before re-starting. Discard the
    // previous session quietly.
    logWarn('share-streamer', 'starting new session while previous still live; aborting prior')
    abortShareUpload()
  }

  const deviceId = await loadDeviceId()
  try {
    const init = await postJson<InitResponse>('/init', deviceId, {
      contentType: 'video/mp4',
      source: 'instant',
      preset: 'share',
      title: meta.title ?? undefined,
      hasWebcam: meta.hasWebcam === true,
      // Drop the toolbar chip's current selection so the new share
      // lands in the right workspace. Null falls back to personal on
      // the server, matching the pre-picker behaviour.
      workspaceId: getActiveWorkspaceId() ?? undefined
    })
    const unsubConnectivity = onShareConnectivityChange((state) => {
      if (!session) return
      session.paused = state === 'offline'
      if (state === 'online') {
        void pumpStream(session, session.screen)
        if (session.webcam.uploadId) void pumpStream(session, session.webcam)
      }
    })
    session = {
      slug: init.slug,
      deviceId,
      hasWebcam: !!init.webcamUploadId,
      screen: makeStream(init.uploadId, '/part'),
      webcam: makeStream(init.webcamUploadId ?? null, '/webcam-part'),
      paused: getShareConnectivity() === 'offline',
      unsubConnectivity,
      aborted: false,
      finishing: false
    }
    logInfo(
      'share-streamer',
      `started: slug=${init.slug}, screen=${init.uploadId.slice(0, 12)}…, webcam=${
        init.webcamUploadId ? init.webcamUploadId.slice(0, 12) + '…' : 'none'
      }`
    )
    return { ok: true, slug: init.slug, editUrl: buildShareEditUrl(init.slug) }
  } catch (err) {
    const failure = handleUploadError(err, { phase: 'init' })
    return failureToStart(failure)
  }
}

export function pushScreenBytes(bytes: ArrayBuffer): void {
  const s = session
  if (!s || s.aborted) return
  pushBytes(s, s.screen, bytes)
}

// Slug of the in-flight share, or null when no recording is active.
// SHARE_UPLOAD_POSTER's handler uses this to route the poster bytes to
// /poster?slug=… without having to thread the slug through IPC.
export function getActiveShareSlug(): string | null {
  return session?.slug ?? null
}

export function getActiveDeviceId(): string | null {
  return session?.deviceId ?? null
}

export function pushWebcamBytes(bytes: ArrayBuffer): void {
  const s = session
  if (!s || s.aborted) return
  if (!s.webcam.uploadId) return // No webcam was reserved for this recording.
  pushBytes(s, s.webcam, bytes)
}

function pushBytes(s: Session, stream: Stream, bytes: ArrayBuffer): void {
  if (bytes.byteLength === 0) return
  const view = new Uint8Array(bytes)
  stream.buf.push(view)
  stream.bufBytes += view.byteLength
  stream.totalBytes += view.byteLength
  void pumpStream(s, stream)
}

async function pumpStream(s: Session, stream: Stream): Promise<void> {
  if (s.aborted) return
  // finishShareUpload's flushTail owns part-number claims from here on.
  if (s.finishing) return
  if (s.paused) return
  if (stream.inFlight) return
  if (stream.bufBytes < CHUNK_BYTES) return
  if (!stream.uploadId) return
  // Drain a single chunk; loop is driven by the next push or by the
  // resume event from connectivity.
  const partBytes = drainPart(stream, CHUNK_BYTES)
  const partNumber = stream.partNumber++
  stream.inFlight = (async () => {
    try {
      const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`
      const res = await postBytes<PartResponse>(path, s.deviceId, partBytes)
      stream.etags.push({ partNumber: res.partNumber, etag: res.etag })
      logInfo(
        'share-streamer',
        `${stream.partPath} part ${partNumber} ok: ${partBytes.byteLength}B`
      )
    } catch (err) {
      // Non-fatal at part level — finalize will surface the failure
      // with whatever parts did land. We log and stop trying for the
      // rest of the recording; subsequent pumpStream calls will see
      // inFlight cleared and pump again, but the broken state is
      // caught at finish() time. The handle-error side-effects
      // (auth-clear, connectivity flip) run here.
      handleUploadError(err, { slug: s.slug, phase: `part ${stream.partPath}` })
    } finally {
      stream.inFlight = null
      if (stream.bufBytes >= CHUNK_BYTES && !s.paused && !s.aborted) {
        void pumpStream(s, stream)
      }
    }
  })()
}

// Pull up to `maxBytes` from the head of stream.buf into a single
// contiguous Uint8Array. Leaves any leftover bytes in the first
// chunk's buffer for the next part.
function drainPart(stream: Stream, maxBytes: number): Uint8Array {
  const target = Math.min(stream.bufBytes, maxBytes)
  const out = new Uint8Array(target)
  let written = 0
  while (written < target && stream.buf.length > 0) {
    const head = stream.buf[0]
    const remaining = target - written
    if (head.byteLength <= remaining) {
      out.set(head, written)
      written += head.byteLength
      stream.buf.shift()
      stream.bufBytes -= head.byteLength
    } else {
      out.set(head.subarray(0, remaining), written)
      stream.buf[0] = head.subarray(remaining)
      stream.bufBytes -= remaining
      written += remaining
    }
  }
  return out
}

export async function finishShareUpload(meta: ShareFinishMeta): Promise<ShareFinishResult> {
  const s = session
  if (!s) {
    return { ok: false, error: 'No active share session', code: 'no_session' }
  }
  if (s.aborted) {
    clearSession()
    return { ok: false, error: 'Share session was aborted', code: 'aborted' }
  }

  // Stop any further pumpStream from claiming part numbers: flushTail below
  // drains the tail itself without holding stream.inFlight, so a late renderer
  // push must not race it for the same part number.
  s.finishing = true

  try {
    // Wait for any in-flight parts to settle, then flush the tail of
    // each stream. The tail can be < CHUNK_BYTES (R2 allows the last
    // part to be smaller).
    await flushTail(s, s.screen)
    if (s.webcam.uploadId) await flushTail(s, s.webcam)

    // Screen finalize is the load-bearing call; the webcam is best-
    // effort. If screen fails outright, we have no URL to give the
    // user. If webcam fails but screen succeeded, we still return the
    // URL — viewer falls back to screen-only.
    const screenFinal = await finalizeStream(s, s.screen, '/finalize', meta.screenTotalBytes)
    let webcamErr: ShareUploadFailure | null = null
    if (s.webcam.uploadId && s.webcam.etags.length > 0) {
      try {
        await finalizeStream(
          s,
          s.webcam,
          '/webcam-finalize',
          meta.webcamTotalBytes ?? s.webcam.totalBytes
        )
      } catch (err) {
        webcamErr = handleUploadError(err, { slug: s.slug, phase: 'webcam-finalize' })
      }
    }

    // The worker's /finalize returns the public viewer URL on
    // `captureflow.xyz/<slug>`. We instead hand the user the
    // edit URL on captureflow.xyz — keeping the worker's response
    // available in logs is enough for the desktop's purposes.
    logInfo(
      'share-streamer',
      `finished: slug=${s.slug}, viewerUrl=${screenFinal.url}, screenBytes=${
        s.screen.totalBytes
      }, webcamBytes=${s.webcam.totalBytes}, webcamFailed=${!!webcamErr}`
    )
    clearSession()
    return { ok: true, slug: s.slug, url: buildShareEditUrl(s.slug) }
  } catch (err) {
    const failure = handleUploadError(err, { slug: s.slug, phase: 'finalize' })
    // Partial success — if any screen parts landed and finalize failed
    // mid-flight, the worker may still resolve the row on retry.
    // Surface the slug-based edit URL so the user has something to
    // open and inspect.
    const partialUrl = s.screen.etags.length > 0 ? buildShareEditUrl(s.slug) : undefined
    clearSession()
    return {
      ok: false,
      error: failure.message,
      code: failure.code,
      status: failure.status,
      partialUrl
    }
  }
}

async function flushTail(s: Session, stream: Stream): Promise<void> {
  // Drain any in-flight part first so we don't double-claim a part
  // number while a previous POST is still resolving.
  if (stream.inFlight) {
    try {
      await stream.inFlight
    } catch {
      /* already logged by pumpStream */
    }
  }
  if (stream.bufBytes === 0) return
  if (!stream.uploadId) return

  // R2's `completeMultipartUpload` rejects with
  //   "All non-trailing parts must have the same length"
  // when any non-last part differs in size from the others. The
  // streaming part loop emits exact-5-MiB parts during the recording,
  // so the running stream is uniform — BUT at stop time the muxer can
  // flush a large queued tail (audio buffering, mp4-muxer fragment
  // alignment, etc.) that exceeds 5 MiB. If we shipped that as a
  // single trailing part, the result was [5 MiB, 5 MiB, 16 MiB], and
  // even though 16 MiB IS the trailing part, R2's check classifies
  // anything not matching the established size as a non-trailing
  // outlier. Split the remainder into N additional 5 MiB parts plus
  // a single smaller trailing chunk so every non-trailing part has
  // exactly the same length.
  while (stream.bufBytes > CHUNK_BYTES) {
    const partBytes = drainPart(stream, CHUNK_BYTES)
    const partNumber = stream.partNumber++
    const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`
    const res = await postBytes<PartResponse>(path, s.deviceId, partBytes)
    stream.etags.push({ partNumber: res.partNumber, etag: res.etag })
    logInfo(
      'share-streamer',
      `${stream.partPath} backfill part ${partNumber} ok: ${partBytes.byteLength}B`
    )
  }

  if (stream.bufBytes === 0) return
  const tailBytes = drainPart(stream, stream.bufBytes)
  const partNumber = stream.partNumber++
  const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`
  const res = await postBytes<PartResponse>(path, s.deviceId, tailBytes)
  stream.etags.push({ partNumber: res.partNumber, etag: res.etag })
  logInfo(
    'share-streamer',
    `${stream.partPath} tail part ${partNumber} ok: ${tailBytes.byteLength}B`
  )
}

async function finalizeStream(
  s: Session,
  stream: Stream,
  path: string,
  sizeBytes: number
): Promise<FinalizeResponse> {
  if (stream.etags.length === 0) {
    throw new ShareApiHttpError(`${path}: no parts uploaded`, 502)
  }
  return postJson<FinalizeResponse>(path, s.deviceId, {
    slug: s.slug,
    parts: stream.etags,
    sizeBytes: sizeBytes > 0 ? sizeBytes : stream.totalBytes
  })
}

export function abortShareUpload(): void {
  const s = session
  if (!s) return
  s.aborted = true
  s.unsubConnectivity()
  logInfo('share-streamer', `aborted: slug=${s.slug}`)
  session = null
}

function clearSession(): void {
  const s = session
  if (!s) return
  s.unsubConnectivity()
  session = null
}

function failureToStart(f: ShareUploadFailure): ShareStartResult {
  return { ok: false, error: f.message, code: f.code, status: f.status }
}
