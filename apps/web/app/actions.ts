"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import {
  deleteReactionsForRecording,
  deleteRecordingForAdmin,
  getRecordingForAdmin,
  getRecordingForUser,
  updateRecordingTitleForUser,
  updateRecordingVisibilityForAdmin,
  type RecordingVisibility,
} from "@/lib/recordings-db";
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
import { sourceKeyFor, stateKeyFor } from "@/lib/screenshot-keys";
import {
  hydrateRecordingConfig,
  recordingConfigKeyFor,
  type RecordingConfig,
} from "@/lib/recording-config";
import { revokeDeviceToken } from "@/lib/device-tokens";

// Middleware only guards page requests; a forged/replayed direct action
// invocation bypasses it, so every action re-checks the session here.
async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session.user.id;
}

export async function renameRecordingAction(
  _prev: { error: string | null; slug: string | null },
  formData: FormData,
): Promise<{ error: string | null; slug: string | null }> {
  const userId = await requireUserId();
  const slug =
    typeof formData.get("slug") === "string"
      ? (formData.get("slug") as string).trim()
      : "";
  const title =
    typeof formData.get("title") === "string"
      ? (formData.get("title") as string).trim()
      : "";
  if (!slug) {
    return { error: "Missing slug", slug: null };
  }
  // Same 200-char cap the recording /api/init enforces.
  const next = title.length === 0 ? null : title.slice(0, 200);
  const ok = await updateRecordingTitleForUser(userId, slug, next);
  if (!ok) {
    return { error: "Recording not found", slug };
  }
  revalidatePath("/");
  return { error: null, slug };
}

export async function setVisibilityAction(
  slug: string,
  visibility: RecordingVisibility,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: "Missing slug" };
  if (
    visibility !== "public" &&
    visibility !== "workspace" &&
    visibility !== "private"
  ) {
    return { error: "Invalid visibility" };
  }
  const ok = await updateRecordingVisibilityForAdmin(
    userId,
    cleanSlug,
    visibility,
  );
  if (!ok) return { error: "Recording not found" };
  revalidatePath("/");
  return { error: null };
}

export async function deleteRecordingAction(slug: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: "Missing slug" };
  // getRecordingForAdmin authorises uploader OR workspace owner.
  const row = await getRecordingForAdmin(userId, cleanSlug);
  if (!row) {
    return { error: "Recording not found" };
  }
  // R2 objects first, then reactions, then the row, so a failure strands
  // at worst a row pointing at a missing object (delete again to clean up).
  try {
    await deleteObject(row.storageKey);
    if (row.posterKey) {
      await deleteObject(row.posterKey);
    }
  } catch (err) {
    return {
      error: `Could not delete the video file: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  await deleteReactionsForRecording(cleanSlug);
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
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";
  if (!cleanSlug) return { error: "Missing slug" };
  const recording = await getRecordingForUser(userId, cleanSlug);
  if (!recording) return { error: "Recording not found" };
  const config: RecordingConfig = hydrateRecordingConfig(raw);
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  try {
    await putObject(
      recordingConfigKeyFor(recording.storageKey),
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
      "application/json",
    );
  } catch (err) {
    return {
      error: `Could not save recording config: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  revalidatePath(`/recordings/${cleanSlug}/edit`);
  revalidatePath("/");
  return { error: null };
}

export async function revokeDeviceTokenAction(tokenId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanId = typeof tokenId === "string" ? tokenId.trim() : "";
  if (!cleanId) return { error: "Missing token id" };
  const ok = await revokeDeviceToken(userId, cleanId);
  if (!ok) return { error: "Token not found" };
  revalidatePath("/");
  return { error: null };
}

export async function deleteScreenshotAction(screenshotId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: "Missing screenshot id" };
  const screenshot = await getScreenshotForAdmin(cleanId, userId);
  if (!screenshot) return { error: "Screenshot not found" };
  const ok = await softDeleteScreenshotForAdmin(cleanId, userId);
  if (!ok) return { error: "Screenshot not found" };
  // Best-effort R2 cleanup; row is already soft-deleted and the retention
  // cron sweeps any stranded bytes.
  await Promise.allSettled([
    deleteObject(screenshot.storageKey),
    deleteObject(sourceKeyFor(screenshot.storageKey)),
    deleteObject(stateKeyFor(screenshot.storageKey)),
  ]);
  revalidatePath("/screenshots");
  return { error: null };
}

export async function setScreenshotVisibilityAction(
  screenshotId: string,
  visibility: ScreenshotVisibility,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: "Missing screenshot id" };
  if (
    visibility !== "public" &&
    visibility !== "workspace" &&
    visibility !== "private"
  ) {
    return { error: "Invalid visibility" };
  }
  const ok = await updateScreenshotVisibilityForAdmin(
    userId,
    cleanId,
    visibility,
  );
  if (!ok) return { error: "Screenshot not found" };
  revalidatePath("/screenshots");
  return { error: null };
}

export async function renameScreenshotAction(
  screenshotId: string,
  title: string,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: "Missing screenshot id" };
  const trimmed = typeof title === "string" ? title.trim().slice(0, 200) : "";
  const ok = await renameScreenshot(cleanId, userId, trimmed || null);
  if (!ok) return { error: "Screenshot not found" };
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
    return { error: `Save failed: ${msg}` };
  }
}

async function saveScreenshotActionInner(
  screenshotId: string,
  blob: Blob,
  state: ScreenshotEditState,
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!cleanId) return { error: "Missing screenshot id" };
  // PNG arrives as a Blob: a raw Uint8Array trips React's array-nesting guard
  // past ~1 MB, so the serializer must take the binary path.
  if (!blob || typeof (blob as Blob).arrayBuffer !== "function") {
    console.error("[saveScreenshotAction] bad blob", {
      hasBlob: !!blob,
      typeOf: typeof blob,
      constructor:
        blob && (blob as { constructor?: { name?: string } }).constructor?.name,
    });
    return { error: "Missing image bytes" };
  }
  const size = (blob as Blob).size;
  if (!Number.isFinite(size) || size === 0) {
    return { error: "Missing image bytes" };
  }
  if (size > MAX_SCREENSHOT_BYTES) {
    return { error: "Edited screenshot exceeds the per-screenshot size cap." };
  }
  const screenshot = await getScreenshotForUser(cleanId, userId);
  if (!screenshot) return { error: "Screenshot not found" };

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
      error: `Could not save the screenshot: ${
        err instanceof Error ? err.message : String(err)
      }`,
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
    return { error: "Save failed: invalid canvas dimensions" };
  }
  await updateScreenshotAfterEdit(cleanId, userId, byteLength, w, h);
  revalidatePath(`/screenshots/${cleanId}/edit`);
  revalidatePath("/screenshots");
  return { error: null };
}
