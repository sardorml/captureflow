import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getScreenshot, updateScreenshotVisibility } from "@/lib/screenshot/db";
import { isValidScreenshotId } from "@/lib/screenshot/id";
import { verifySessionOrNull } from "@/lib/screenshot/verify-session";
import { optionsResponse, withCors } from "@/lib/screenshot/cors";

// Auth relays through verifySessionOrNull because better-auth lives on
// app.captureflow.xyz while the session cookie is set on .captureflow.xyz.

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidScreenshotId(id)) {
    return withCors(
      NextResponse.json({ error: "Invalid screenshot id" }, { status: 400 }),
    );
  }
  const cookieHeader = (await headers()).get("cookie");
  const visitor = await verifySessionOrNull(cookieHeader);
  if (!visitor) {
    return withCors(
      NextResponse.json(
        { error: "Sign in to manage this screenshot" },
        { status: 401 },
      ),
    );
  }

  const screenshot = await getScreenshot(id);
  if (!screenshot || screenshot.state !== "ready") {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  if (screenshot.userId !== visitor.userId) {
    return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    );
  }
  const value =
    typeof body === "object" && body !== null && "value" in body
      ? (body as { value?: unknown }).value
      : undefined;
  if (value !== "public" && value !== "workspace" && value !== "private") {
    return withCors(
      NextResponse.json({ error: "Invalid visibility" }, { status: 400 }),
    );
  }

  await updateScreenshotVisibility(id, value);
  return withCors(NextResponse.json({ ok: true, visibility: value }));
}
