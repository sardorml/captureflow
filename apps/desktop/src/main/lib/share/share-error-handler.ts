import { clearShareAuth } from "./share-auth";
import { setShareConnectivity } from "./share-connectivity";
import { markShareUsageCapReached, refreshShareUsage } from "./share-usage";
import { logWarn } from "../logger";
import { ShareApiHttpError } from "./share-api-client";

export type ShareUploadFailure = {
  message: string;
  code?: string;
  status?: number;
};

export function handleUploadError(
  err: unknown,
  ctx: { slug?: string; phase: string },
): ShareUploadFailure {
  if (err instanceof ShareApiHttpError) {
    logWarn(
      "share",
      `${ctx.phase} failed (${err.status}/${err.code ?? "unknown"}): ${err.message}` +
        (ctx.slug ? ` [slug=${ctx.slug}]` : ""),
    );
    if (err.code === "invalid_token") {
      void clearShareAuth().catch((cleanupErr) =>
        logWarn(
          "share",
          `clearShareAuth after invalid_token failed: ${String(cleanupErr)}`,
        ),
      );
    }
    if (err.code === "storage_limit" || err.code === "active_limit") {
      markShareUsageCapReached();
      void refreshShareUsage();
    }
    return { message: err.message, code: err.code, status: err.status };
  }
  const message = err instanceof Error ? err.message : String(err);
  logWarn(
    "share",
    `${ctx.phase} failed (network): ${message}` +
      (ctx.slug ? ` [slug=${ctx.slug}]` : ""),
  );
  setShareConnectivity("offline");
  return {
    message: "No internet connection. Check your network and try again.",
  };
}
