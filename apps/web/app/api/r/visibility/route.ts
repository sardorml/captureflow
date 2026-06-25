import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type { RecordingVisibility } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";
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

  const deviceId = req.headers.get(DEVICE_HEADER);
  let authorized = false;
  if (deviceId) {
    authorized = row.deviceId === deviceId;
  } else {
    const cookieHeader = (await headers()).get("cookie");
    const session = await verifySessionOrNull(cookieHeader);
    authorized = !!session && session.userId === row.userId;
  }
  if (!authorized) return jsonError("Forbidden", 403, "forbidden");

  await updateRecording(slug, { visibility: value as RecordingVisibility });
  return withCors(NextResponse.json({ visibility: value }));
}
