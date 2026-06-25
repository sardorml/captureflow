import { NextRequest, NextResponse } from "next/server";
import { getScreenshot } from "@/lib/screenshot/db";
import { getScreenshotBody } from "@/lib/screenshot/r2";
import { isValidScreenshotId } from "@/lib/screenshot/id";
import type { ScreenshotApiError } from "@/lib/screenshot/types";

/*
 * Same-origin proxy: the HTML `download` attribute is ignored on cross-origin
 * links unless the origin sends the attachment header, and the CDN is
 * cross-origin to the screenshot page, so we proxy to keep the link same-origin.
 */

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!isValidScreenshotId(id)) {
    return notFoundJson("Invalid id", "invalid_id");
  }

  const row = await getScreenshot(id);
  if (!row || row.state !== "ready") {
    return notFoundJson("Screenshot not found", "not_found");
  }

  const obj = await getScreenshotBody(id);
  if (!obj) {
    return notFoundJson("Object missing", "object_missing");
  }

  const filename = `captureflow-${id}.png`;
  const headers = new Headers();
  headers.set("content-type", "image/png");
  headers.set(
    "content-disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename,
    )}`,
  );
  if (typeof obj.size === "number") {
    headers.set("content-length", String(obj.size));
  }
  headers.set("cache-control", "no-store");

  return new Response(obj.body, { status: 200, headers });
}

function notFoundJson(error: string, code: string): NextResponse {
  const body: ScreenshotApiError = { error, code };
  return NextResponse.json(body, { status: 404 });
}
