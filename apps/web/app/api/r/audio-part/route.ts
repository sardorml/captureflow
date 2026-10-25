import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { putObject } from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import { callerOwns } from "@/lib/recording/caller";
import { audioPartKeyFor } from "@/lib/recording/object-keys";

const DEVICE_HEADER = "x-captureflow-device";
const CONTENT_TYPE = "audio/webm";
// Ten minutes of 32 kbps Opus is about 2.4 MB; this leaves room for a
// recorder that encodes heavier.
const MAX_PART_BYTES = 8 * 1024 * 1024;
const MAX_PART_NUMBER = 500;

export function OPTIONS() {
  return optionsResponse();
}

// One standalone mic audio chunk, stored next to the video for Whisper to
// read. Authorized like the poster: the device id while the upload is in
// flight, the owner once the recording is ready.
export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }
  const partNumber = Number(req.nextUrl.searchParams.get("part"));
  if (
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > MAX_PART_NUMBER
  ) {
    return jsonError("Invalid part number", 400, "invalid_part");
  }

  const contentType = (req.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim();
  if (contentType !== CONTENT_TYPE) {
    return jsonError(
      "Unsupported audio content type",
      400,
      "invalid_content_type",
    );
  }
  const contentLengthRaw = req.headers.get("content-length");
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (contentLength !== null && contentLength > MAX_PART_BYTES) {
    return jsonError("Audio part too large", 413, "part_too_large");
  }

  const row = await getRecording(slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.state === "ready" && !(await callerOwns(req, row))) {
    return jsonError("Forbidden", 403, "forbidden");
  }
  if (row.state === "failed") {
    return jsonError("Recording is failed", 409, "wrong_state");
  }

  const buffer = await req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return jsonError("Missing body", 400, "no_body");
  }
  if (buffer.byteLength > MAX_PART_BYTES) {
    return jsonError("Audio part too large", 413, "part_too_large");
  }

  await putObject(
    audioPartKeyFor(row.storageKey, partNumber),
    buffer,
    CONTENT_TYPE,
    "no-store",
  );
  return withCors(NextResponse.json({ partNumber }));
}
