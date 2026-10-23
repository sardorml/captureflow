import { NextRequest, NextResponse } from "next/server";
import { getRecording, upsertTranscript } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import { hydrateTranscript } from "@/lib/recording/transcript";
import type { TranscriptRequest } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

// Posted by the recorder after /finalize. Accepted while the upload is still
// pending too, so a transcript that lands first is not lost; the GC's cascade
// cleans it up if the recording never finalizes.
export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  let body: Partial<TranscriptRequest>;
  try {
    body = (await req.json()) as Partial<TranscriptRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  if (!isValidSlug(body.slug)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }
  const transcript = hydrateTranscript(body.transcript);
  if (!transcript) {
    return jsonError("Invalid transcript", 400, "invalid_transcript");
  }

  const row = await getRecording(body.slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.state !== "pending" && row.state !== "ready") {
    return jsonError(
      "Recording not accepting a transcript",
      409,
      "wrong_state",
    );
  }

  await upsertTranscript({
    slug: row.slug,
    source: transcript.source,
    language: transcript.language,
    autoJson: JSON.stringify(transcript),
  });
  return withCors(NextResponse.json({ ok: true }));
}
