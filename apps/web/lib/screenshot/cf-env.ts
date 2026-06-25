/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ScreenshotCloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_SCREENSHOT_SITE_URL?: string;
  NEXT_PUBLIC_APP_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  DEV_DEVICE_IDS?: string;
};

export async function getCloudflareEnv(): Promise<ScreenshotCloudflareBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as ScreenshotCloudflareBindings;
  } catch {
    return null;
  }
}
