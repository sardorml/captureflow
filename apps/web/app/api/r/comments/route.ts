import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  addComment, countComments, getShare, listComments, } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { verifySessionOrNull } from '@/lib/share/verify-session';
import { optionsResponse, withCors, jsonError } from '@/lib/share/cors';
import type {
  AddCommentRequest, AddCommentResponse, ListCommentsResponse } from '@/lib/share/types';

export function OPTIONS() {
  return optionsResponse();
}

const MAX_COMMENT_LENGTH = 1000;
const MAX_COMMENTS_PER_SHARE = 1000;

// Reads are open; visibility is enforced upstream at /[slug].
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!isValidSlug(slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }
  const comments = await listComments(slug);
  const body: ListCommentsResponse = { comments };
  return withCors(NextResponse.json(body));
}

// The display name is captured at write time so a later rename doesn't
// rewrite history.
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!isValidSlug(slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }

  const share = await getShare(slug);
  if (!share || share.state !== 'ready') {
    return jsonError('Share not found', 404, 'not_found');
  }

  const cookieHeader = (await headers()).get('cookie');
  const visitor = await verifySessionOrNull(cookieHeader);
  if (!visitor) {
    return jsonError('Sign in to comment', 401, 'auth_required');
  }

  let body: Partial<AddCommentRequest>;
  try {
    body = (await req.json()) as Partial<AddCommentRequest>;
  } catch {
    return jsonError('Invalid JSON', 400, 'invalid_json');
  }

  const raw = typeof body.body === 'string' ? body.body.trim() : '';
  if (!raw) return jsonError('Comment is empty', 400, 'empty_body');
  if (raw.length > MAX_COMMENT_LENGTH) {
    return jsonError('Comment too long', 400, 'too_long');
  }

  // 1s of slack past duration so an end-of-video overshoot isn't rejected.
  let timestampMs: number | null = null;
  if (
    typeof body.timestampMs === 'number' &&
    Number.isFinite(body.timestampMs)
  ) {
    timestampMs = Math.max(0, Math.floor(body.timestampMs));
    if (share.durationMs && timestampMs > share.durationMs + 1000) {
      return jsonError('Timestamp exceeds video length', 400, 'timestamp_oob');
    }
  }

  const total = await countComments(slug);
  if (total >= MAX_COMMENTS_PER_SHARE) {
    return jsonError('Comment cap reached', 429, 'comment_limit');
  }

  const inserted = await addComment({
    slug,
    userId: visitor.userId,
    userName: visitor.name?.trim() || visitor.email,
    body: raw,
    timestampMs,
  });
  // INSERT...RETURNING in db-d1 can't join `users.image`, so decorate from
  // the verified session.
  const comment = { ...inserted, userImage: visitor.image };
  const res: AddCommentResponse = { comment };
  return withCors(NextResponse.json(res));
}

