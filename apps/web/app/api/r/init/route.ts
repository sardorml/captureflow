import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_PRESETS,
  ALLOWED_SOURCES,
  exceedsQuality,
  hydrateRecordingCaptureSource,
  hydrateRecordingClient,
  hydrateRecordingQualityId,
} from "@/lib/recording/limits";
import { insertRecording } from "@/lib/recording/db";
import {
  countUserRecordingsInWorkspace,
  getWorkspaceEntitlement,
  resolveUploadTarget,
  uploadBudgetFor,
} from "@/lib/recording/quota";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { newStorageId } from "@/lib/recording/media-url";
import { generateSlug } from "@/lib/recording/slug";
import { createMultipartUpload, MEDIA_CACHE_CONTROL } from "@/lib/recording/r2";
import { isDevDevice } from "@/lib/recording/dev-allowlist";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import {
  buildRecordingHeadline,
  sanitizeSourceTitle,
} from "@/lib/recording/title";
import type {
  InitRequest,
  InitResponse,
  RecordingVisibility,
} from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const match = /^bearer\s+(.+)$/i.exec(h.trim());
  return match ? match[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError("Missing or invalid device header", 400, "invalid_device");
  }

  let body: Partial<InitRequest>;
  try {
    body = (await req.json()) as Partial<InitRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  const contentType =
    typeof body.contentType === "string" ? body.contentType : "";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return jsonError("Unsupported content type", 400, "invalid_content_type");
  }

  const source = body.source;
  if (!source || !ALLOWED_SOURCES.has(source)) {
    return jsonError("Invalid source", 400, "invalid_source");
  }

  const preset = body.preset ?? "recording";
  if (!ALLOWED_PRESETS.has(preset)) {
    return jsonError("Invalid preset", 400, "invalid_preset");
  }

  const durationMs = numberOrNull(body.durationMs);

  const createdAt = Date.now();
  const sourceTitle = sanitizeSourceTitle(body.title);
  const title = buildRecordingHeadline(sourceTitle, createdAt);

  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError(
      "Sign in to create a recording link.",
      401,
      "missing_token",
    );
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError(
      "Sign-in expired or revoked. Sign in again to keep sharing under your account.",
      401,
      "invalid_token",
    );
  }

  // Where it lands is the workspace's call, not the client's: membership,
  // the record permission and the member-uploads policy are all checked there.
  const target = await resolveUploadTarget(userId, body.workspaceId);
  const workspace = target?.workspace ?? null;
  const workspaceId = workspace?.id ?? null;
  /*
   * How much this recording may grow, which the client stops itself on: its
   * own byte ceiling on the free tier, what is left of the pool on a paid one.
   * The free tier adds per-person caps: a recording count and a quality,
   * refused here, and a length, returned here and enforced at finalize.
   */
  const quality = hydrateRecordingQualityId(body.quality);
  const isDev = await isDevDevice(deviceId);
  let remainingBytes: number | null = null;
  let maxDurationMs: number | null = null;
  let maxQuality: InitResponse["maxQuality"] = undefined;
  if (!isDev) {
    const entitlement = workspaceId
      ? await getWorkspaceEntitlement(workspaceId)
      : null;
    if (
      entitlement?.recordingsPerPerson != null &&
      workspaceId &&
      contentType !== "image/jpeg"
    ) {
      const count = await countUserRecordingsInWorkspace(workspaceId, userId);
      if (count >= entitlement.recordingsPerPerson) {
        return jsonError(
          `Free plan limit: ${entitlement.recordingsPerPerson} recordings per person`,
          429,
          "recording_limit",
        );
      }
    }
    maxDurationMs = entitlement?.maxRecordingMs ?? null;
    maxQuality = entitlement?.maxQuality ?? undefined;
    if (exceedsQuality(quality, maxQuality ?? null)) {
      return jsonError(
        "Free plan limit: recordings at data saver quality",
        403,
        "quality_limit",
      );
    }

    const budget = await uploadBudgetFor({
      userId,
      workspaceId,
      sizeBytes: 0,
      webcamSizeBytes: 0,
    });
    if (budget.kind === "storage" && budget.used >= budget.limit) {
      return jsonError("Storage cap reached", 429, "storage_limit");
    }
    remainingBytes = budget.limit - budget.used;
  }

  const slug = generateSlug();
  const storageId = newStorageId();
  const storageKey =
    contentType === "image/jpeg"
      ? `posters/${storageId}.jpg`
      : contentType === "video/webm"
        ? `videos/${storageId}.webm`
        : `videos/${storageId}.mp4`;

  const { uploadId } = await createMultipartUpload(
    storageKey,
    contentType,
    contentType === "image/jpeg" ? "no-cache" : MEDIA_CACHE_CONTROL,
  );

  // Optional companion webcam stream: the viewer composites the two tracks at
  // play time so cam PiP placement stays editable. Video uploads only.
  let webcamStorageKey: string | null = null;
  let webcamUploadId: string | null = null;
  let webcamState: "none" | "pending" = "none";
  if (body.hasWebcam === true && contentType !== "image/jpeg") {
    webcamStorageKey = `videos/${storageId}-webcam.webm`;
    const wcUpload = await createMultipartUpload(
      webcamStorageKey,
      "video/webm",
      MEDIA_CACHE_CONTROL,
    );
    webcamUploadId = wcUpload.uploadId;
    webcamState = "pending";
  }

  // A non-public body.visibility is honored only for the dashboard re-record flow.
  let visibility: RecordingVisibility =
    body.visibility === "private"
      ? "private"
      : body.visibility === "workspace"
        ? "workspace"
        : "public";
  if (workspace && !workspace.allow_public_links && visibility === "public") {
    visibility = "workspace";
  }

  await insertRecording({
    slug,
    deviceId,
    storageKey,
    posterKey: null,
    posterBlur: null,
    posterThumbKey: null,
    uploadId,
    sizeBytes: 0,
    durationMs,
    width: numberOrNull(body.width),
    height: numberOrNull(body.height),
    source,
    preset,
    client: hydrateRecordingClient(body.client),
    captureSource: hydrateRecordingCaptureSource(body.captureSource),
    quality,
    createdAt,
    lastViewedAt: createdAt,
    viewCount: 0,
    title,
    state: "pending",
    userId,
    workspaceId,
    visibility,
    webcamStorageKey,
    webcamUploadId,
    webcamSizeBytes: 0,
    webcamState,
    configJson: null,
    summaryChaptersJson: null,
  });

  const res: InitResponse = {
    slug,
    uploadId,
    storageKey,
    ...(remainingBytes === null ? {} : { remainingBytes }),
    ...(maxDurationMs === null ? {} : { maxDurationMs }),
    ...(maxQuality === undefined ? {} : { maxQuality }),
    ...(webcamUploadId && webcamStorageKey
      ? { webcamUploadId, webcamStorageKey }
      : {}),
  };
  return withCors(NextResponse.json(res));
}

function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
}
