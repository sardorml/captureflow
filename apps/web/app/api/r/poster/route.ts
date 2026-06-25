import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { putObject, publicUrlFor } from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

const DEVICE_HEADER = "x-captureflow-device";
const MAX_POSTER_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function OPTIONS() {
  return optionsResponse();
}

// A poster may be uploaded while the video is still `pending` (the desktop
// client races them in parallel) and overwritten after `ready`.
export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  const contentType = (req.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim();
  if (!ALLOWED_TYPES.has(contentType)) {
    return jsonError(
      "Unsupported poster content type",
      400,
      "invalid_content_type",
    );
  }

  const contentLengthRaw = req.headers.get("content-length");
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (contentLength !== null && contentLength > MAX_POSTER_BYTES) {
    return jsonError("Poster too large", 413, "poster_too_large");
  }

  const row = await getRecording(slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.state === "failed") {
    return jsonError("Recording is failed", 409, "wrong_state");
  }

  const buffer = await req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return jsonError("Missing body", 400, "no_body");
  }
  if (buffer.byteLength > MAX_POSTER_BYTES) {
    return jsonError("Poster too large", 413, "poster_too_large");
  }

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const posterKey = `posters/${slug}.${ext}`;

  await putObject(posterKey, buffer, contentType, "no-cache");
  await updateRecording(slug, { posterKey });

  return withCors(
    NextResponse.json({
      posterKey,
      url: await publicUrlFor(posterKey),
    }),
  );
}
