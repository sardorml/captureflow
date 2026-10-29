import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import {
  buildCoveredParts,
  hydrateSegmentParams,
  MAX_SEGMENT_BYTES,
  segmentTarget,
  storeSegment,
} from "@/lib/recording/segments";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

// POST /api/r/segment?slug=…&stream=screen|webcam&offset=N with the bytes at N.
export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  const params = hydrateSegmentParams(req.nextUrl.searchParams);
  if (!params) return jsonError("Invalid segment", 400, "invalid_segment");

  const row = await getRecording(params.slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  const target = segmentTarget(row, params.stream);
  if (!target) {
    return jsonError("Recording has no upload in progress", 409, "no_upload");
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (contentLength > MAX_SEGMENT_BYTES) {
    return jsonError("Segment too large", 413, "chunk_too_large");
  }
  const body = await req.arrayBuffer();
  if (body.byteLength === 0) {
    return jsonError("Missing segment body", 400, "no_body");
  }
  if (body.byteLength > MAX_SEGMENT_BYTES) {
    return jsonError("Segment too large", 413, "chunk_too_large");
  }

  await storeSegment(row.slug, params.stream, target, params.offset, body);
  /*
   * Inline, not after(): bindings are request-scoped. Only the piece that
   * completes a part waits for it, and finalize builds whatever this misses.
   */
  await buildCoveredParts(row.slug, params.stream, target).catch((err) =>
    console.warn(`[segment] part build failed for ${row.slug}:`, err),
  );
  return withCors(NextResponse.json({ ok: true }));
}
