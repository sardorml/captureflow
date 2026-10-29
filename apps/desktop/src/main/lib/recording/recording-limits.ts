import {
  hydrateRecordingLimits,
  resolveRecordingLimits,
  type RecordingLimits,
} from "@captureflow/engine";
import { loadDeviceId } from "../device-id";
import { RECORDING_API_BASE, recordingHeaders } from "./recording-api-client";

const LIMITS_TIMEOUT_MS = 5000;

let remembered: RecordingLimits | null = null;

/*
 * The caps the next recording starts under. An unreachable server falls
 * back to the last caps read, then to the free tier's, which the server
 * enforces at init anyway.
 */
export async function readRecordingLimits(): Promise<RecordingLimits> {
  let fetched: RecordingLimits | null = null;
  try {
    const res = await fetch(`${RECORDING_API_BASE}/usage`, {
      headers: recordingHeaders(await loadDeviceId()),
      signal: AbortSignal.timeout(LIMITS_TIMEOUT_MS),
    });
    if (res.ok) {
      const body = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (body) fetched = hydrateRecordingLimits(body);
    }
  } catch {
    /* see above */
  }
  if (fetched) remembered = fetched;
  return resolveRecordingLimits(fetched, remembered);
}
