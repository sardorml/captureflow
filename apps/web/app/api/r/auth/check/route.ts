import { NextRequest, NextResponse } from "next/server";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { getUserProfile } from "@/lib/recording/db";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

// Bearer probe: 200 → token live, with the owner's profile for the extension
// to show; 401 → caller should clearRecordingAuth(); 400 → not a bearer header
// (treat as anonymous).

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const bearer = extractBearer(req);
  if (!bearer) {
    return jsonError("Missing bearer token", 400, "missing_token");
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError("Sign-in expired or revoked", 401, "invalid_token");
  }
  const profile = await getUserProfile(userId);
  return withCors(NextResponse.json({ ok: true, userId, ...profile }));
}
