import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { removeRecording } from "@/lib/recording/remove";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type { AbortRequest } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  let body: Partial<AbortRequest>;
  try {
    body = (await req.json()) as Partial<AbortRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  if (!isValidSlug(body.slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  const row = await getRecording(body.slug);
  if (!row) return withCors(NextResponse.json({ ok: true }));
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  // The device id alone authorizes only the upload it started; once the
  // recording is ready, removing it needs the owner (DELETE /api/r/[id]).
  if (row.state !== "pending") {
    return jsonError("Recording is not pending", 409, "wrong_state");
  }

  // A cancelled or discarded upload leaves nothing worth keeping, so the row
  // goes with its objects instead of lingering as "failed" on the dashboard.
  await removeRecording(row);

  return withCors(NextResponse.json({ ok: true }));
}
