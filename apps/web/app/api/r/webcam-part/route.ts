import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { uploadPart } from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type { PartResponse } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";
const MAX_PART_NUMBER = 10000;
const MAX_PART_BYTES = 100 * 1024 * 1024;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  const slug = req.nextUrl.searchParams.get("slug");
  const partRaw = req.nextUrl.searchParams.get("part");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }
  const partNumber = Number(partRaw);
  if (
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > MAX_PART_NUMBER
  ) {
    return jsonError("Invalid part number", 400, "invalid_part");
  }

  const row = await getRecording(slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.webcamState !== "pending") {
    return jsonError("Webcam is not pending", 409, "wrong_state");
  }
  if (!row.webcamUploadId || !row.webcamStorageKey) {
    return jsonError("Webcam has no upload in progress", 409, "no_upload");
  }

  const contentLengthRaw = req.headers.get("content-length");
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (contentLength !== null && contentLength > MAX_PART_BYTES) {
    return jsonError("Chunk too large", 413, "chunk_too_large");
  }

  const buffer = await req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return jsonError("Missing chunk body", 400, "no_body");
  }

  const result = await uploadPart(
    row.webcamStorageKey,
    row.webcamUploadId,
    partNumber,
    buffer,
  );

  const res: PartResponse = {
    partNumber: result.partNumber,
    etag: result.etag,
  };
  return withCors(NextResponse.json(res));
}
