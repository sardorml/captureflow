import { NextRequest, NextResponse } from "next/server";
import { deleteRecording, getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import {
  abortMultipartUpload,
  deleteObject,
  deleteObjectPrefix,
} from "@/lib/recording/r2";
import {
  audioPartPrefixFor,
  objectKeysFor,
} from "@/lib/recording/object-keys";
import { callerOwns } from "@/lib/recording/caller";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

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

  if (!(await callerOwns(req, row))) {
    return jsonError("Forbidden", 403, "forbidden");
  }

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
  // Poster/webcam/sidecars/audio are best-effort: the video is already gone, so
  // a failure here must not leave the caller with an undeletable recording.
  const stranded = await Promise.allSettled([
    ...objectKeysFor(row)
      .filter((key) => key !== row.storageKey)
      .map((key) => deleteObject(key)),
    deleteObjectPrefix(audioPartPrefixFor(row.storageKey)),
  ]);
  for (const result of stranded) {
    if (result.status === "rejected") {
      console.warn(`[delete] r2 delete failed for ${id}:`, result.reason);
    }
  }
  await deleteRecording(id);

  return withCors(NextResponse.json({ ok: true }));
}
