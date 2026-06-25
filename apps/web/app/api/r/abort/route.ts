import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { abortMultipartUpload } from "@/lib/recording/r2";
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

  if (row.uploadId) {
    await abortMultipartUpload(row.storageKey, row.uploadId);
  }
  await updateRecording(row.slug, { state: "failed", uploadId: null });

  return withCors(NextResponse.json({ ok: true }));
}
