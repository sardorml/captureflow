import { NextRequest, NextResponse } from "next/server";
import { isDevDevice } from "@/lib/recording/dev-allowlist";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import {
  getWorkspaceEntitlement,
  resolveUploadTarget,
  uploadBudgetFor,
} from "@/lib/recording/quota";
import type { RecordingQualityId } from "@/lib/recording/limits";

const DEVICE_HEADER = "x-captureflow-device";

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  capReached: boolean;
  isDev: boolean;
  tier: "free" | "team";
  // Free-tier caps the recorder applies before it starts; null once paid or for a dev device.
  maxDurationMs: number | null;
  maxQuality: RecordingQualityId | null;
};

export function OPTIONS() {
  return optionsResponse();
}

// The limits of the workspace the next upload lands in: the pool on a paid
// one, the per-recording caps on a free one, which has no pool to fill.
export async function GET(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError("Missing or invalid device header", 400, "invalid_device");
  }

  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError("Sign in to read recording usage", 401, "missing_token");
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError("Sign-in expired or revoked", 401, "invalid_token");
  }

  const [target, isDev] = await Promise.all([
    resolveUploadTarget(userId, null),
    isDevDevice(deviceId),
  ]);
  const workspaceId = target?.workspace.id ?? null;
  const [budget, entitlement] = await Promise.all([
    uploadBudgetFor({ userId, workspaceId, sizeBytes: 0, webcamSizeBytes: 0 }),
    workspaceId ? getWorkspaceEntitlement(workspaceId) : null,
  ]);
  const usedBytes = budget.kind === "storage" ? budget.used : 0;
  const limitBytes =
    budget.kind === "storage" ? budget.limit : Number.MAX_SAFE_INTEGER;

  const body: UsageResponse = {
    usedBytes,
    limitBytes,
    capReached: !isDev && usedBytes >= limitBytes,
    isDev,
    tier: entitlement?.tier ?? "free",
    maxDurationMs: isDev ? null : (entitlement?.maxRecordingMs ?? null),
    maxQuality: isDev ? null : (entitlement?.maxQuality ?? null),
  };
  return withCors(NextResponse.json(body));
}
