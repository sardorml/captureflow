/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';

// GET /api/verify-session
//
// Internal subrequest endpoint used by the share/snap subdomains to
// authenticate a visitor for non-public artifacts. The session cookie is
// set on `.captureflow.xyz` (see `crossSubDomainCookies` in auth.ts), so
// the subdomain workers forward the incoming `cookie` header here and get
// back the user's id + workspace memberships in one round-trip. This keeps
// better-auth as a single dependency on app-web so share/snap don't pull in
// the auth stack or know about the sessions schema.
//
// CORS-locked to the allowlisted origins so a malicious origin can't extract
// a user's workspace list by firing a credentialed request from the browser.

const ALLOWED_ORIGINS = new Set([
  // The /r + /s viewers call this endpoint same-origin, so this is the
  // only production origin that needs echoing.
  'https://captureflow.xyz',
  // Preview deploy (push-to-dev). Its cookie is host-only, so preview
  // sessions stay isolated from prod.
  'https://dev.captureflow.xyz',
  // Wrangler dev / local OpenNext hits. 3032 is the app's `next dev` port.
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3032',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  // Echo only allowlisted origins; everything else gets no
  // `access-control-allow-origin`, so the browser drops the response even
  // on a successful subrequest from an attacker page.
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
  // better-auth `users.image` column, so an avatar uploaded on app-web
  // shows up across the public viewers.
  image: string | null;
  // Every workspace the user belongs to; share/snap gate
  // `visibility === 'workspace'` shares against this set.
  workspaceIds: string[];
};

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  const auth = await getAuth();
  // `getSession` reads the cookie out of `headers`; cross-subdomain cookies
  // mean the forwarded request from share/snap carries it through.
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
