import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSnap, updateSnapVisibility } from '@/lib/snap/db';
import { isValidSnapId } from '@/lib/snap/id';
import { verifySessionOrNull } from '@/lib/snap/verify-session';
import { optionsResponse, withCors } from '@/lib/snap/cors';

// Auth relays through verifySessionOrNull because better-auth lives on
// app.captureflow.xyz while the session cookie is set on .captureflow.xyz.

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidSnapId(id)) {
    return withCors(
      NextResponse.json({ error: 'Invalid snap id' }, { status: 400 })
    );
  }
  const cookieHeader = (await headers()).get('cookie');
  const visitor = await verifySessionOrNull(cookieHeader);
  if (!visitor) {
    return withCors(
      NextResponse.json(
        { error: 'Sign in to manage this snap' },
        { status: 401 }
      )
    );
  }

  const snap = await getSnap(id);
  if (!snap || snap.state !== 'ready') {
    return withCors(NextResponse.json({ error: 'Not found' }, { status: 404 }));
  }
  if (snap.userId !== visitor.userId) {
    return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }
  const value =
    typeof body === 'object' && body !== null && 'value' in body
      ? (body as { value?: unknown }).value
      : undefined;
  if (value !== 'public' && value !== 'workspace' && value !== 'private') {
    return withCors(
      NextResponse.json({ error: 'Invalid visibility' }, { status: 400 })
    );
  }

  await updateSnapVisibility(id, value);
  return withCors(NextResponse.json({ ok: true, visibility: value }));
}
