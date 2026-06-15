/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';
import { sendAccessRequestEmail } from '@/lib/email';
import { viewUrlFor, snapViewUrlFor } from '@/lib/site';

// POST /api/request-access
//
// Called from share.captureflow.xyz and snap.captureflow.xyz when a
// signed-in viewer hits a workspace/private artifact they can't see
// and clicks "Request access". We look up the owner and email them
// with a link to /members so they can invite the requester.
//
// The cross-subdomain cookie set on `.captureflow.xyz` carries the
// viewer's session here, so we can identify the requester by their
// better-auth session — no client-supplied email to spoof.

const ALLOWED_ORIGINS = new Set([
  // The /r + /s viewers POST here same-origin.
  'https://captureflow.xyz',
  // Preview deploy (push-to-dev → dev.captureflow.xyz).
  'https://dev.captureflow.xyz',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3032',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      'access-control-allow-origin': origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Cookie',
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

type Body = {
  kind?: 'share' | 'snap';
  key?: string;
  message?: string | null;
};

const MAX_MESSAGE_LEN = 500;

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: 'invalid-json' },
      { status: 400, headers }
    );
  }
  if (body.kind !== 'share' && body.kind !== 'snap') {
    return NextResponse.json(
      { error: 'invalid-kind' },
      { status: 400, headers }
    );
  }
  if (typeof body.key !== 'string' || !body.key) {
    return NextResponse.json(
      { error: 'invalid-key' },
      { status: 400, headers }
    );
  }
  const message =
    typeof body.message === 'string'
      ? body.message.slice(0, MAX_MESSAGE_LEN).trim() || null
      : null;

  const auth = await getAuth();
  let session;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch (err) {
    console.error('request-access: getSession threw', err);
    return NextResponse.json(
      { error: 'session-lookup-failed' },
      { status: 401, headers }
    );
  }
  if (!session) {
    return NextResponse.json(
      { error: 'not-signed-in' },
      { status: 401, headers }
    );
  }

  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json(
      { error: 'db-unavailable' },
      { status: 500, headers }
    );
  }

  // Resolve artifact → owner. Joined against users so we get the
  // owner's email + name in one query.
  type Row = {
    user_id: string;
    title: string | null;
    visibility: string;
    owner_email: string;
    owner_name: string | null;
  };
  const sql =
    body.kind === 'share'
      ? `SELECT s.user_id, s.title, s.visibility,
                 u.email AS owner_email, u.name AS owner_name
            FROM shares s
            LEFT JOIN users u ON u.id = s.user_id
           WHERE s.slug = ?1`
      : `SELECT s.user_id, s.title, s.visibility,
                 u.email AS owner_email, u.name AS owner_name
            FROM snaps s
            LEFT JOIN users u ON u.id = s.user_id
           WHERE s.id = ?1`;
  const row = await env.DB.prepare(sql).bind(body.key).first<Row>();
  if (!row || !row.owner_email) {
    return NextResponse.json({ error: 'not-found' }, { status: 404, headers });
  }
  // Public artifacts don't need a request — the viewer should just see
  // them. Bail so we don't email the owner over a UI race.
  if (row.visibility === 'public') {
    return NextResponse.json({ ok: true, alreadyPublic: true }, { headers });
  }
  // Self-request: owner clicking their own page while signed out then
  // back in. No-op so we don't spam the owner with their own request.
  if (row.user_id === session.user.id) {
    return NextResponse.json({ ok: true, isOwner: true }, { headers });
  }

  const siteUrl =
    env.NEXT_PUBLIC_APP_WEB_SITE_URL ?? 'https://captureflow.xyz';
  const artifactUrl =
    body.kind === 'share' ? viewUrlFor(body.key) : snapViewUrlFor(body.key);
  const manageUrl = `${siteUrl}/members?invite=${encodeURIComponent(
    session.user.email
  )}`;

  await sendAccessRequestEmail({
    to: row.owner_email,
    ownerName: row.owner_name,
    requesterEmail: session.user.email,
    requesterName: session.user.name ?? null,
    artifactKind: body.kind,
    artifactTitle: row.title ?? (body.kind === 'share' ? 'Recording' : 'Snap'),
    artifactUrl,
    message,
    manageUrl,
  });

  return NextResponse.json({ ok: true }, { headers });
}
