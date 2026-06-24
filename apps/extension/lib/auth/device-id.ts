// A per-install device identifier sent as `x-captureflow-device` on every share
// request. The API requires 8–64 chars; a prefixed UUID (40 chars) fits and is
// collision-free. Owned by the service worker, so reads can't race.

const deviceIdItem = storage.defineItem<string | null>("local:deviceId", {
  fallback: null,
});

export function newDeviceId(): string {
  return `cfx-${crypto.randomUUID()}`;
}

export async function getDeviceId(): Promise<string> {
  const existing = await deviceIdItem.getValue();
  if (existing) return existing;
  const id = newDeviceId();
  await deviceIdItem.setValue(id);
  return id;
}
