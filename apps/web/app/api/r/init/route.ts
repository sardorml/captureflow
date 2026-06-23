import { NextRequest, NextResponse } from 'next/server';
import {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_PRESETS,
  ALLOWED_SOURCES,
} from '@/lib/share/limits';
import { insertShare } from '@/lib/share/db';
import {
  activeArtifactCountForUser,
  getEffectiveLimitsForUser,
  getWorkspaceForUpload,
  resolveUserWorkspaceId,
  validateWorkspaceMembership,
  totalStorageForUser,
} from '@/lib/share/quota';
import { resolveDeviceTokenToUser } from '@/lib/share/device-tokens';
import { generateSlug } from '@/lib/share/slug';
import { createMultipartUpload } from '@/lib/share/r2';
import { isDevDevice } from '@/lib/share/dev-allowlist';
import { optionsResponse, withCors } from '@/lib/share/cors';
import { buildShareHeadline, sanitizeSourceTitle } from '@/lib/share/title';
import type {
  InitRequest,
  InitResponse,
  ShareApiError,
  ShareVisibility,
} from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const match = /^bearer\s+(.+)$/i.exec(h.trim());
  return match ? match[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError('Missing or invalid device header', 400, 'invalid_device');
  }

  let body: Partial<InitRequest>;
  try {
    body = (await req.json()) as Partial<InitRequest>;
  } catch {
    return jsonError('Invalid JSON', 400, 'invalid_json');
  }

  const contentType =
    typeof body.contentType === 'string' ? body.contentType : '';
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return jsonError('Unsupported content type', 400, 'invalid_content_type');
  }

  const source = body.source;
  if (!source || !ALLOWED_SOURCES.has(source)) {
    return jsonError('Invalid source', 400, 'invalid_source');
  }

  const preset = body.preset ?? 'share';
  if (!ALLOWED_PRESETS.has(preset)) {
    return jsonError('Invalid preset', 400, 'invalid_preset');
  }

  const durationMs = numberOrNull(body.durationMs);
  // Duration cap is per-tier; enforced below with the other quota gates
  // once the user (and thus their tier) is resolved.

  // Desktop sends only the variable bit (window owner / display name);
  // we expand it server-side into the full headline and persist that.
  // Dashboard renames edit the full title, so the brand suffix + date
  // are editable too — the renderer never composes any of it.
  const createdAt = Date.now();
  const sourceTitle = sanitizeSourceTitle(body.title);
  const title = buildShareHeadline(sourceTitle, createdAt);

  // Every share is account-owned, so a missing bearer is rejected up
  // front — no anonymous fallback, no orphan rows. A present-but-unresolved
  // bearer (revoked/expired/tampered) returns the same 401 so the desktop's
  // invalid_token handler clears its cached session without a restart.
  // Resolved before the cap check so usage scopes to the right account.
  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError('Sign in to create a share link.', 401, 'missing_token');
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError(
      'Sign-in expired or revoked. Sign in again to keep sharing under your account.',
      401,
      'invalid_token'
    );
  }

  // Resolve target workspace before the quota gate — the cap belongs to
  // that workspace's owner, so team uploads draw down the owner's quota,
  // not the uploader's. Falls back to the uploader's personal workspace
  // on any mismatch so a stale client never blocks.
  let workspaceId: string | null = null;
  if (typeof body.workspaceId === 'string' && body.workspaceId) {
    workspaceId = await validateWorkspaceMembership(userId, body.workspaceId);
  }
  if (!workspaceId) {
    workspaceId = await resolveUserWorkspaceId(userId);
  }
  // Need owner_user_id for quota attribution plus the policy flags below.
  let workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  // If the workspace blocks member uploads and the uploader isn't the
  // owner, fall back to the uploader's personal workspace. Owners can
  // always post into their own.
  if (
    workspace &&
    !workspace.allow_member_uploads &&
    workspace.owner_user_id !== userId
  ) {
    workspaceId = await resolveUserWorkspaceId(userId);
    workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  }
  // The owner's entitlement and storage cap apply to this upload.
  // Defaults to the uploader when the workspace lookup is unavailable so
  // the gate doesn't softfail in DB-less test runs.
  const quotaUserId = workspace?.owner_user_id ?? userId;

  // Dev-allowlisted devices skip the caps so the developer can iterate
  // against the deployed worker without wiping D1 to free up slots.
  const isDev = await isDevDevice(deviceId);
  if (!isDev) {
    // Limits default to ACCOUNT_LIMITS, overridden per-user by any
    // `user_quotas` row, and are resolved against the workspace owner so
    // a free member uploading into a Pro owner's workspace gates on the
    // owner's quota. Counts aggregate across shares and snaps the owner owns.
    const [activeCount, storageUsed, limits] = await Promise.all([
      activeArtifactCountForUser(quotaUserId),
      totalStorageForUser(quotaUserId),
      getEffectiveLimitsForUser(quotaUserId),
    ]);

    if (activeCount >= limits.activeArtifacts) {
      return jsonError('Too many active artifacts', 429, 'active_limit');
    }
    if (storageUsed >= limits.storageBytes) {
      return jsonError('Storage cap reached', 429, 'storage_limit');
    }
    if (durationMs !== null && durationMs > limits.perShareDurationMs) {
      return jsonError(
        'Recording exceeds share duration cap',
        413,
        'duration_exceeded'
      );
    }
  }

  const slug = generateSlug();
  const storageKey =
    contentType === 'image/jpeg' ? `posters/${slug}.jpg` : `videos/${slug}.mp4`;

  // `no-cache` makes the browser revalidate against the origin (so a
  // bg-change replace shows up on refresh) while still reusing the local
  // copy after a fast etag check. `no-store` was too aggressive — it
  // forced a full re-download every refresh, leaving some browsers stuck
  // buffering before first-frame decode.
  const { uploadId } = await createMultipartUpload(
    storageKey,
    contentType,
    'no-cache'
  );

  // Optional companion webcam stream: reserve a second multipart upload
  // that the desktop streams to via /api/webcam-part and completes via
  // /api/webcam-finalize. The viewer composites the two tracks at play
  // time so cam PiP placement stays editable. Video uploads only —
  // posters are a single-shot upload.
  let webcamStorageKey: string | null = null;
  let webcamUploadId: string | null = null;
  let webcamState: 'none' | 'pending' = 'none';
  if (body.hasWebcam === true && contentType !== 'image/jpeg') {
    webcamStorageKey = `videos/${slug}-webcam.webm`;
    const wcUpload = await createMultipartUpload(
      webcamStorageKey,
      'video/webm',
      'no-cache'
    );
    webcamUploadId = wcUpload.uploadId;
    webcamState = 'pending';
  }

  // Desktop uploads as 'public'; owners flip to 'workspace'/'private' from
  // the dashboard. We honor a non-public body.visibility only because it
  // arrives via the dashboard re-record flow.
  let visibility: ShareVisibility =
    body.visibility === 'private'
      ? 'private'
      : body.visibility === 'workspace'
      ? 'workspace'
      : 'public';
  // When the workspace bans public links, coerce a public upload to
  // 'workspace' so it isn't browsable by anyone with the URL.
  if (workspace && !workspace.allow_public_links && visibility === 'public') {
    visibility = 'workspace';
  }

  // The viewer auth gate later reads this workspaceId column to check
  // membership without joining through users.
  await insertShare({
    slug,
    deviceId,
    storageKey,
    posterKey: null,
    uploadId,
    sizeBytes: 0,
    durationMs,
    width: numberOrNull(body.width),
    height: numberOrNull(body.height),
    source,
    preset,
    createdAt,
    lastViewedAt: createdAt,
    viewCount: 0,
    title,
    state: 'pending',
    userId,
    workspaceId,
    visibility,
    webcamStorageKey,
    webcamUploadId,
    webcamSizeBytes: 0,
    webcamState,
  });

  const res: InitResponse = {
    slug,
    uploadId,
    storageKey,
    ...(webcamUploadId && webcamStorageKey
      ? { webcamUploadId, webcamStorageKey }
      : {}),
  };
  return withCors(NextResponse.json(res));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}

function numberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
}
