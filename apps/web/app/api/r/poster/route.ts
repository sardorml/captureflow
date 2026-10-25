import { NextRequest, NextResponse } from "next/server";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { posterThumbKeyFor } from "@/lib/recording/object-keys";
import {
  THUMB_CACHE_CONTROL,
  posterDigest,
  posterThumbnail,
} from "@/lib/recording/poster-blur";
import { isValidSlug } from "@/lib/recording/slug";
import { deleteObject, putObject, publicUrlFor } from "@/lib/recording/r2";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import { callerOwns } from "@/lib/recording/caller";

const DEVICE_HEADER = "x-captureflow-device";
const MAX_POSTER_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function OPTIONS() {
  return optionsResponse();
}

// A poster may be uploaded while the video is still `pending` (the desktop
// client races them in parallel) and overwritten after `ready`, which then
// needs the owner: the device id alone only covers the upload in flight.
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
  if (buffer.byteLength > MAX_POSTER_BYTES) {
    return jsonError("Poster too large", 413, "poster_too_large");
  }

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  // Named after the video's storage id, never the slug: the CDN serves posters
  // too, so a slug-derived key would expose private ones to anyone with the link.
  const storageId = row.storageKey
    .replace(/^videos\//, "")
    .replace(/\.[^.]+$/, "");
  const posterKey = `posters/${storageId}.${ext}`;

  // Clients don't report the frame size, so the poster is where it comes from.
  const thumb = posterThumbnail(buffer, contentType);
  const posterThumbKey = thumb
    ? posterThumbKeyFor(posterKey, await posterDigest(buffer))
    : null;
  await Promise.all([
    putObject(posterKey, buffer, contentType, "no-cache"),
    thumb && posterThumbKey
      ? putObject(
          posterThumbKey,
          thumb.thumb.buffer as ArrayBuffer,
          "image/jpeg",
          THUMB_CACHE_CONTROL,
        )
      : null,
  ]);
  if (row.posterThumbKey && row.posterThumbKey !== posterThumbKey) {
    await deleteObject(row.posterThumbKey).catch(() => undefined);
  }
  await updateRecording(slug, {
    posterKey,
    posterBlur: thumb?.blur ?? null,
    posterThumbKey,
    ...(thumb && (row.width === null || row.height === null)
      ? { width: thumb.width, height: thumb.height }
      : {}),
  });

  return withCors(
    NextResponse.json({
      posterKey,
      url: await publicUrlFor(posterKey),
    }),
  );
}
