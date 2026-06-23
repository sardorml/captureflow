import { EventEmitter } from "events";
import { app } from "electron";
import { join } from "path";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import type { ShareAuthState } from "../../../shared/types";
import { logInfo, logWarn } from "../logger";
import { setShareConnectivity } from "./share-connectivity";

// The raw token is the share-API credential — keep it out of logs and never
// round-trip it to the renderer.

const FILE_NAME = "share-auth.json";

type StoredAuth = {
  token: string;
  tokenId: string;
  label: string | null;
  email: string | null;
};

let cached: StoredAuth | null = null;
const events = new EventEmitter();

function filePath(): string {
  return join(app.getPath("userData"), FILE_NAME);
}

function stateFromStored(stored: StoredAuth | null): ShareAuthState {
  if (!stored) return { kind: "signed_out" };
  return {
    kind: "signed_in",
    tokenId: stored.tokenId,
    label: stored.label,
    email: stored.email,
  };
}

// Renderer-safe view; never includes the raw token.
export function getShareAuthState(): ShareAuthState {
  return stateFromStored(cached);
}

// Internal use only — exposes the raw bearer.
export function getShareAuthToken(): string | null {
  return cached?.token ?? null;
}

export async function loadShareAuth(): Promise<ShareAuthState> {
  try {
    const raw = await readFile(filePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (
      typeof parsed.token === "string" &&
      parsed.token.length >= 32 &&
      typeof parsed.tokenId === "string" &&
      parsed.tokenId.length > 0
    ) {
      cached = {
        token: parsed.token,
        tokenId: parsed.tokenId,
        label: typeof parsed.label === "string" ? parsed.label : null,
        email: typeof parsed.email === "string" ? parsed.email : null,
      };
      logInfo("share-auth", `loaded saved session (tokenId=${cached.tokenId})`);
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT") {
      logWarn("share-auth", `failed to read auth file (${code})`);
    }
  }
  return stateFromStored(cached);
}

export async function setShareAuth(input: {
  token: string;
  tokenId: string;
  label?: string | null;
  email?: string | null;
}): Promise<ShareAuthState> {
  const next: StoredAuth = {
    token: input.token,
    tokenId: input.tokenId,
    label: input.label ?? null,
    email: input.email ?? null,
  };
  cached = next;
  try {
    await mkdir(app.getPath("userData"), { recursive: true });
    await writeFile(filePath(), JSON.stringify(next), "utf-8");
    logInfo("share-auth", `saved session (tokenId=${next.tokenId})`);
  } catch (err) {
    logWarn("share-auth", `failed to persist session: ${String(err)}`);
  }
  const state = stateFromStored(next);
  events.emit("change", state);
  return state;
}

// Runs even with no token cached, purely to track connectivity. Network errors
// never sign the user out — only an explicit 401 from the worker clears the auth.
const AUTH_CHECK_BASE =
  process.env.CAPTUREFLOW_SHARE_API_BASE ?? "https://captureflow.xyz/api/r";
const AUTH_CHECK_TIMEOUT_MS = 8_000;

export async function validateShareAuth(): Promise<ShareAuthState> {
  const token = cached?.token ?? null;
  try {
    const headers: Record<string, string> = {};
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await fetch(`${AUTH_CHECK_BASE}/auth/check`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(AUTH_CHECK_TIMEOUT_MS),
    });
    // Any HTTP response (including 400/401) means the host is reachable.
    setShareConnectivity("online");
    if (token && res.status === 401) {
      logInfo(
        "share-auth",
        "remote check rejected token; clearing local session",
      );
      return clearShareAuth();
    }
    if (!res.ok && res.status !== 400) {
      logWarn(
        "share-auth",
        `remote check returned ${res.status}; keeping cached session`,
      );
    }
  } catch (err) {
    logWarn("share-auth", `remote check failed (network): ${String(err)}`);
    setShareConnectivity("offline");
  }
  return stateFromStored(cached);
}

export async function clearShareAuth(): Promise<ShareAuthState> {
  cached = null;
  try {
    await rm(filePath(), { force: true });
    logInfo("share-auth", "cleared session");
  } catch (err) {
    logWarn("share-auth", `failed to remove auth file: ${String(err)}`);
  }
  const state = stateFromStored(null);
  events.emit("change", state);
  return state;
}

export function onShareAuthChange(
  fn: (state: ShareAuthState) => void,
): () => void {
  events.on("change", fn);
  return () => {
    events.off("change", fn);
  };
}
