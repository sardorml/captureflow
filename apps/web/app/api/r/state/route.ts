import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError } from '@/lib/share/types';

// Status probe for the share page's "Preparing your share…" loading shell.
// The desktop client hands back a copyable link as soon as /api/init returns
// a slug — well before /api/finalize lands — so an immediate click would
// otherwise 404. The pending UI polls this and reloads once state flips to
// 'ready' (or 'failed', so it can show a real error instead of spinning).

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!isValidSlug(slug)) {
    const body: ShareApiError = {
      error: 'Invalid slug',
      code: 'invalid_slug',
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }
  const row = await getShare(slug);
  if (!row) {
    // Don't 404 the probe — the loader needs a stable "still being created vs
    // gone forever" answer, surfaced as not-found after its own retry budget.
    return withCors(NextResponse.json({ state: 'missing' as const }));
  }
  // No visibility leak: the probe runs from the share page itself, which has
  // already accepted that the viewer holds the slug. Public and private return
  // the same shape; the page renderer enforces the 404 on ready-private.
  return withCors(
    NextResponse.json({
      state: row.state,
      visibility: row.visibility,
    })
  );
}
