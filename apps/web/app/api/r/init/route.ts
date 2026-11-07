import { NextRequest, NextResponse } from "next/server";
import { resolveDeviceTokenToUser } from "@/lib/recording/device-tokens";
import { initRecording, parseInitRequest } from "@/lib/recording/init";
import { optionsResponse, withCors, jsonError } from "@/lib/recording/cors";
import type { InitRequest } from "@/lib/recording/types";

const DEVICE_HEADER = "x-captureflow-device";

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const match = /^bearer\s+(.+)$/i.exec(h.trim());
  return match ? match[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError("Missing or invalid device header", 400, "invalid_device");
  }

  let body: Partial<InitRequest>;
  try {
    body = (await req.json()) as Partial<InitRequest>;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json");
  }

  const parsed = parseInitRequest(body);
  if (parsed.kind === "error") {
    return jsonError(parsed.error, parsed.status, parsed.code);
  }

  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError(
      "Sign in to create a recording link.",
      401,
      "missing_token",
    );
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError(
      "Sign-in expired or revoked. Sign in again to keep sharing under your account.",
      401,
      "invalid_token",
    );
  }

  const result = await initRecording(userId, deviceId, parsed.init);
  if (result.kind === "error") {
    return jsonError(result.error, result.status, result.code);
  }
  return withCors(NextResponse.json(result.response));
}
