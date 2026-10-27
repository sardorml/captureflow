/// <reference types="@cloudflare/workers-types" />

import { NextResponse } from "next/server";
import { failingTables } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";

export const dynamic = "force-dynamic";

// The tables a signed-in dashboard render reads. The deploy's smoke test calls
// this right after a release and rolls back if any of them is missing.
const CORE_TABLES = [
  "users",
  "sessions",
  "workspace",
  "workspace_member",
  "workspace_invite",
  "workspace_subscription",
  "recordings",
  "screenshots",
  "seat_request",
  "notification",
  "seat_change",
] as const;

export async function GET() {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const missing = await failingTables(env.DB, CORE_TABLES);
  if (missing.length) {
    console.error("[health] tables failing:", missing.join(", "));
    return NextResponse.json(
      { ok: false, failing: missing.length },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true },
    { headers: { "cache-control": "no-store" } },
  );
}
