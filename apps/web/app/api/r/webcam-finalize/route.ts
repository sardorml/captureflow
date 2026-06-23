import { NextRequest, NextResponse } from "next/server";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { getShare, updateShare } from "@/lib/share/db";
import { isValidSlug } from "@/lib/share/slug";
import { completeMultipartUpload, headObject } from "@/lib/share/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/share/cors";
import type { FinalizeRequest } from "@/lib/share/types";

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
    sizeBytes <= 0 ||
    sizeBytes > ACCOUNT_LIMITS.perShareSizeBytes
  ) {
    return jsonError("Invalid size", 400, "invalid_size");
  }

  const row = await getShare(body.slug);
  if (!row) return jsonError("Share not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  // Idempotent: desktop retries finalize, so return ok (not 409) if already ready.
  if (row.webcamState === "ready") {
    return withCors(NextResponse.json({ ok: true }));
  }
  if (
    row.webcamState !== "pending" ||
    !row.webcamUploadId ||
    !row.webcamStorageKey
  ) {
    return jsonError("Webcam not finalizable", 409, "wrong_state");
  }

  await completeMultipartUpload(
    row.webcamStorageKey,
    row.webcamUploadId,
    body.parts,
  );

  const exists = await headObject(row.webcamStorageKey);
  if (!exists) {
    await updateShare(row.slug, {
      webcamState: "failed",
      webcamUploadId: null,
    });
    return jsonError("Object missing after complete", 502, "object_missing");
  }

  await updateShare(row.slug, {
    webcamState: "ready",
    webcamUploadId: null,
    webcamSizeBytes: sizeBytes,
  });

  return withCors(NextResponse.json({ ok: true }));
}
