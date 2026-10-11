import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { resolveDeviceTokenToUser } from "./device-tokens";
import { verifySessionOrNull } from "./verify-session";

// The account behind a request: the app's bearer token when one is sent, else
// the browser session. The device id header is never enough on its own.
export async function callerUserId(req: NextRequest): Promise<string | null> {
  const bearer = /^bearer\s+(.+)$/i.exec(
    req.headers.get("authorization")?.trim() ?? "",
  )?.[1];
  if (bearer) return resolveDeviceTokenToUser(bearer);
  const session = await verifySessionOrNull((await headers()).get("cookie"));
  return session?.userId ?? null;
}

export async function callerOwns(
  req: NextRequest,
  row: { userId: string | null },
): Promise<boolean> {
  if (!row.userId) return false;
  return (await callerUserId(req)) === row.userId;
}
