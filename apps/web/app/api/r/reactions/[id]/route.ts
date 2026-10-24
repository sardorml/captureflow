import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { deleteReaction, getReaction, getRecording } from "@/lib/recording/db";
import { verifySessionOrNull } from "@/lib/recording/verify-session";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// The reaction's author or the recording's owner may remove it.
export async function DELETE(_req: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }
  const reaction = await getReaction(id);
  if (!reaction) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const cookieHeader = (await headers()).get("cookie");
  const session = await verifySessionOrNull(cookieHeader);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let authorized =
    reaction.userId != null && session.userId === reaction.userId;
  if (!authorized) {
    const row = await getRecording(reaction.slug);
    authorized = !!row && row.userId === session.userId;
  }
  if (!authorized) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await deleteReaction(id);
  return NextResponse.json({ ok: true });
}
