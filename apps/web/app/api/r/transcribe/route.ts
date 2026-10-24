import { NextRequest, NextResponse } from "next/server";
import { createTranscriptJob, getRecording } from "@/lib/recording/db";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import { callerOwns } from "@/lib/recording/caller";
import { audioPartKeyFor } from "@/lib/recording/object-keys";
import { hydrateTranscribeRequest } from "@/lib/recording/transcription";
import { dispatchTranscription } from "@/lib/recording/transcription-dispatch";

const DEVICE_HEADER = "x-captureflow-device";

export function OPTIONS() {
  return optionsResponse();
}

/*
 * Posted once every audio chunk is stored. Device-authorized while the upload
 * is in flight (the recorder calls it before /finalize); a finished recording
 * needs the owner, as replacing the transcript does. Re-posting restarts the
 * job and drops the owner's edits.
 */
export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError("Missing device header", 400, "invalid_device");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }
  const job = hydrateTranscribeRequest(body);
  if (!job) return jsonError("Invalid request", 400, "invalid_request");

  const row = await getRecording(job.slug);
  if (!row) return jsonError("Recording not found", 404, "not_found");
  if (row.deviceId !== deviceId)
    return jsonError("Forbidden", 403, "forbidden");
  if (row.state === "ready" && !(await callerOwns(req, row))) {
    return jsonError("Forbidden", 403, "forbidden");
  }
  if (row.state === "failed") {
    return jsonError("Recording is failed", 409, "wrong_state");
  }

  await createTranscriptJob({
    slug: row.slug,
    language: job.language,
    parts: job.parts.map((part) => ({
      ...part,
      storageKey: audioPartKeyFor(row.storageKey, part.partNumber),
    })),
  });
  await dispatchTranscription(
    job.parts.map(({ partNumber }) => ({ slug: row.slug, partNumber })),
  );
  return withCors(NextResponse.json({ ok: true }));
}
