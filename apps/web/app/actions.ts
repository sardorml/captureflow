"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import {
  deleteRecordingForAdmin,
  updateRecordingConfigForUser,
  getRecordingForAdmin,
  getRecordingForUser,
  updateRecordingTitleForUser,
  updateRecordingVisibilityForAdmin,
  updateTranscriptEditsForUser,
  type RecordingVisibility,
} from "@/lib/recordings-db";
import { getTranscript } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import {
  hydrateTranscriptEdits,
  parseTranscriptJson,
} from "@/lib/recording/transcript";
import type { RecordingTranscript } from "@/lib/recording/types";
import {
  getScreenshotForAdmin,
  getScreenshotForUser,
  renameScreenshot,
  softDeleteScreenshotForAdmin,
  updateScreenshotAfterEdit,
  updateScreenshotVisibilityForAdmin,
  type ScreenshotVisibility,
} from "@/lib/screenshots-db";
import {
  deleteObject,
  getObjectBytes,
  objectExists,
  putObject,
} from "@/lib/r2";
import {
  audioPartPrefixFor,
  objectKeysFor,
  screenshotObjectKeysFor,
  sourceKeyFor,
  stateKeyFor,
} from "@captureflow/shared/object-keys";
import {
  hydrateRecordingConfig,
  parseRecordingConfigJson,
  recordingBackgroundImageFile,
  recordingBackgroundImageKey,
  type RecordingConfig,
} from "@/lib/recording-config";
import { newStorageId, viewerMediaUrl } from "@/lib/recording/media-url";
import { deleteObjectPrefix } from "@/lib/recording/r2";
import { purgeCachedMedia } from "@/lib/recording/remove";
import { revokeDeviceToken } from "@/lib/device-tokens";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { getSessionWithin } from "@/lib/session-read";

// Middleware only guards page requests; a forged/replayed direct action
// invocation bypasses it, so every action re-checks the session here.
async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await getSessionWithin(auth, await headers(), "action");
  if (!session) {
    redirect("/login");
  }
  return session.user.id;
}

async function actionCopy() {
  return (await getAppI18n()).messages.actions;
}

export async function renameRecordingAction(
  _prev: { error: string | null; slug: string | null },
  formData: FormData,
): Promise<{ error: string | null; slug: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const slug =
    typeof formData.get("slug") === "string"
      ? (formData.get("slug") as string).trim()
      : "";
  const title =
    typeof formData.get("title") === "string"
      ? (formData.get("title") as string).trim()
      : "";
  if (!slug) {
    return { error: t.missingSlug, slug: null };
  }
  // Same 200-char cap the recording /api/init enforces.
  const next = title.length === 0 ? null : title.slice(0, 200);
  const ok = await updateRecordingTitleForUser(userId, slug, next);
  if (!ok) {
    return { error: t.recordingNotFound, slug };
  }
  revalidatePath("/");
  revalidatePath(`/r/${slug}`);
  return { error: null, slug };
}

export async function setVisibilityAction(
  slug: string,
  visibility: RecordingVisibility,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: t.missingSlug };
  if (
    visibility !== "public" &&
    visibility !== "workspace" &&
    visibility !== "private"
  ) {
    return { error: t.invalidVisibility };
  }
  const ok = await updateRecordingVisibilityForAdmin(
    userId,
    cleanSlug,
    visibility,
  );
  if (!ok) return { error: t.recordingNotFound };
  revalidatePath("/");
  return { error: null };
}

export async function deleteRecordingAction(slug: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: t.missingSlug };
  // getRecordingForAdmin authorises uploader OR workspace owner.
  const row = await getRecordingForAdmin(userId, cleanSlug);
  if (!row) {
    return { error: t.recordingNotFound };
  }
  // R2 objects first, then reactions, then the row, so a failure strands
  // at worst a row pointing at a missing object (delete again to clean up).
  try {
    await deleteObject(row.storageKey);
  } catch (err) {
    return {
      error: fmt(t.deleteVideoFailed, {
        reason: err instanceof Error ? err.message : String(err),
      }),
    };
  }
  // Poster/webcam/sidecars/audio are best-effort: the video is already gone,
  // so failing here would only block a delete the user can no longer retry.
  await Promise.allSettled([
    ...objectKeysFor(row)
      .filter((key) => key !== row.storageKey)
      .map((key) => deleteObject(key)),
    deleteObjectPrefix(audioPartPrefixFor(row.storageKey)),
  ]);
  await purgeCachedMedia(row);
  await deleteRecordingForAdmin(userId, cleanSlug);
  revalidatePath("/");
  return { error: null };
}

// Public viewer and dashboard edit page read the same R2 sidecar, so one
// PUT updates every surface on next fetch.
export async function saveRecordingConfigAction(
  slug: string,
  raw: unknown,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: t.missingSlug };
  const config: RecordingConfig = hydrateRecordingConfig(raw);
  const row = await getRecordingForUser(userId, cleanSlug);
  if (!row) return { error: t.recordingNotFound };
  const ok = await updateRecordingConfigForUser(
    userId,
    cleanSlug,
    JSON.stringify(config),
  );
  if (!ok) return { error: t.recordingNotFound };
  // A picture replaced by another upload is deleted; one swapped for a colour stays, so the editor can switch back to it.
  const previous = recordingBackgroundImageFile(
    parseRecordingConfigJson(row.configJson).background,
  );
  const next = recordingBackgroundImageFile(config.background);
  if (previous && next && previous !== next) {
    await deleteObject(recordingBackgroundImageKey(previous)).catch(() => {});
  }
  revalidatePath(`/recordings/${cleanSlug}/edit`);
  revalidatePath("/");
  return { error: null };
}

const BACKGROUND_MAX_BYTES = 5 * 1024 * 1024;
const BACKGROUND_MIME = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

export type BackgroundUploadResult =
  | { error: string; background: null; url: null }
  | { error: null; background: string; url: string };

// Stores a picture for the recording's background; saving the config is what puts it to use.
export async function uploadRecordingBackgroundAction(
  slug: string,
  formData: FormData,
): Promise<BackgroundUploadResult> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const fail = (error: string): BackgroundUploadResult => ({
    error,
    background: null,
    url: null,
  });
  if (!isValidSlug(slug)) return fail(t.missingSlug);
  const row = await getRecordingForUser(userId, slug);
  if (!row) return fail(t.recordingNotFound);
  const file = formData.get("image");
  if (!(file instanceof Blob) || file.size === 0) {
    return fail(t.backgroundMissing);
  }
  if (file.size > BACKGROUND_MAX_BYTES) return fail(t.backgroundTooLarge);
  const ext = BACKGROUND_MIME.get(file.type);
  if (!ext) return fail(t.backgroundBadType);
  const name = `${newStorageId()}.${ext}`;
  const key = recordingBackgroundImageKey(name);
  try {
    await putObject(
      key,
      (await file.arrayBuffer()) as ArrayBuffer,
      file.type,
      "public, max-age=31536000, immutable",
    );
  } catch (err) {
    console.error("[background] upload failed", err);
    return fail(t.backgroundFailed);
  }
  return {
    error: null,
    background: `image:${name}`,
    url: await viewerMediaUrl(row, key),
  };
}

export type TranscriptActionResult = {
  error: string | null;
  transcript: RecordingTranscript | null;
};

async function getAutoTranscriptForOwner(
  userId: string,
  slug: string,
): Promise<RecordingTranscript | null> {
  const recording = await getRecordingForUser(userId, slug);
  if (!recording) return null;
  const stored = await getTranscript(slug);
  return stored ? parseTranscriptJson(stored.autoJson) : null;
}

// `raw` is the full edited segment list ({ id, text }[]); timings always come
// from the auto transcript, so the client can only change or drop text.
export async function saveTranscriptEditsAction(
  slug: string,
  raw: unknown,
): Promise<TranscriptActionResult> {
  const userId = await requireUserId();
  const t = await actionCopy();
  if (!isValidSlug(slug)) return { error: t.missingSlug, transcript: null };
  const auto = await getAutoTranscriptForOwner(userId, slug);
  if (!auto) return { error: t.transcriptNotFound, transcript: null };
  const edited = hydrateTranscriptEdits(raw, auto);
  if (!edited) {
    return {
      error: t.transcriptEmpty,
      transcript: null,
    };
  }
  const ok = await updateTranscriptEditsForUser(
    userId,
    slug,
    JSON.stringify(edited),
  );
  if (!ok) return { error: t.transcriptNotFound, transcript: null };
  revalidatePath(`/recordings/${slug}/edit`);
  return { error: null, transcript: edited };
}

export async function resetTranscriptEditsAction(
  slug: string,
): Promise<TranscriptActionResult> {
  const userId = await requireUserId();
  const t = await actionCopy();
  if (!isValidSlug(slug)) return { error: t.missingSlug, transcript: null };
  const auto = await getAutoTranscriptForOwner(userId, slug);
  if (!auto) return { error: t.transcriptNotFound, transcript: null };
  const ok = await updateTranscriptEditsForUser(userId, slug, null);
  if (!ok) return { error: t.transcriptNotFound, transcript: null };
  revalidatePath(`/recordings/${slug}/edit`);
  return { error: null, transcript: auto };
}

export async function revokeDeviceTokenAction(tokenId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanId = typeof tokenId === "string" ? tokenId.trim() : "";
  if (!cleanId) return { error: t.missingTokenId };
  const ok = await revokeDeviceToken(userId, cleanId);
  if (!ok) return { error: t.tokenNotFound };
  revalidatePath("/");
  return { error: null };
}

export async function deleteScreenshotAction(screenshotId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: t.missingScreenshotId };
  const screenshot = await getScreenshotForAdmin(cleanId, userId);
  if (!screenshot) return { error: t.screenshotNotFound };
  const ok = await softDeleteScreenshotForAdmin(cleanId, userId);
  if (!ok) return { error: t.screenshotNotFound };
  // Best-effort R2 cleanup; row is already soft-deleted and the retention
  // cron sweeps any stranded bytes.
  await Promise.allSettled(
    screenshotObjectKeysFor(screenshot.storageKey).map((key) =>
      deleteObject(key),
    ),
  );
  revalidatePath("/screenshots");
  return { error: null };
}

export async function setScreenshotVisibilityAction(
  screenshotId: string,
  visibility: ScreenshotVisibility,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: t.missingScreenshotId };
  if (
    visibility !== "public" &&
    visibility !== "workspace" &&
    visibility !== "private"
  ) {
    return { error: t.invalidVisibility };
  }
  const ok = await updateScreenshotVisibilityForAdmin(
    userId,
    cleanId,
    visibility,
  );
  if (!ok) return { error: t.screenshotNotFound };
  revalidatePath("/screenshots");
  return { error: null };
}

export async function renameScreenshotAction(
  screenshotId: string,
  title: string,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: t.missingScreenshotId };
  const trimmed = typeof title === "string" ? title.trim().slice(0, 200) : "";
  const ok = await renameScreenshot(cleanId, userId, trimmed || null);
  if (!ok) return { error: t.screenshotNotFound };
  revalidatePath("/screenshots");
  revalidatePath(`/screenshots/${cleanId}/edit`);
  return { error: null };
}

// Caps an edited screenshot so high-res annotations can't blow past the upload cap.
const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;

export type ScreenshotEditState = {
  background: string;
  annotations: unknown[];
  // Composed PNG dimensions; the editor may grow the canvas past the
  // original upload (background padding), so D1's width/height must refresh.
  width: number;
  height: number;
};

export async function saveScreenshotAction(
  screenshotId: string,
  blob: Blob,
  state: ScreenshotEditState,
): Promise<{ error: string | null }> {
  try {
    return await saveScreenshotActionInner(screenshotId, blob, state);
  } catch (err) {
    // Next strips thrown server-action messages in prod; funnel through here
    // so the client gets a readable string and we log a breadcrumb.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[saveScreenshotAction] uncaught:", msg, err);
    const t = await actionCopy();
    return { error: fmt(t.saveFailed, { reason: msg }) };
  }
}

async function saveScreenshotActionInner(
  screenshotId: string,
  blob: Blob,
  state: ScreenshotEditState,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const t = await actionCopy();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: t.missingScreenshotId };
  // PNG arrives as a Blob: a raw Uint8Array trips React's array-nesting guard
  // past ~1 MB, so the serializer must take the binary path.
  if (!blob || typeof (blob as Blob).arrayBuffer !== "function") {
    console.error("[saveScreenshotAction] bad blob", {
      hasBlob: !!blob,
      typeOf: typeof blob,
      constructor:
        blob && (blob as { constructor?: { name?: string } }).constructor?.name,
    });
    return { error: t.missingImageBytes };
  }
  const size = (blob as Blob).size;
  if (!Number.isFinite(size) || size === 0) {
    return { error: t.missingImageBytes };
  }
  if (size > MAX_SCREENSHOT_BYTES) {
    return { error: t.screenshotTooLarge };
  }
  const screenshot = await getScreenshotForUser(cleanId, userId);
  if (!screenshot) return { error: t.screenshotNotFound };

  const buffer = (await (blob as Blob).arrayBuffer()) as ArrayBuffer;
  const byteLength = buffer.byteLength;

  // On the first save the primary key still holds the original pixels, so
  // snapshot them to the pristine source sidecar before we overwrite.
  const sourceKey = sourceKeyFor(screenshot.storageKey);
  const stateKey = stateKeyFor(screenshot.storageKey);
  try {
    const sourceAlreadyExists = await objectExists(sourceKey);
    if (!sourceAlreadyExists) {
      const original = await getObjectBytes(screenshot.storageKey);
      if (original) {
        await putObject(sourceKey, original, "image/png");
      }
    }
  } catch {
    // Best-effort: a failed source snapshot must not block the save.
  }

  try {
    await putObject(screenshot.storageKey, buffer, "image/png");
  } catch (err) {
    return {
      error: fmt(t.saveScreenshotFailed, {
        reason: err instanceof Error ? err.message : String(err),
      }),
    };
  }

  try {
    const stateJson = JSON.stringify({
      background: state.background,
      annotations: state.annotations,
    });
    const encoder = new TextEncoder();
    const stateBytes = encoder.encode(stateJson);
    await putObject(
      stateKey,
      stateBytes.buffer.slice(
        stateBytes.byteOffset,
        stateBytes.byteOffset + stateBytes.byteLength,
      ) as ArrayBuffer,
      "application/json",
    );
  } catch {
    // Best-effort: a sidecar miss must not block the save.
  }

  // Validate dimensions before persisting so a malformed client can't
  // NaN-corrupt the row.
  const w =
    Number.isFinite(state.width) && state.width > 0
      ? Math.round(state.width)
      : null;
  const h =
    Number.isFinite(state.height) && state.height > 0
      ? Math.round(state.height)
      : null;
  if (w === null || h === null) {
    return { error: t.invalidCanvasDimensions };
  }
  await updateScreenshotAfterEdit(cleanId, userId, byteLength, w, h);
  revalidatePath(`/screenshots/${cleanId}/edit`);
  revalidatePath("/screenshots");
  return { error: null };
}
