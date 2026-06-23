/// <reference types="@cloudflare/workers-types" />

import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';

export type VerifiedSession = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  workspaceIds: string[];
};

export type VerifySessionResult = VerifiedSession | null | 'unknown';

function headersFromCookie(cookieHeader: string): Headers {
  const h = new Headers();
  h.set('cookie', cookieHeader);
  return h;
}

export async function verifySession(
  cookieHeader: string | null
): Promise<VerifySessionResult> {
  if (!cookieHeader) return null;

  let session: Awaited<
    ReturnType<Awaited<ReturnType<typeof getAuth>>['api']['getSession']>
  >;
  try {
    const auth = await getAuth();
    session = await auth.api.getSession({
      headers: headersFromCookie(cookieHeader),
    });
  } catch (err) {
    console.error('verify-session: getSession threw', err);
    return 'unknown';
  }
  if (!session) return null;

  const env = await getAppWebEnv();
  if (!env?.DB) {
    return 'unknown';
  }

  try {
    const [memberships, userRow] = await Promise.all([
      listWorkspacesForUser(env.DB, session.user.id),
      env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
        .bind(session.user.id)
        .first<{ image: string | null }>(),
    ]);
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: userRow?.image ?? null,
      workspaceIds: memberships.map((m) => m.workspace_id),
    };
  } catch (err) {
    console.error('verify-session: membership lookup threw', err);
    return 'unknown';
  }
}

export async function verifySessionOrNull(
  cookieHeader: string | null
): Promise<VerifiedSession | null> {
  const r = await verifySession(cookieHeader);
  return r === 'unknown' ? null : r;
}
