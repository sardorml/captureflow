/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { getCloudflareEnv } from "@/lib/recording/cf-env";
import { shareImageLinkFor } from "@/lib/recording/share-image-link";
import {
  BACKGROUND_MAX_MEGAPIXELS,
  composeShareImage,
  decodeJpeg,
  type Rgba,
} from "@/lib/recording/share-image";
import {
  recordingBackgroundImageFile,
  recordingBackgroundImageKey,
  recordingWallpaperUrl,
} from "@/lib/recording-config";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

// Built on the first crawler request for a look, then served from R2.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!isValidSlug(slug)) return notFound();
  const row = await getRecording(slug);
  if (!row) return notFound();
  const link = await shareImageLinkFor(row);
  if (!link || !row.posterKey) return notFound();

  const env = await getCloudflareEnv();
  if (!env?.BUCKET) return new NextResponse("Unavailable", { status: 503 });
  const bucket = env.BUCKET;

  const cached = await bucket.get(link.key);
  if (cached) return jpeg(cached.body);

  const posterObj = await bucket.get(row.posterKey);
  const poster = posterObj
    ? decodeJpeg(new Uint8Array(await posterObj.arrayBuffer()))
    : null;
  if (!poster) return notFound();

  const bytes = composeShareImage({
    poster,
    frame: link.config,
    backgroundImage: await loadBackground(req, bucket, link.config.background),
    width: link.width,
    height: link.height,
  });
  await bucket.put(link.key, bytes, {
    httpMetadata: { contentType: "image/jpeg", cacheControl: CACHE_CONTROL },
  });
  return jpeg(bytes);
}

async function loadBackground(
  req: NextRequest,
  bucket: R2Bucket,
  background: string,
): Promise<Rgba | null> {
  try {
    // The full wallpaper is 10 megapixels, and decoding it takes more memory than a Worker has.
    const wallpaper = recordingWallpaperUrl(background, "share");
    if (wallpaper) {
      const res = await fetch(new URL(wallpaper, req.url));
      return res.ok ? decodeBackground(await res.arrayBuffer()) : null;
    }
    const file = recordingBackgroundImageFile(background);
    if (file) {
      const obj = await bucket.get(recordingBackgroundImageKey(file));
      return obj ? decodeBackground(await obj.arrayBuffer()) : null;
    }
  } catch (err) {
    console.warn("[og] background failed:", err);
  }
  return null;
}

function decodeBackground(buffer: ArrayBuffer): Rgba | null {
  return decodeJpeg(new Uint8Array(buffer), BACKGROUND_MAX_MEGAPIXELS);
}

function jpeg(body: BodyInit): Response {
  return new Response(body, {
    headers: { "content-type": "image/jpeg", "cache-control": CACHE_CONTROL },
  });
}

function notFound(): NextResponse {
  return new NextResponse("Not found", { status: 404 });
}
