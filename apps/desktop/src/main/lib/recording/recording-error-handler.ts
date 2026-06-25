import { clearRecordingAuth } from "./recording-auth";
import { setRecordingConnectivity } from "./recording-connectivity";
import {
  markRecordingUsageCapReached,
  refreshRecordingUsage,
} from "./recording-usage";
import { logWarn } from "../logger";
import { RecordingApiHttpError } from "./recording-api-client";

export type RecordingUploadFailure = {
  message: string;
  code?: string;
  status?: number;
};

export function handleUploadError(
  err: unknown,
  ctx: { slug?: string; phase: string },
): RecordingUploadFailure {
  if (err instanceof RecordingApiHttpError) {
    logWarn(
      "recording",
      `${ctx.phase} failed (${err.status}/${err.code ?? "unknown"}): ${err.message}` +
        (ctx.slug ? ` [slug=${ctx.slug}]` : ""),
    );
    if (err.code === "invalid_token") {
      void clearRecordingAuth().catch((cleanupErr) =>
        logWarn(
          "recording",
          `clearRecordingAuth after invalid_token failed: ${String(cleanupErr)}`,
        ),
      );
    }
    if (err.code === "storage_limit" || err.code === "active_limit") {
      markRecordingUsageCapReached();
      void refreshRecordingUsage();
    }
    return { message: err.message, code: err.code, status: err.status };
  }
  const message = err instanceof Error ? err.message : String(err);
  logWarn(
    "recording",
    `${ctx.phase} failed (network): ${message}` +
      (ctx.slug ? ` [slug=${ctx.slug}]` : ""),
  );
  setRecordingConnectivity("offline");
  return {
    message: "No internet connection. Check your network and try again.",
  };
}
