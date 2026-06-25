import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  addReaction,
  countReactions,
  getRecording,
  listReactions,
} from "@/lib/recording/db";
import {
  ALLOWED_REACTION_EMOJIS,
  MAX_REACTIONS_PER_RECORDING,
} from "@/lib/recording/reactions";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type {
  AddReactionRequest,
  AddReactionResponse,
  ListReactionsResponse,
} from "@/lib/recording/types";

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

  const recording = await getRecording(slug);
  if (!recording || recording.state !== "ready") {
    return jsonError("Recording not found", 404, "not_found");
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
  if (recording.durationMs && timestampMs > recording.durationMs + 1000) {
    return jsonError("Timestamp exceeds video length", 400, "timestamp_oob");
  }

  const total = await countReactions(slug);
  if (total >= MAX_REACTIONS_PER_RECORDING) {
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
