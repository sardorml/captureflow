'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';
import { deleteObject, putObject } from '@/lib/r2';

// Server actions for /profile. The display-name edit flows through
// better-auth's client `updateUser` because it has built-in handling for
// session/cookie refresh; avatar uploads need raw R2 + a `users.image`
// write which doesn't fit better-auth's surface, so we keep them here.

type FormState = { error: string | null; ok: string | null };

const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIME = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const CDN_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  return session.user.id;
}

export async function uploadUserAvatarAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireUserId();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: 'Database unavailable', ok: null };

  const file = formData.get('avatar');
  if (!(file instanceof Blob) || file.size === 0) {
    return { error: 'Pick an image file', ok: null };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: 'Avatar must be 2 MB or smaller', ok: null };
  }
  const mime = file.type;
  const ext = AVATAR_MIME.get(mime);
  if (!ext) {
    return { error: 'Avatar must be PNG, JPEG, WebP, or GIF', ok: null };
  }

  const key = `user-avatars/${userId}.${ext}`;
  const buffer = (await file.arrayBuffer()) as ArrayBuffer;
  try {
    await putObject(key, buffer, mime, 'public, max-age=86400');
  } catch (err) {
    return {
      error: `Upload failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      ok: null,
    };
  }

  // Cache-bust suffix so the URL changes whenever the bytes change — the
  // user menu reads `users.image` directly, so a stable URL would keep
  // serving the old picture from the browser cache on the next nav.
  const url = `${CDN_BASE}/${key}?v=${Date.now()}`;

  // Drop any prior key under a different extension to avoid orphans on
  // format swap (e.g. .png → .webp).
  const existing = await env.DB.prepare(
    `SELECT image FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(userId)
    .first<{ image: string | null }>();
  if (existing?.image) {
    const prior = extractKey(existing.image);
    if (prior && prior !== key) {
      void deleteObject(prior).catch(() => {});
    }
  }

  await env.DB.prepare(`UPDATE users SET image = ?1 WHERE id = ?2`)
    .bind(url, userId)
    .run();

  // Avatar surfaces (top-bar menu, share/snap author chip) read the
  // image from the session/users row, so revalidate the dashboard layout
  // root to pull the new URL through every render path.
  revalidatePath('/', 'layout');
  return { error: null, ok: 'Avatar updated' };
}

export async function removeUserAvatarAction(): Promise<void> {
  const userId = await requireUserId();
  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const existing = await env.DB.prepare(
    `SELECT image FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(userId)
    .first<{ image: string | null }>();
  if (existing?.image) {
    const prior = extractKey(existing.image);
    if (prior) void deleteObject(prior).catch(() => {});
  }

  await env.DB.prepare(`UPDATE users SET image = NULL WHERE id = ?1`)
    .bind(userId)
    .run();
  revalidatePath('/', 'layout');
}

// Pull the R2 object key back out of a CDN URL so we can clean up the
// prior upload. Returns null when the stored value doesn't match our
// CDN host (e.g. a legacy gravatar URL set before we owned avatars).
function extractKey(image: string): string | null {
  if (!image.startsWith(CDN_BASE + '/')) return null;
  const rest = image.slice(CDN_BASE.length + 1);
  const q = rest.indexOf('?');
  return q < 0 ? rest : rest.slice(0, q);
}
