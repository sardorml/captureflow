import { getCloudflareEnv } from './cf-env';

// True for device IDs listed in env.DEV_DEVICE_IDS — used by /api/init
// to bypass per-device caps so the developer's own device can iterate
// against the deployed worker without burning through the active-share
// or storage caps. Set the env var on Wrangler to your local device id
// (see ~/Library/Application Support/CaptureFlow/device-id.txt).
export async function isDevDevice(deviceId: string): Promise<boolean> {
  const env = await getCloudflareEnv();
  if (!env?.DEV_DEVICE_IDS) return false;
  return env.DEV_DEVICE_IDS.split(',')
    .map((s) => s.trim())
    .includes(deviceId);
}
