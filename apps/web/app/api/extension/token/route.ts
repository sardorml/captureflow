import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { issueDeviceToken } from "@/lib/device-tokens";
import { isSameOriginRequest } from "@/lib/same-origin";
import { getSessionWithin } from "@/lib/session-read";

const LABEL = "Browser extension";

/*
 * Signs the installed extension in as whoever this browser is signed in as.
 * Its content script calls this from a page on this site, so the request is
 * same-origin and carries the session cookie; there are no CORS headers, and
 * any other origin is refused before the session is read.
 */
export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers.get("origin"), req.url)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let session;
  try {
    session = await getSessionWithin(
      await getAuth(),
      req.headers,
      "extension-token",
    );
  } catch {
    return NextResponse.json(
      { error: "session-lookup-failed" },
      { status: 503 },
    );
  }
  if (!session) {
    return NextResponse.json({ error: "no-session" }, { status: 401 });
  }
  const issued = await issueDeviceToken(session.user.id, LABEL);
  return NextResponse.json(
    { token: issued.rawToken, id: issued.id },
    { headers: { "cache-control": "no-store" } },
  );
}
