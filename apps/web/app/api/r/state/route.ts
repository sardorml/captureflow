import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { optionsResponse, withCors } from "@/lib/recording/cors";
import type { RecordingApiError } from "@/lib/recording/types";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    const body: RecordingApiError = {
      error: "Invalid slug",
      code: "invalid_slug",
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }
  const row = await getRecording(slug);
  if (!row) {
    // Don't 404 the probe — the loader needs a stable "still being created vs gone" answer.
    return withCors(NextResponse.json({ state: "missing" as const }));
  }
  // Public and private return the same shape; the page renderer enforces the 404 on ready-private.
  return withCors(
    NextResponse.json({
      state: row.state,
      visibility: row.visibility,
    }),
  );
}
