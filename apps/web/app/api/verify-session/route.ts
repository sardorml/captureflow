/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';

// GET /api/verify-session
//
// Internal subrequest endpoint used by share.captureflow.xyz and
// snap.captureflow.xyz to authenticate the visitor when an artifact
// has non-public visibility. The visitor's session cookie is set on
// `.captureflow.xyz` (see `crossSubDomainCookies` in auth.ts), so
// the subdomain workers can forward the incoming request's `cookie`
// header here and get back the user's id + workspace memberships in
// one round-trip.
//
// This keeps better-auth as a single dependency on app-web — neither
// share nor snap need to pull in the auth stack, instantiate adapters,
// or know about the sessions schema. The /api/usage endpoint follows
// the same pattern (device-bearer auth) for non-cookie API callers.
//
// Tightly CORS-locked to the share + snap subdomains so a malicious
// origin can't extract a user's workspace list by tricking the
// browser into firing a credentialed request with cookies.

const ALLOWED_ORIGINS = new Set([
  // The /r + /s viewers call this endpoint SAME-origin,
  // so captureflow.xyz is the only production origin that needs to be
  // echoed.
  'https://captureflow.xyz',
  // Preview deploy (push-to-dev → dev.captureflow.xyz). Its /r + /s
  // viewers call this SAME-origin on dev.captureflow.xyz; the cookie is
  // host-only so preview sessions stay isolated from prod.
  'https://dev.captureflow.xyz',
  // Wrangler dev / local OpenNext hits — kept narrow so a stray
  // localhost page can't probe. 3032 is the app's `next dev` port.
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3032',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  // Echo only allowlisted origins; everything else gets no
  // `access-control-allow-origin`, which makes the browser drop the
  // response even on a successful subrequest from an attacker page.
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Cookie',
      vary: 'Origin',
    };
  }
  return { vary: 'Origin' };
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get('origin')),
  });
}

export type VerifySessionResponse = {
  userId: string;
  email: string;
  name: string | null;
  // Avatar URL set on the better-auth `users.image` column. Share/snap
  // workers render this for the viewer's own chip + composer avatar so
  // an avatar uploaded on app-web shows up across the public viewers.
  image: string | null;
  // Every workspace the user belongs to (owner or member). Share/snap
  // workers gate `visibility === 'workspace'` shares against this set.
  workspaceIds: string[];
};

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  const auth = await getAuth();
  // `auth.api.getSession` reads the cookie out of `headers` — the same
  // path the dashboard uses. With cross-subdomain cookies enabled the
  // request from share/snap carries the cookie through.
  let session;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch (err) {
    console.error('verify-session: getSession threw', err);
    return NextResponse.json(
      { error: 'session-lookup-failed' },
      { status: 401, headers }
    );
  }
  if (!session) {
    return NextResponse.json({ error: 'no-session' }, { status: 401, headers });
  }

  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json(
      { error: 'db-unavailable' },
      { status: 500, headers }
    );
  }

  const [memberships, userRow] = await Promise.all([
    listWorkspacesForUser(env.DB, session.user.id),
    env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
      .bind(session.user.id)
      .first<{ image: string | null }>(),
  ]);
  const body: VerifySessionResponse = {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: userRow?.image ?? null,
    workspaceIds: memberships.map((m) => m.workspace_id),
  };
  return NextResponse.json(body, { headers });
}
