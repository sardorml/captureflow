import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getShare } from "@/lib/share/db";
import { isValidSlug } from "@/lib/share/slug";
import { verifySessionOrNull } from "@/lib/share/verify-session";
import {
  hydrateSummaryChapters,
  loadSummaryChapters,
  saveSummaryChapters,
  type ShareSummaryChapters,
} from "@/lib/share/summary-chapters";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const row = await getShare(id);
  if (!row || row.state !== "ready") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const payload = await loadSummaryChapters(row.storageKey);
  return NextResponse.json(payload);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const row = await getShare(id);
  if (!row || row.state !== "ready") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const cookieHeader = (await headers()).get("cookie");
  const session = await verifySessionOrNull(cookieHeader);
  if (!session || session.userId !== row.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const normalized: ShareSummaryChapters = hydrateSummaryChapters(body);
  await saveSummaryChapters(row.storageKey, normalized);
  return NextResponse.json(normalized);
}
