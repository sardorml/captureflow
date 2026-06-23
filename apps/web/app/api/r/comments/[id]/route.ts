import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { deleteComment, getComment, getShare } from '@/lib/share/db';
import { verifySessionOrNull } from '@/lib/share/verify-session';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  }
  const comment = await getComment(id);
  if (!comment) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const cookieHeader = (await headers()).get('cookie');
  const session = await verifySessionOrNull(cookieHeader);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let authorized = session.userId === comment.userId;
  if (!authorized) {
    const row = await getShare(comment.slug);
    authorized = !!row && row.userId === session.userId;
  }
  if (!authorized) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  await deleteComment(id);
  return NextResponse.json({ ok: true });
}
