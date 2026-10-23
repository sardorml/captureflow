import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getRecording, getTranscript } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";
import { resolveTranscript, transcriptToVtt } from "@/lib/recording/transcript";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// WebVTT for the player's <track>; same visibility gate as the JSON route.
export async function GET(_req: Request, { params }: Params) {
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
  return new NextResponse(transcriptToVtt(transcript), {
    headers: {
      "content-type": "text/vtt; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
