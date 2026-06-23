import { EventEmitter } from "events";
import type { ShareUsageState } from "../../../shared/types";
import { loadDeviceId } from "../device-id";
import { logInfo, logWarn } from "../logger";
import { clearShareAuth, getShareAuthToken } from "./share-auth";
import { setShareConnectivity } from "./share-connectivity";

const APP_WEB_API_BASE =
  process.env.CAPTUREFLOW_APP_WEB_API_BASE ?? "https://captureflow.xyz";
const USAGE_TIMEOUT_MS = 8_000;

// MUST mirror the web backend's ACCOUNT_LIMITS.{totalStorageBytes,
// activeArtifactsPerAccount}, which isn't a desktop dependency.
const ACCOUNT_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024;
const ACCOUNT_ACTIVE_LIMIT = 50;

let current: ShareUsageState = { kind: "unknown" };
let inflight: Promise<ShareUsageState> | null = null;
const events = new EventEmitter();

export function getShareUsage(): ShareUsageState {
  return current;
}

export function onShareUsageChange(
  fn: (state: ShareUsageState) => void,
): () => void {
  events.on("change", fn);
  return () => {
    events.off("change", fn);
  };
}

function setShareUsage(next: ShareUsageState): void {
  current = next;
  events.emit("change", next);
}

export function markShareUsageCapReached(): void {
  if (current.kind === "known") {
    if (current.capReached) return;
    setShareUsage({ ...current, capReached: true, checkedAt: Date.now() });
    return;
  }
  setShareUsage({
    kind: "known",
    usedBytes: ACCOUNT_STORAGE_LIMIT_BYTES,
    limitBytes: ACCOUNT_STORAGE_LIMIT_BYTES,
    activeCount: 0,
    activeLimit: ACCOUNT_ACTIVE_LIMIT,
    capReached: true,
    isDev: false,
    proSubscriptionActive: false,
    checkedAt: Date.now(),
  });
}

type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  activeCount: number;
  activeLimit: number;
  capReached: boolean;
  isDev: boolean;
  // Optional for backward compat — older app-web deploys omit it (treated as false).
  proSubscriptionActive?: boolean;
};

export async function refreshShareUsage(): Promise<ShareUsageState> {
  if (inflight) return inflight;
  const promise = (async (): Promise<ShareUsageState> => {
    const token = getShareAuthToken();
    if (!token) {
      // Drop stale cached numbers so the cap doesn't leak across sign-out.
      if (current.kind !== "unknown") setShareUsage({ kind: "unknown" });
      return current;
    }
    const deviceId = await loadDeviceId();
    try {
      const res = await fetch(`${APP_WEB_API_BASE}/api/usage`, {
        method: "GET",
        headers: {
          "x-captureflow-device": deviceId,
          authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(USAGE_TIMEOUT_MS),
      });
      // Any HTTP response means the host is reachable.
      setShareConnectivity("online");
      // 401 = device revoked; clear the local session so the lock flips to "sign in".
      if (res.status === 401) {
        logInfo(
          "share-usage",
          "usage probe rejected token; clearing local session",
        );
        void clearShareAuth().catch(() => {});
        return current;
      }
      if (!res.ok) {
        logWarn(
          "share-usage",
          `refresh returned ${res.status}; keeping cached`,
        );
        return current;
      }
      const body = (await res.json()) as Partial<UsageResponse>;
      if (
        typeof body.usedBytes !== "number" ||
        typeof body.limitBytes !== "number" ||
        typeof body.capReached !== "boolean"
      ) {
        logWarn("share-usage", "refresh: malformed response");
        return current;
      }
      const next: ShareUsageState = {
        kind: "known",
        usedBytes: body.usedBytes,
        limitBytes: body.limitBytes,
        activeCount: body.activeCount ?? 0,
        activeLimit: body.activeLimit ?? 0,
        capReached: body.capReached,
        isDev: body.isDev ?? false,
        proSubscriptionActive: body.proSubscriptionActive ?? false,
        checkedAt: Date.now(),
      };
      const changed =
        current.kind !== "known" ||
        current.usedBytes !== next.usedBytes ||
        current.activeCount !== next.activeCount ||
        current.capReached !== next.capReached ||
        current.proSubscriptionActive !== next.proSubscriptionActive;
      if (changed) {
        logInfo(
          "share-usage",
          `refreshed: ${next.usedBytes}B / ${next.limitBytes}B, ` +
            `${next.activeCount}/${next.activeLimit} shares, cap=${next.capReached}`,
        );
        setShareUsage(next);
      } else {
        // Update checkedAt without emitting, so callers can tell a recent probe ran.
        current = next;
      }
      return next;
    } catch (err) {
      logWarn("share-usage", `refresh failed (network): ${String(err)}`);
      setShareConnectivity("offline");
      return current;
    }
  })();
  inflight = promise;
  try {
    return await promise;
  } finally {
    inflight = null;
  }
}
