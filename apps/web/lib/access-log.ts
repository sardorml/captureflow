/// <reference types="@cloudflare/workers-types" />

import { headers as requestHeaders } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ACCESS_PATH_HEADER } from "./access-path";
import { getAppWebEnv, runInBackground } from "./cf-env";

export type AccessVia = "session" | "device";

export type AccessEntry = {
  userId: string;
  via: AccessVia;
  credentialId: string;
  // The request it came from; a page render passes nothing and the path comes
  // from the middleware header, or `fallbackRoute` when there is none.
  request?: Request;
  fallbackRoute?: string;
};

const HOUR_MS = 60 * 60 * 1000;
const MAX_ROUTE = 200;
const MAX_AGENT = 400;

async function resolveHeaders(request?: Request): Promise<Headers | null> {
  if (request) return request.headers;
  try {
    return await requestHeaders();
  } catch {
    return null;
  }
}

function routeOf(
  request: Request | undefined,
  h: Headers | null,
  fallback: string,
): string {
  if (request) {
    try {
      return `${request.method} ${new URL(request.url).pathname}`;
    } catch {}
  }
  const path = h?.get(ACCESS_PATH_HEADER);
  if (!path) return fallback;
  return h?.get("next-action") ? `ACTION ${path}` : `PAGE ${path}`;
}

async function geo(): Promise<{ city: string | null; country: string | null }> {
  try {
    const { cf } = await getCloudflareContext({ async: true });
    return {
      city: typeof cf?.city === "string" ? cf.city : null,
      country: typeof cf?.country === "string" ? cf.country : null,
    };
  } catch {
    return { city: null, country: null };
  }
}

async function writeAccess(entry: AccessEntry): Promise<void> {
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const h = await resolveHeaders(entry.request);
  const route = routeOf(
    entry.request,
    h,
    entry.fallbackRoute ?? "unknown",
  ).slice(0, MAX_ROUTE);
  const where = await geo();
  const now = Date.now();
  const ip =
    h?.get("cf-connecting-ip") ??
    h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  await env.DB.prepare(
    `INSERT INTO user_access
       (user_id, hour, via, credential_id, route, hits, first_at, last_at,
        ip, country, city, user_agent)
     VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6, ?6, ?7, ?8, ?9, ?10)
     ON CONFLICT (user_id, hour, via, credential_id, route) DO UPDATE SET
       hits = hits + 1,
       last_at = excluded.last_at,
       ip = COALESCE(excluded.ip, ip),
       country = COALESCE(excluded.country, country),
       city = COALESCE(excluded.city, city),
       user_agent = COALESCE(excluded.user_agent, user_agent)`,
  )
    .bind(
      entry.userId,
      Math.floor(now / HOUR_MS) * HOUR_MS,
      entry.via,
      entry.credentialId,
      route,
      now,
      ip,
      where.country ?? h?.get("cf-ipcountry") ?? null,
      where.city,
      h?.get("user-agent")?.slice(0, MAX_AGENT) ?? null,
    )
    .run();
}

// Best effort and off the response path: a failed log never fails a request.
export function logAccess(entry: AccessEntry): void {
  void runInBackground(writeAccess(entry));
}
