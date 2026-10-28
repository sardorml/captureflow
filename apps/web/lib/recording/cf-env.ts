/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getInjectedEnv } from "@captureflow/selfhost/env-slot";
import type { TranscriptionJobMessage } from "./types";

export type CloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  AI?: Ai;
  TRANSCRIPTION_QUEUE?: Queue<TranscriptionJobMessage>;
  NEXT_PUBLIC_RECORDING_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  // Comma-separated device IDs that bypass per-device caps. Plaintext is fine: the device id is already long-random and is itself the /api/init auth token.
  DEV_DEVICE_IDS?: string;
  SELF_HOSTED?: string;
};

export async function getCloudflareEnv(): Promise<CloudflareBindings | null> {
  const injected = getInjectedEnv<CloudflareBindings>();
  if (injected) return injected;
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as CloudflareBindings;
  } catch {
    return null;
  }
}
