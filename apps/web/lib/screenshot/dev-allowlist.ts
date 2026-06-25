import { getCloudflareEnv } from "./cf-env";

export async function isDevDevice(deviceId: string): Promise<boolean> {
  const env = await getCloudflareEnv();
  if (!env?.DEV_DEVICE_IDS) return false;
  return env.DEV_DEVICE_IDS.split(",")
    .map((s) => s.trim())
    .includes(deviceId);
}
