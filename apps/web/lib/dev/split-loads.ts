/*
 * Records when each code-split section (a streamed Suspense boundary or a
 * dynamic() chunk) arrived, for the developer panel's code-split view. A
 * streamed section stamps itself with an inline script the moment its HTML
 * is parsed, which is long before hydration; a client-rendered one reports
 * from an effect, after draining the stamps so the earlier time wins.
 */

export type SplitLoad = { name: string; at: number };

export type SplitLoads = { navAt: number; loads: SplitLoad[] };

declare global {
  interface Window {
    __splitStamps?: [string, number][];
  }
}

const EMPTY: SplitLoads = { navAt: 0, loads: [] };
const listeners = new Set<() => void>();
let snapshot: SplitLoads = EMPTY;

function emit() {
  for (const listener of listeners) listener();
}

export function splitStamp(name: string): string {
  return `(self.__splitStamps??=[]).push([${JSON.stringify(name)},performance.now()])`;
}

export function drainSplitStamps() {
  const stamps =
    typeof window === "undefined" ? undefined : window.__splitStamps;
  if (!stamps?.length) return;
  for (const [name, at] of stamps.splice(0)) reportSplitLoad(name, at);
}

// The earliest report since the last navigation wins; hydration re-reports
// what the stream already stamped.
export function reportSplitLoad(name: string, at = performance.now()) {
  const { navAt, loads } = snapshot;
  const current = loads.find((load) => load.name === name);
  if (current && current.at >= navAt && current.at <= at) return;
  snapshot = {
    navAt,
    loads: [...loads.filter((load) => load.name !== name), { name, at }],
  };
  emit();
}

export function markNavigation(at: number) {
  snapshot = { ...snapshot, navAt: at };
  emit();
}

export function subscribeSplitLoads(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSplitLoads(): SplitLoads {
  return snapshot;
}

export function getServerSplitLoads(): SplitLoads {
  return EMPTY;
}

export function formatSplitTime(at: number, navAt: number) {
  if (at < navAt) return "kept from the previous page";
  return `+${((at - navAt) / 1000).toFixed(2)} s`;
}
