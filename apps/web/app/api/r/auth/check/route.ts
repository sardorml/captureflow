import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentWorkspaceId,
  listWorkspacesForUser,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { getUserProfile } from "@/lib/recording/db";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";

// Bearer probe: 200 → token live, with the owner's profile and the workspaces
// they can record into; 401 → caller should clearRecordingAuth(); 400 → not a
// bearer header (treat as anonymous).

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

async function listWorkspaces(userId: string) {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const [memberships, current] = await Promise.all([
    listWorkspacesForUser(env.DB, userId),
    getCurrentWorkspaceId(env.DB, userId),
  ]);
  const defaultId =
    memberships.find((m) => m.workspace_id === current)?.workspace_id ??
    memberships.find((m) => m.workspace_kind === "personal")?.workspace_id ??
    memberships[0]?.workspace_id;
  return memberships.map((m) => ({
    id: m.workspace_id,
    name: m.workspace_name,
    kind: m.workspace_kind,
    role: m.role,
    isDefault: m.workspace_id === defaultId,
  }));
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
  const [profile, workspaces] = await Promise.all([
    getUserProfile(userId),
    listWorkspaces(userId),
  ]);
  return withCors(
    NextResponse.json({ ok: true, userId, ...profile, workspaces }),
  );
}
