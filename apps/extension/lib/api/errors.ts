import { RecordingApiHttpError } from "./client";

const FRIENDLY_BY_CODE: Record<string, string> = {
  active_limit:
    "Recording limit reached — delete old recordings or upgrade your plan.",
  storage_limit:
    "Storage is full — delete old recordings or upgrade your plan.",
  duration_exceeded: "This recording exceeds your plan's duration limit.",
  invalid_token: "Your sign-in expired. Sign in again to keep recording.",
  missing_token: "Sign in to record.",
};

export function isAuthFailure(err: unknown): boolean {
  return err instanceof RecordingApiHttpError && err.status === 401;
}

export function friendlyUploadError(err: unknown): string {
  if (err instanceof RecordingApiHttpError) {
    const friendly = err.code ? FRIENDLY_BY_CODE[err.code] : undefined;
    if (friendly) return friendly;
    return err.message;
  }
  if (err instanceof TypeError) {
    return "Upload failed — check your connection and try again.";
  }
  return err instanceof Error ? err.message : String(err);
}
