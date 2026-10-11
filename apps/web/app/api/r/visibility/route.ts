import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { callerOwns } from "@/lib/recording/caller";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type { RecordingVisibility } from "@/lib/recording/types";

const ALLOWED: ReadonlySet<RecordingVisibility> = new Set([
  "public",
  "workspace",
  "private",
]);

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  let body: { value?: unknown };
  try {
    body = (await req.json()) as { value?: unknown };
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }
  const value = body.value;
  if (typeof value !== "string" || !ALLOWED.has(value as RecordingVisibility)) {
    return jsonError("Invalid visibility", 400, "invalid_visibility");
  }

  const row = await getRecording(slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");

  if (!(await callerOwns(req, row))) {
    return jsonError("Forbidden", 403, "forbidden");
  }

  await updateRecording(slug, { visibility: value as RecordingVisibility });
  return withCors(NextResponse.json({ visibility: value }));
}
