import { NextResponse, type NextRequest } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import { callerOwns } from "@/lib/recording/caller";
import { getRecording } from "@/lib/recording/db";
import { waveformKeyFor } from "@/lib/recording/object-keys";
import { publicUrlFor } from "@/lib/recording/r2";
import { isValidSlug } from "@/lib/recording/slug";
import {
  hydratePeaks,
  WAVEFORM_BUCKETS,
  WAVEFORM_BYTES,
} from "@/lib/recording/waveform";
import {
  parseCaptureJson,
  trackHasAudio,
} from "@/lib/recording/capture-report";
import { computePeaks } from "@/lib/recording/waveform-compute";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function error(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

function peaksResponse(body: BodyInit) {
  return new Response(body, {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "no-store",
    },
  });
}

// Only the recording's owner opens the editor, and reading a file costs
// container time, so nobody else gets this far.
async function ownedMediaKey(
  req: NextRequest,
  { params }: Params,
): Promise<{ key: string; silent: boolean } | { failure: NextResponse }> {
  const { id } = await params;
  if (!isValidSlug(id)) return { failure: error("invalid_slug", 400) };
  const track = req.nextUrl.searchParams.get("track");
  if (track !== null && track !== "webcam") {
    return { failure: error("invalid_track", 400) };
  }
  const row = await getRecording(id);
  if (!row || row.state !== "ready" || !(await callerOwns(req, row))) {
    return { failure: error("not_found", 404) };
  }
  const key = track === "webcam" ? row.webcamStorageKey : row.storageKey;
  if (!key) return { failure: error("not_found", 404) };
  const silent =
    trackHasAudio(
      parseCaptureJson(row.captureJson),
      track === "webcam" ? "webcam" : "screen",
    ) === false;
  return { key, silent };
}

export async function GET(req: NextRequest, ctx: Params) {
  const media = await ownedMediaKey(req, ctx);
  if ("failure" in media) return media.failure;
  // A file the recorder put no audio in is a flat line, no reading needed.
  if (media.silent) {
    return peaksResponse(new Float32Array(WAVEFORM_BUCKETS).buffer);
  }
  const env = await getAppWebEnv();
  if (!env?.BUCKET) return error("r2_unavailable", 500);

  const saved = await env.BUCKET.get(waveformKeyFor(media.key));
  if (saved) return peaksResponse(saved.body);

  const peaks = await computePeaks(
    env,
    media.key,
    await publicUrlFor(media.key),
  );
  if (!peaks) return error("waveform_unavailable", 503);
  await env.BUCKET.put(waveformKeyFor(media.key), peaks);
  return peaksResponse(peaks);
}

export async function PUT(req: NextRequest, ctx: Params) {
  const media = await ownedMediaKey(req, ctx);
  if ("failure" in media) return media.failure;
  if (Number(req.headers.get("content-length")) > WAVEFORM_BYTES) {
    return error("invalid_peaks", 400);
  }
  const peaks = hydratePeaks(await req.arrayBuffer());
  if (!peaks) return error("invalid_peaks", 400);
  const env = await getAppWebEnv();
  if (!env?.BUCKET) return error("r2_unavailable", 500);
  await env.BUCKET.put(waveformKeyFor(media.key), peaks);
  return new Response(null, { status: 204 });
}
