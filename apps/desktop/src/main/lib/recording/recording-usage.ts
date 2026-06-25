import { EventEmitter } from "events";
import type { RecordingUsageState } from "../../../shared/types";
import { loadDeviceId } from "../device-id";
import { logInfo, logWarn } from "../logger";
import { clearRecordingAuth, getRecordingAuthToken } from "./recording-auth";
import { setRecordingConnectivity } from "./recording-connectivity";

const APP_WEB_API_BASE =
  process.env.CAPTUREFLOW_APP_WEB_API_BASE ?? "https://captureflow.xyz";
const USAGE_TIMEOUT_MS = 8_000;

// MUST mirror the web backend's ACCOUNT_LIMITS.{totalStorageBytes,
// activeArtifactsPerAccount}, which isn't a desktop dependency.
const ACCOUNT_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024;
const ACCOUNT_ACTIVE_LIMIT = 50;

let current: RecordingUsageState = { kind: "unknown" };
let inflight: Promise<RecordingUsageState> | null = null;
const events = new EventEmitter();

export function getRecordingUsage(): RecordingUsageState {
  return current;
}

export function onRecordingUsageChange(
  fn: (state: RecordingUsageState) => void,
): () => void {
  events.on("change", fn);
  return () => {
    events.off("change", fn);
  };
}

function setRecordingUsage(next: RecordingUsageState): void {
  current = next;
  events.emit("change", next);
}

export function markRecordingUsageCapReached(): void {
  if (current.kind === "known") {
    if (current.capReached) return;
    setRecordingUsage({ ...current, capReached: true, checkedAt: Date.now() });
    return;
  }
  setRecordingUsage({
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

export async function refreshRecordingUsage(): Promise<RecordingUsageState> {
  if (inflight) return inflight;
  const promise = (async (): Promise<RecordingUsageState> => {
    const token = getRecordingAuthToken();
    if (!token) {
      // Drop stale cached numbers so the cap doesn't leak across sign-out.
      if (current.kind !== "unknown") setRecordingUsage({ kind: "unknown" });
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
      setRecordingConnectivity("online");
      // 401 = device revoked; clear the local session so the lock flips to "sign in".
      if (res.status === 401) {
        logInfo(
          "recording-usage",
          "usage probe rejected token; clearing local session",
        );
        void clearRecordingAuth().catch(() => {});
        return current;
      }
      if (!res.ok) {
        logWarn(
          "recording-usage",
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
        logWarn("recording-usage", "refresh: malformed response");
        return current;
      }
      const next: RecordingUsageState = {
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
          "recording-usage",
          `refreshed: ${next.usedBytes}B / ${next.limitBytes}B, ` +
            `${next.activeCount}/${next.activeLimit} recordings, cap=${next.capReached}`,
        );
        setRecordingUsage(next);
      } else {
        // Update checkedAt without emitting, so callers can tell a recent probe ran.
        current = next;
      }
      return next;
    } catch (err) {
      logWarn("recording-usage", `refresh failed (network): ${String(err)}`);
      setRecordingConnectivity("offline");
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
