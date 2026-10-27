/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentWorkspaceId,
  getPersonalWorkspaceForUser,
  getWorkspaceEntitlement,
  isSelfHosted,
  isWorkspaceMember,
  totalStorageForWorkspace,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveDeviceToken } from "@/lib/device-tokens";

const DEVICE_HEADER = "x-captureflow-device";

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers":
    "Content-Type, Authorization, x-captureflow-device",
  "access-control-max-age": "86400",
  vary: "Origin",
} as const;

function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  capReached: boolean;
  isDev: boolean;
  proSubscriptionActive: boolean;
};

function jsonError(error: string, status: number, code?: string) {
  const body = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}

/*
 * The storage view of one workspace: the requested one when the caller is a
 * member, else the one they are switched to, else their own. A free workspace
 * has no pool, so it reports no limit; `proSubscriptionActive` keeps its wire
 * name for the desktop app and now means a paid workspace.
 */
export async function GET(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError("Missing or invalid device header", 400, "invalid_device");
  }
  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError("Sign in to read usage", 401, "missing_token");
  }

  const env = await getAppWebEnv();
  if (!env?.DB) return jsonError("db unavailable", 500);

  const resolved = await resolveDeviceToken(bearer);
  if (!resolved) {
    return jsonError("Sign-in expired or revoked", 401, "invalid_token");
  }
  const userId = resolved.userId;
  const db = env.DB;

  const requested = new URL(req.url).searchParams.get("workspace_id");
  let workspaceId: string | null = null;
  if (requested && (await isWorkspaceMember(db, requested, userId))) {
    workspaceId = requested;
  }
  if (!workspaceId) {
    const current = await getCurrentWorkspaceId(db, userId);
    if (current && (await isWorkspaceMember(db, current, userId))) {
      workspaceId = current;
    }
  }
  if (!workspaceId) {
    workspaceId = (await getPersonalWorkspaceForUser(db, userId))?.id ?? null;
  }
  if (!workspaceId) return jsonError("No workspace", 404, "no_workspace");

  const [usedBytes, entitlement] = await Promise.all([
    totalStorageForWorkspace(db, workspaceId),
    getWorkspaceEntitlement(db, workspaceId, {
      selfHosted: isSelfHosted(env),
    }),
  ]);

  const body: UsageResponse = {
    usedBytes,
    limitBytes: entitlement.storageBytes,
    capReached: usedBytes >= entitlement.storageBytes,
    isDev: false,
    proSubscriptionActive: entitlement.tier === "team",
  };
  return withCors(NextResponse.json(body));
}
