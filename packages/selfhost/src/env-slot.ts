/*
 * The one piece the Next bundles import: a process-wide slot the Docker
 * server entry fills before Next boots. On Cloudflare it stays empty, so
 * every cf-env wrapper falls through to getCloudflareContext unchanged.
 */
const SLOT = Symbol.for("captureflow.selfhost.env");

type Slotted = { [SLOT]?: object };

export function setInjectedEnv(env: object): void {
  (globalThis as Slotted)[SLOT] = env;
}

export function getInjectedEnv<T>(): T | null {
  return ((globalThis as Slotted)[SLOT] as T | undefined) ?? null;
}
