import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  addReaction,
  countReactions,
  getShare,
  listReactions,
} from "@/lib/share/db";
import {
  ALLOWED_REACTION_EMOJIS,
  MAX_REACTIONS_PER_SHARE,
} from "@/lib/share/reactions";
import { isValidSlug } from "@/lib/share/slug";
import { verifySessionOrNull } from "@/lib/share/verify-session";
import { optionsResponse, withCors, jsonError } from "@/lib/share/cors";
import type {
  AddReactionRequest,
  AddReactionResponse,
  ListReactionsResponse,
} from "@/lib/share/types";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }
  const reactions = await listReactions(slug);
  const body: ListReactionsResponse = { reactions };
  return withCors(NextResponse.json(body));
}

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  const share = await getShare(slug);
  if (!share || share.state !== "ready") {
    return jsonError("Share not found", 404, "not_found");
  }

  const cookieHeader = (await headers()).get("cookie");
  const visitor = await verifySessionOrNull(cookieHeader);
  if (!visitor) {
    return jsonError("Sign in to react", 401, "auth_required");
  }

  let body: Partial<AddReactionRequest>;
  try {
    body = (await req.json()) as Partial<AddReactionRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  const emoji = typeof body.emoji === "string" ? body.emoji : "";
  if (!ALLOWED_REACTION_EMOJIS.has(emoji)) {
    return jsonError("Unsupported emoji", 400, "invalid_emoji");
  }

  const timestampMs =
    typeof body.timestampMs === "number" && Number.isFinite(body.timestampMs)
      ? Math.max(0, Math.floor(body.timestampMs))
      : null;
  if (timestampMs === null) {
    return jsonError("Invalid timestamp", 400, "invalid_timestamp");
  }
  if (share.durationMs && timestampMs > share.durationMs + 1000) {
    return jsonError("Timestamp exceeds video length", 400, "timestamp_oob");
  }

  const total = await countReactions(slug);
  if (total >= MAX_REACTIONS_PER_SHARE) {
    return jsonError("Reaction cap reached", 429, "reaction_limit");
  }

  const inserted = await addReaction({
    slug,
    emoji,
    timestampMs,
    userId: visitor.userId,
    userName: visitor.name?.trim() || visitor.email,
  });
  const reaction = { ...inserted, userImage: visitor.image };
  const res: AddReactionResponse = { reaction };
  return withCors(NextResponse.json(res));
}
