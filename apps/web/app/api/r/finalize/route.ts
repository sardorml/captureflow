import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import {
  completeMultipartUpload,
  deleteObject,
  objectSize,
} from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import {
  hydrateFinalizeSource,
  resolveFinalizeParts,
} from "@/lib/recording/segments";
import { getWorkspaceEntitlement, uploadOverrun } from "@/lib/recording/quota";
import { overrunError } from "@/lib/recording/upload-errors";
import { isDevDevice } from "@/lib/recording/dev-allowlist";
import { viewUrlForRequest } from "@/lib/site";
import type { FinalizeRequest, FinalizeResponse } from "@/lib/recording/types";

const DURATION_SLACK_MS = 10_000;
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
  const source = hydrateFinalizeSource(body);
  if (!source) return jsonError("Missing parts", 400, "invalid_parts");
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
   * The byte budget is re-checked here rather than trusted from the client
   * that reported sizeBytes. Refusing before the multipart is completed leaves
   * the parts uncommitted for the GC to sweep, so an over-cap upload never
   * lands as a billable object.
   */
  const overrun = await uploadOverrun(deviceId, row, sizeBytes);
  if (overrun) return overrunError(overrun);

  // The free tier's length cap was handed out at /init; the client stops on
  // it, and a little slack covers the encoder's trailing frames.
  if (row.workspaceId && typeof body.durationMs === "number") {
    const entitlement = await getWorkspaceEntitlement(row.workspaceId);
    if (
      entitlement?.maxRecordingMs != null &&
      body.durationMs > entitlement.maxRecordingMs + DURATION_SLACK_MS &&
      !(await isDevDevice(deviceId))
    ) {
      return jsonError(
        `Free plan limit: recordings up to ${Math.round(entitlement.maxRecordingMs / 60000)} minutes`,
        413,
        "duration_limit",
      );
    }
  }

  const target = { storageKey: row.storageKey, uploadId: row.uploadId };
  let parts;
  try {
    parts = await resolveFinalizeParts(
      source,
      row.slug,
      "screen",
      target,
      sizeBytes,
    );
  } catch (err) {
    // Building parts from segments read R2; a retry may well succeed.
    console.error("[finalize] segment build failed", { slug: row.slug, err });
    return jsonError("Couldn't build the upload", 503, "segments_failed");
  }
  if (!parts) {
    return jsonError("Upload incomplete", 409, "segments_incomplete");
  }

  try {
    await completeMultipartUpload(row.storageKey, row.uploadId, parts);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[finalize] r2 complete failed", {
      slug: row.slug,
      uploadId: row.uploadId,
      partCount: parts.length,
      reason,
    });
    await updateRecording(row.slug, { state: "failed", uploadId: null });
    return jsonError(`R2 complete: ${reason}`, 502, "r2_complete_failed");
  }

  const actualBytes = await objectSize(row.storageKey);
  if (actualBytes === null) {
    await updateRecording(row.slug, { state: "failed", uploadId: null });
    return jsonError("Object missing after complete", 502, "object_missing");
  }

  /*
   * Re-check with what R2 actually stored: the pre-complete check ran on the
   * client's claimed size, and only a larger truth can flip the verdict. The
   * object is already committed, so an over-cap upload is removed, not kept.
   */
  const actualOverrun =
    actualBytes > sizeBytes
      ? await uploadOverrun(deviceId, row, actualBytes)
      : null;
  if (actualOverrun) {
    await deleteObject(row.storageKey);
    await updateRecording(row.slug, { state: "failed", uploadId: null });
    return overrunError(actualOverrun);
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
      sizeBytes: actualBytes,
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
