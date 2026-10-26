const IDLE_FALLBACK_MS = 1500;

// Runs once the browser is idle, so background work never competes with the
// page's own; returns a cancel for effects that unmount first.
export function whenIdle(fn: () => void): () => void {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(fn, { timeout: IDLE_FALLBACK_MS });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(fn, IDLE_FALLBACK_MS);
  return () => clearTimeout(id);
}
