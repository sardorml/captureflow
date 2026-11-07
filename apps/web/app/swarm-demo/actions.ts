"use server";

import { getAppWebEnv } from "@/lib/cf-env";
import {
  loadMcpUser,
  LibraryError,
  type LibraryErrorCode,
} from "@/lib/mcp/library";
import { startSwarmDemo } from "@/lib/mcp/recording";
import { loadSession } from "@/lib/session-guard";
import { checkSite, hydrateDemoUrl, type SitePreview } from "@/lib/swarm-demo";

export type SwarmDemoErrorCode =
  | LibraryErrorCode
  | "invalidUrl"
  | "unreachable";

export type SwarmDemoResult =
  | { kind: "login" }
  | { kind: "started"; url: string }
  | { kind: "error"; code: SwarmDemoErrorCode };

export type SwarmDemoCheck =
  | { kind: "ok"; site: SitePreview }
  | { kind: "error"; code: SwarmDemoErrorCode };

// The address is looked up before anything is spent on it, and what was found is shown to confirm.
export async function checkSwarmDemoAction(
  raw: unknown,
): Promise<SwarmDemoCheck> {
  const url = hydrateDemoUrl(raw);
  if (!url) return { kind: "error", code: "invalidUrl" };
  const site = await checkSite(url);
  if (!site) return { kind: "error", code: "unreachable" };
  return { kind: "ok", site };
}

export async function startSwarmDemoAction(
  raw: unknown,
): Promise<SwarmDemoResult> {
  const url = hydrateDemoUrl(raw);
  if (!url) return { kind: "error", code: "invalidUrl" };
  const session = await loadSession();
  if (!session) return { kind: "login" };
  const env = await getAppWebEnv();
  if (!env?.DB) return { kind: "error", code: "unavailable" };
  try {
    const user = await loadMcpUser(env.DB, session.user.id);
    const started = await startSwarmDemo(env.DB, env, user, url);
    return { kind: "started", url: started.url };
  } catch (err) {
    if (err instanceof LibraryError) return { kind: "error", code: err.code };
    console.error("[swarm-demo]", err);
    return { kind: "error", code: "failed" };
  }
}
