import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { isValidScreenshotId } from "@/lib/screenshot/id";
import {
  getScreenshot,
  softDeleteScreenshot,
  updateScreenshotAfterEdit,
} from "@/lib/screenshot/db";
import {
  deleteScreenshot as deleteScreenshotBytes,
  putScreenshot,
} from "@/lib/screenshot/r2";
import { resolveDeviceTokenToUser } from "@/lib/screenshot/device-tokens";
import { verifySessionOrNull } from "@/lib/screenshot/verify-session";
import { optionsResponse, withCors, jsonError } from "@/lib/screenshot/cors";
import { screenshotViewUrlForRequest } from "@/lib/site";

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

async function authorise(
  req: NextRequest,
  id: string | undefined,
  { allowSession = false }: { allowSession?: boolean } = {},
): Promise<
  | {
      kind: "ok";
      userId: string;
      screenshot: NonNullable<Awaited<ReturnType<typeof getScreenshot>>>;
    }
  | { kind: "error"; res: NextResponse }
> {
  if (!isValidScreenshotId(id)) {
    return {
      kind: "error",
      res: jsonError("Invalid screenshot id", 400, "invalid_id"),
    };
  }
  let userId: string | null = null;
  const bearer = extractBearerToken(req);
  if (bearer) {
    userId = await resolveDeviceTokenToUser(bearer);
    if (!userId) {
      return {
        kind: "error",
        res: jsonError("Sign-in expired or revoked", 401, "invalid_token"),
      };
    }
  } else if (allowSession) {
    const cookieHeader = (await headers()).get("cookie");
    const visitor = await verifySessionOrNull(cookieHeader);
    if (!visitor) {
      return {
        kind: "error",
        res: jsonError(
          "Sign in to manage this screenshot",
          401,
          "missing_token",
        ),
      };
    }
    userId = visitor.userId;
  } else {
    return {
      kind: "error",
      res: jsonError("Sign in to access this screenshot", 401, "missing_token"),
    };
  }
  const screenshot = await getScreenshot(id);
  if (!screenshot || screenshot.state !== "ready") {
    return {
      kind: "error",
      res: jsonError("Screenshot not found", 404, "not_found"),
    };
  }
  if (screenshot.userId !== userId) {
    return { kind: "error", res: jsonError("Forbidden", 403, "forbidden") };
  }
  return { kind: "ok", userId, screenshot };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const a = await authorise(req, id);
  if (a.kind === "error") return a.res;
  return withCors(NextResponse.json({ screenshot: a.screenshot }));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const a = await authorise(req, id);
  if (a.kind === "error") return a.res;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/png")) {
    return jsonError("Unsupported content type", 400, "invalid_content_type");
  }

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) {
    return jsonError("Missing body", 400, "no_body");
  }
  if (body.byteLength > ACCOUNT_LIMITS.perScreenshotSizeBytes) {
    return jsonError(
      "Screenshot exceeds per-screenshot size cap",
      413,
      "size_exceeded",
    );
  }

  await putScreenshot(a.screenshot.id, body);
  const updated = await updateScreenshotAfterEdit(a.screenshot.id, {
    sizeBytes: body.byteLength,
  });

  return withCors(
    NextResponse.json({
      screenshot: updated,
      viewUrl: screenshotViewUrlForRequest(req, a.screenshot.id),
    }),
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const a = await authorise(req, id, { allowSession: true });
  if (a.kind === "error") return a.res;

  await softDeleteScreenshot(a.screenshot.id);
  // No cron sweep for screenshots yet, so drop the R2 object inline.
  try {
    await deleteScreenshotBytes(a.screenshot.id);
  } catch (err) {
    console.warn("[screenshot] r2 delete failed:", err);
  }

  return withCors(NextResponse.json({ ok: true }));
}
