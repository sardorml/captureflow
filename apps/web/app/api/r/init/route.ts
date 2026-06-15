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
  // Effective duration cap is per-tier and lives behind the user
  // resolution below — checked alongside the other quota gates so Pro
  // subscribers get the lifted ceiling.

  // Title pipeline: the desktop client sends only the variable bit
  // (window owner or display name). Server-side we expand that into
  // the full Loom-style headline ("<source> — CaptureFlow | … — <date>")
  // and persist the formatted string. Dashboard renames operate on
  // the full title field, so editing reaches the brand suffix +
  // date — the renderer no longer composes any of it.
  const createdAt = Date.now();
  const sourceTitle = sanitizeSourceTitle(body.title);
  const title = buildShareHeadline(sourceTitle, createdAt);

  // Bearer token → owning user. Every share is account-owned now,
  // so a missing bearer is rejected up front: no anonymous fallback,
  // no orphan rows the user can't see in their dashboard. A bearer
  // that's PRESENT but doesn't resolve (revoked, expired, tampered)
  // is rejected with the same 401 so the desktop's invalid_token
  // handler clears its cached session and the lock icon flips back
  // to "sign in" without a restart.
  //
  // Resolved BEFORE the cap check so the check scopes to the right
  // account — the dashboard shows account-wide usage and the
  // desktop QuotaReachedModal gates on that same number.
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

  // Resolve target workspace BEFORE the quota gate — the cap belongs
  // to that workspace's owner (a Pro owner pays for the cap; team
  // uploads into the owner's workspace draw down the owner's quota,
  // not the uploader's). Falls through to the uploader's personal
  // workspace on any mismatch so a stale client never blocks.
  let workspaceId: string | null = null;
  if (typeof body.workspaceId === 'string' && body.workspaceId) {
    workspaceId = await validateWorkspaceMembership(userId, body.workspaceId);
  }
  if (!workspaceId) {
    workspaceId = await resolveUserWorkspaceId(userId);
  }
  // Pull the full workspace row once — owner_user_id for quota
  // attribution, plus policy flags for upload gating.
  let workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  // Policy: if the target workspace blocks member uploads and the
  // uploader isn't the owner, silently fall back to the uploader's
  // personal workspace. Owners can always post into their own.
  if (
    workspace &&
    !workspace.allow_member_uploads &&
    workspace.owner_user_id !== userId
  ) {
    workspaceId = await resolveUserWorkspaceId(userId);
    workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  }
  // Owner = the user whose Pro entitlement (if any) and storage cap
  // apply to this upload. Defaults to the uploader when the workspace
  // lookup is unavailable so the gate doesn't softfail in env.DB-less
  // test runs.
  const quotaUserId = workspace?.owner_user_id ?? userId;

  // Dev-allowlisted devices skip the caps entirely so the developer
  // can iterate against the deployed worker without periodically
  // wiping D1 to free up active-artifact slots.
  const isDev = await isDevDevice(deviceId);
  if (!isDev) {
    // Effective limits = ACCOUNT_LIMITS defaults, overridden per-user
    // by any row in `user_quotas`. Resolved against the workspace
    // OWNER — a free team member uploading into a Pro owner's
    // workspace gates against the owner's 50 GB, not their own 500 MB.
    // The counts here aggregate across shares ∪ snaps in workspaces
    // the owner owns.
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

  // `no-cache` keeps the browser from skipping origin checks (so a
  // bg-change replace shows up on the next refresh) but still lets
  // it reuse the existing local copy after a fast etag revalidation.
  // `no-store` was too aggressive — every refresh forced a full
  // re-download, which left some browsers stuck buffering before
  // first-frame decode.
  const { uploadId } = await createMultipartUpload(
    storageKey,
    contentType,
    'no-cache'
  );

  // Optional companion webcam stream. When the desktop signals
  // `hasWebcam: true`, we reserve a second R2 multipart upload for
  // `videos/{slug}-webcam.webm`. The desktop streams its webcam parts
  // to `/api/webcam-part?slug=…&part=N` referencing this uploadId, and
  // /api/webcam-finalize completes it. The viewer composites the two
  // tracks at play time so cam PiP placement stays editable.
  // Only applies to video uploads (posters are a separate single-shot).
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

  // v1: desktop always uploads with `public` visibility. The dashboard
  // is where owners flip to 'workspace' or 'private' after upload, so
  // we accept those from the wire only when the desktop explicitly opts
  // in (future versions may add a desktop visibility picker; today the
  // body.visibility field comes from the dashboard re-record flow).
  let visibility: ShareVisibility =
    body.visibility === 'private'
      ? 'private'
      : body.visibility === 'workspace'
      ? 'workspace'
      : 'public';
  // Workspace policy override: when the workspace bans public links,
  // a public upload is coerced to 'workspace' so the new share isn't
  // browsable by anyone with the URL. workspace/private pass through.
  if (workspace && !workspace.allow_public_links && visibility === 'public') {
    visibility = 'workspace';
  }

  // `workspaceId` was resolved up-front for the quota gate; reuse it
  // here for the insert. The viewer auth gate uses this column later
  // to answer "is this user a member of the workspace that owns
  // this share?" without joining through users.

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
