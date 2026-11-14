import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getRecording, getTranscript } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";
import { parseRecordingConfigJson } from "@/lib/recording-config";
import {
  resolveTranscript,
  transcriptToCaptionVtt,
  transcriptToSrt,
} from "@/lib/recording/transcript";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// WebVTT for the player's <track>, or an SRT file with ?format=srt; same visibility gate as the JSON route.
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const row = await getRecording(id);
  const visitor = await verifySessionOrNull((await headers()).get("cookie"));
  if (!row || row.state !== "ready" || !canViewResource(visitor, row)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { transcript } = resolveTranscript(await getTranscript(id));
  if (!transcript) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { cuts } = parseRecordingConfigJson(row.configJson);
  if (new URL(req.url).searchParams.get("format") === "srt") {
    return new NextResponse(transcriptToSrt(transcript, cuts), {
      headers: {
        "content-type": "application/x-subrip; charset=utf-8",
        "content-disposition": `attachment; filename="captureflow-${id}.srt"`,
        "cache-control": "private, no-store",
      },
    });
  }
  return new NextResponse(transcriptToCaptionVtt(transcript, cuts), {
    headers: {
      "content-type": "text/vtt; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
