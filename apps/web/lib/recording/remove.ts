import { deleteRecording } from "./db";
import { audioPartPrefixFor, objectKeysFor } from "./object-keys";
import { abortMultipartUpload, deleteObject, deleteObjectPrefix } from "./r2";
import type { RecordingRow } from "./types";

// Takes a recording out of storage and the database: open multipart uploads,
// the video, then the row. Callers have checked who may do this.
export async function removeRecording(row: RecordingRow): Promise<void> {
  if (row.uploadId) {
    await abortMultipartUpload(row.storageKey, row.uploadId);
  }
  if (row.webcamUploadId && row.webcamStorageKey) {
    try {
      await abortMultipartUpload(row.webcamStorageKey, row.webcamUploadId);
    } catch (err) {
      console.warn(`[delete] webcam abort failed for ${row.slug}:`, err);
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
      console.warn(`[delete] r2 delete failed for ${row.slug}:`, result.reason);
    }
  }
  await deleteRecording(row.slug);
}
