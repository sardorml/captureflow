import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError } from '@/lib/share/types';

// Lightweight status probe used by the share page's "Preparing your
// share…" loading shell. The desktop client hands back a copyable
// link the moment /api/init returns a slug — well before /api/finalize
// lands — so anyone who clicks immediately would otherwise see a
// 404. The pending UI polls this endpoint and reloads the page once
// state flips to 'ready' (or 'failed', so the loading UI can show a
// real error instead of spinning forever).

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
    // Don't 404 the probe — the share-page loader needs a stable
    // "still being created vs gone forever" answer. The pending UI
    // surfaces this as a real not-found after its own retry budget
    // runs out.
    return withCors(NextResponse.json({ state: 'missing' as const }));
  }
  // Visibility leaks would be a problem here — the probe runs from
  // the share page itself, which has already accepted that the
  // viewer holds the slug. Public + private both return the same
  // shape; the page renderer is responsible for the 404 on
  // ready-private.
  return withCors(
    NextResponse.json({
      state: row.state,
      visibility: row.visibility,
    })
  );
}
