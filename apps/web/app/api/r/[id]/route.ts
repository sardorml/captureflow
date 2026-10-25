import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { removeRecording } from "@/lib/recording/remove";
import { callerOwns } from "@/lib/recording/caller";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

export function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!isValidSlug(id)) {
    return jsonError("Invalid slug", 400, "invalid_slug");
  }

  const row = await getRecording(id);
  if (!row) return withCors(NextResponse.json({ ok: true }));

  if (!(await callerOwns(req, row))) {
    return jsonError("Forbidden", 403, "forbidden");
  }

  await removeRecording(row);

  return withCors(NextResponse.json({ ok: true }));
}
