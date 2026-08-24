import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { completeMultipartUpload, headObject } from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import { exceedsStorage } from "@/lib/recording/quota";
import { viewUrlForRequest } from "@/lib/site";
import type { FinalizeRequest, FinalizeResponse } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  let body: Partial<FinalizeRequest>;
  try {
    body = (await req.json()) as Partial<FinalizeRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  if (!isValidSlug(body.slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }
  if (!Array.isArray(body.parts) || body.parts.length === 0) {
    return jsonError("Missing parts", 400, "invalid_parts");
  }
  for (const p of body.parts) {
    if (
      !p ||
      typeof p.partNumber !== "number" ||
      typeof p.etag !== "string" ||
      p.etag.length === 0
    ) {
      return jsonError("Malformed part entry", 400, "invalid_parts");
    }
  }
  const sizeBytes = body.sizeBytes;
  if (
    typeof sizeBytes !== "number" ||
    !Number.isFinite(sizeBytes) ||
    sizeBytes <= 0
  ) {
    return jsonError("Invalid size", 400, "invalid_size");
  }

  const row = await getRecording(body.slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.state === "ready") {
    return withCors(
      NextResponse.json<FinalizeResponse>({
        url: viewUrlForRequest(req, row.slug),
      }),
    );
  }
  if (row.state !== "pending" || !row.uploadId) {
    return jsonError("Recording not finalizable", 409, "wrong_state");
  }

  /*
   * Storage is the only cap, so it is re-checked here rather than trusted from
   * the client that reported sizeBytes. Refusing before the multipart is
   * completed leaves the parts uncommitted for the GC to sweep, so an
   * over-cap upload never lands as a billable object.
   */
  const overCap = await exceedsStorage(deviceId, row, sizeBytes);
  if (overCap) {
    return jsonError("Storage cap reached", 413, "storage_limit");
  }

  try {
    await completeMultipartUpload(row.storageKey, row.uploadId, body.parts);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[finalize] r2 complete failed", {
      slug: row.slug,
      uploadId: row.uploadId,
      partCount: body.parts.length,
      reason,
    });
    await updateRecording(row.slug, { state: "failed", uploadId: null });
    return jsonError(`R2 complete: ${reason}`, 502, "r2_complete_failed");
  }

  const exists = await headObject(row.storageKey);
  if (!exists) {
    await updateRecording(row.slug, { state: "failed", uploadId: null });
    return jsonError("Object missing after complete", 502, "object_missing");
  }

  // Bad duration is dropped rather than rejected: the bytes are already in R2,
  // and a missing badge beats an upload that reports failure.
  const durationMs =
    typeof body.durationMs === "number" &&
    Number.isFinite(body.durationMs) &&
    body.durationMs > 0
      ? Math.round(body.durationMs)
      : null;

  try {
    await updateRecording(row.slug, {
      state: "ready",
      uploadId: null,
      sizeBytes,
      lastViewedAt: Date.now(),
      ...(durationMs === null ? {} : { durationMs }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[finalize] d1 update failed", {
      slug: row.slug,
      reason,
    });
    return jsonError(`DB update: ${reason}`, 500, "db_update_failed");
  }

  const res: FinalizeResponse = { url: viewUrlForRequest(req, row.slug) };
  return withCors(NextResponse.json(res));
}
