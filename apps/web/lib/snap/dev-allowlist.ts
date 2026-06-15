import { getCloudflareEnv } from './cf-env';

// True for device IDs listed in env.DEV_DEVICE_IDS — used by
// /api/upload to bypass the quota cap so the developer's own device
// can iterate against the deployed worker. Mirrors the share
// dev-allowlist; same env var value can be reused.
export async function isDevDevice(deviceId: string): Promise<boolean> {
  const env = await getCloudflareEnv();
  if (!env?.DEV_DEVICE_IDS) return false;
  return env.DEV_DEVICE_IDS.split(',')
    .map((s) => s.trim())
    .includes(deviceId);
}
