import { NextRequest, NextResponse } from 'next/server';
import { ACCOUNT_LIMITS } from '@captureflow/quota';
import { generateSnapId } from '@/lib/snap/id';
import { insertSnap } from '@/lib/snap/db';
import {
  putSnap,
  putSnapSource,
  putSnapState,
  snapStorageKey,
} from '@/lib/snap/r2';
import { resolveDeviceTokenToUser } from '@/lib/snap/device-tokens';
import { isDevDevice } from '@/lib/snap/dev-allowlist';
import { optionsResponse, withCors } from '@/lib/snap/cors';
import {
  activeArtifactCountForUser,
  getEffectiveLimitsForUser,
  getWorkspaceForUpload,
  resolveUserWorkspaceId,
  totalStorageForUser,
  validateWorkspaceMembership,
} from '@/lib/snap/quota';
import { snapEditUrlFor, snapViewUrlForRequest } from '@/lib/site';
import { buildSnapHeadline, sanitizeSourceTitle } from '@/lib/snap/title';
import type { SnapApiError, UploadResponse } from '@/lib/snap/types';

const DEVICE_HEADER = 'x-captureflow-device';
const WIDTH_HEADER = 'x-captureflow-snap-width';
const HEIGHT_HEADER = 'x-captureflow-snap-height';
const TITLE_HEADER = 'x-captureflow-snap-title';
// Optional target workspace id. Falls through to the uploader's personal
// workspace on any mismatch — see /api/init for the same fallback rationale.
const WORKSPACE_HEADER = 'x-captureflow-workspace';

/*
 * Snap upload endpoint. Bearer required (snaps are account-owned); quota is
 * gated up front against the combined shares ∪ snaps total.
 *
 * 200 → { id, viewUrl, editUrl }
 * 401 → bearer missing/invalid
 * 413 → snap exceeds per-snap cap
 * 429 → storage_limit / active_limit
 */

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

  const contentType = req.headers.get('content-type') ?? '';
  const ctLower = contentType.toLowerCase();
  /*
   * Two accepted shapes:
   *   - `image/png` (legacy): body is the raw PNG; no source / state
   *   - `multipart/form-data`: fields `composed` (required PNG),
   *     `source` (optional PNG), `state` (optional JSON sidecar)
   * Desktop bakes the gradient onto the composed PNG before uploading so the
   * public viewer and editor agree on the rendered look immediately.
   */
  const isMultipart = ctLower.startsWith('multipart/form-data');
  if (!isMultipart && !ctLower.startsWith('image/png')) {
    return jsonError('Unsupported content type', 400, 'invalid_content_type');
  }

  const widthRaw = req.headers.get(WIDTH_HEADER);
  const heightRaw = req.headers.get(HEIGHT_HEADER);
  const width = widthRaw ? Number(widthRaw) : NaN;
  const height = heightRaw ? Number(heightRaw) : NaN;
  if (
    !Number.isFinite(width) ||
    width <= 0 ||
    !Number.isFinite(height) ||
    height <= 0
  ) {
    return jsonError(
      'Missing or invalid dimensions',
      400,
      'invalid_dimensions'
    );
  }

  // Cheap pre-flight on declared size; enforce on actual bytes below.
  const contentLengthRaw = req.headers.get('content-length');
  const declaredSize = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (declaredSize !== null && declaredSize > ACCOUNT_LIMITS.perSnapSizeBytes) {
    return jsonError('Snap exceeds per-snap size cap', 413, 'size_exceeded');
  }

  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError('Sign in to upload a snap.', 401, 'missing_token');
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError(
      'Sign-in expired or revoked. Sign in again to keep sharing under your account.',
      401,
      'invalid_token'
    );
  }

  /*
   * Resolve target workspace BEFORE the quota gate so the cap applies to the
   * workspace OWNER: team uploads draw down the owner's quota, not the
   * uploader's. Falls through to the uploader's personal workspace on any
   * mismatch so a stale client never blocks.
   */
  let workspaceId: string | null = null;
  const requestedWorkspace = req.headers.get(WORKSPACE_HEADER);
  if (requestedWorkspace) {
    workspaceId = await validateWorkspaceMembership(userId, requestedWorkspace);
  }
  if (!workspaceId) {
    workspaceId = await resolveUserWorkspaceId(userId);
  }
  // Full workspace row — owner_user_id + policy flags, used for both quota
  // attribution and member-upload enforcement below.
  let workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  if (
    workspace &&
    !workspace.allow_member_uploads &&
    workspace.owner_user_id !== userId
  ) {
    workspaceId = await resolveUserWorkspaceId(userId);
    workspace = workspaceId ? await getWorkspaceForUpload(workspaceId) : null;
  }
  const quotaUserId = workspace?.owner_user_id ?? userId;

  const isDev = await isDevDevice(deviceId);
  if (!isDev) {
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
  }

  let composedBody: ArrayBuffer;
  let sourceBody: ArrayBuffer | null = null;
  let stateBody: ArrayBuffer | null = null;
  if (isMultipart) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch (err) {
      console.error('[snap] failed to parse multipart upload:', err);
      return jsonError('Malformed multipart body', 400, 'invalid_multipart');
    }
    const composedField = form.get('composed');
    if (!(composedField instanceof Blob)) {
      return jsonError('Missing composed field', 400, 'no_composed');
    }
    composedBody = await composedField.arrayBuffer();
    const sourceField = form.get('source');
    if (sourceField instanceof Blob && sourceField.size > 0) {
      sourceBody = await sourceField.arrayBuffer();
    }
    const stateField = form.get('state');
    if (stateField instanceof Blob && stateField.size > 0) {
      stateBody = await stateField.arrayBuffer();
    }
  } else {
    composedBody = await req.arrayBuffer();
  }

  if (composedBody.byteLength === 0) {
    return jsonError('Missing body', 400, 'no_body');
  }
  if (composedBody.byteLength > ACCOUNT_LIMITS.perSnapSizeBytes) {
    return jsonError('Snap exceeds per-snap size cap', 413, 'size_exceeded');
  }
  if (sourceBody && sourceBody.byteLength > ACCOUNT_LIMITS.perSnapSizeBytes) {
    return jsonError(
      'Source PNG exceeds per-snap size cap',
      413,
      'size_exceeded'
    );
  }

  const id = generateSnapId();
  await putSnap(id, composedBody);
  /*
   * Source + state sidecars are best-effort — if either write fails
   * we still return success for the composed upload (the editor's
   * existing fallback path serves the composed PNG as the source).
   */
  if (sourceBody) {
    try {
      await putSnapSource(id, sourceBody);
    } catch (err) {
      console.warn('[snap] putSnapSource failed:', err);
    }
  }
  if (stateBody) {
    try {
      await putSnapState(id, stateBody);
    } catch (err) {
      console.warn('[snap] putSnapState failed:', err);
    }
  }

  const now = Date.now();
  /*
   * Desktop sends a raw source label (display name / window owner / area dim);
   * the server bakes the formatted headline so the public viewer and dashboard
   * see the same string. Renames flow through the dedicated rename action and
   * overwrite this column.
   */
  const sourceTitle = sanitizeSourceTitle(req.headers.get(TITLE_HEADER));
  const title = buildSnapHeadline(sourceTitle, now);

  try {
    await insertSnap({
      id,
      userId,
      workspaceId,
      deviceId,
      storageKey: snapStorageKey(id),
      sizeBytes: composedBody.byteLength,
      width: Math.round(width),
      height: Math.round(height),
      title,
      state: 'ready',
      /*
       * When public links are disabled, new snaps default to 'workspace' so a
       * public link is never minted; owners can still flip individual snaps to
       * 'public' later from the dashboard.
       */
      visibility:
        workspace && !workspace.allow_public_links ? 'workspace' : 'public',
      createdAt: now,
      updatedAt: now,
      editedAt: null,
      lastViewedAt: null,
      viewCount: 0,
    });
  } catch (err) {
    // Roll back the R2 put so we don't strand bytes — best effort.
    try {
      await (await import('@/lib/snap/r2')).deleteSnap(id);
    } catch {
      // best effort
    }
    console.error('[snap] insertSnap failed:', err);
    return jsonError('Failed to record snap', 500, 'db_insert_failed');
  }

  const res: UploadResponse = {
    id,
    viewUrl: snapViewUrlForRequest(req, id),
    editUrl: snapEditUrlFor(id),
  };
  return withCors(NextResponse.json(res));
}

function jsonError(error: string, status: number, code?: string) {
  const body: SnapApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
