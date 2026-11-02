import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getRecording, updateRecording } from "@/lib/recording/db";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";
import {
  hydrateSummaryChapters,
  parseSummaryChaptersJson,
  type RecordingSummaryChapters,
} from "@/lib/recording/summary-chapters";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// The owner edits in the viewer with a cookie; the local MCP writes an agent's report with its device token.
async function callerUserId(): Promise<string | null> {
  const h = await headers();
  const bearer = /^bearer\s+(.+)$/i.exec((h.get("authorization") ?? "").trim());
  if (bearer) return resolveDeviceTokenToUser(bearer[1]!.trim());
  return (await verifySessionOrNull(h.get("cookie")))?.userId ?? null;
}

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
  return NextResponse.json(parseSummaryChaptersJson(row.summaryChaptersJson));
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const row = await getRecording(id);
  if (!row || row.state !== "ready") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const userId = await callerUserId();
  if (!userId || userId !== row.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const normalized: RecordingSummaryChapters = hydrateSummaryChapters(body);
  await updateRecording(row.slug, {
    summaryChaptersJson: JSON.stringify(normalized),
  });
  return NextResponse.json(normalized);
}
