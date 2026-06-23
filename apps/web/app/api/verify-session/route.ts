/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { listWorkspacesForUser } from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";

// CORS-locked to the allowlisted origins so a malicious origin can't extract
// a user's workspace list by firing a credentialed request from the browser.
const ALLOWED_ORIGINS = new Set([
  "https://captureflow.xyz",
  "https://dev.captureflow.xyz",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3032",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Cookie",
      vary: "Origin",
    };
  }
  return { vary: "Origin" };
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export type VerifySessionResponse = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  workspaceIds: string[];
};

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const auth = await getAuth();
  let session;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch (err) {
    console.error("verify-session: getSession threw", err);
    return NextResponse.json(
      { error: "session-lookup-failed" },
      { status: 401, headers },
    );
  }
  if (!session) {
    return NextResponse.json({ error: "no-session" }, { status: 401, headers });
  }

  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json(
      { error: "db-unavailable" },
      { status: 500, headers },
    );
  }

  const [memberships, userRow] = await Promise.all([
    listWorkspacesForUser(env.DB, session.user.id),
    env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
      .bind(session.user.id)
      .first<{ image: string | null }>(),
  ]);
  const body: VerifySessionResponse = {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    image: userRow?.image ?? null,
    workspaceIds: memberships.map((m) => m.workspace_id),
  };
  return NextResponse.json(body, { headers });
}
