import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { deleteRecording, getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { abortMultipartUpload, deleteObject } from "@/lib/recording/r2";
import { objectKeysFor } from "@/lib/recording/object-keys";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!isValidSlug(id)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  const row = await getRecording(id);
  if (!row) return withCors(NextResponse.json({ ok: true }));

  const deviceId = req.headers.get(DEVICE_HEADER);
  let authorized = false;
  if (deviceId) {
    authorized = row.deviceId === deviceId;
  } else {
    const cookieHeader = (await headers()).get("cookie");
    const session = await verifySessionOrNull(cookieHeader);
    authorized = !!session && session.userId === row.userId;
  }
  if (!authorized) return jsonError("Forbidden", 403, "forbidden");

  if (row.uploadId) {
    await abortMultipartUpload(row.storageKey, row.uploadId);
  }
  if (row.webcamUploadId && row.webcamStorageKey) {
    try {
      await abortMultipartUpload(row.webcamStorageKey, row.webcamUploadId);
    } catch (err) {
      console.warn(`[delete] webcam abort failed for ${id}:`, err);
    }
  }
  await deleteObject(row.storageKey);
  // Poster/webcam/sidecars are best-effort: the video is already gone, so a
  // failure here must not leave the caller with an undeletable recording.
  const stranded = await Promise.allSettled(
    objectKeysFor(row)
      .filter((key) => key !== row.storageKey)
      .map((key) => deleteObject(key)),
  );
  for (const result of stranded) {
    if (result.status === "rejected") {
      console.warn(`[delete] r2 delete failed for ${id}:`, result.reason);
    }
  }
  await deleteRecording(id);

  return withCors(NextResponse.json({ ok: true }));
}
