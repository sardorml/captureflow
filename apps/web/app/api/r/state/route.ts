import { NextRequest, NextResponse } from "next/server";
import { getShare } from "@/lib/share/db";
import { isValidSlug } from "@/lib/share/slug";
import { optionsResponse, withCors } from "@/lib/share/cors";
import type { ShareApiError } from "@/lib/share/types";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    const body: ShareApiError = {
      error: "Invalid slug",
      code: "invalid_slug",
    };
    return withCors(NextResponse.json(body, { status: 400 }));
  }
  const row = await getShare(slug);
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
