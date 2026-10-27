"use client";

import { useSyncExternalStore } from "react";

export type DevPref = "code-split-view" | "fake-checkout" | "file-sizes";

const listeners = new Set<() => void>();
const storageKey = (pref: DevPref) => `captureflow.dev.${pref}`;

function readDevPref(pref: DevPref) {
  try {
    return localStorage.getItem(storageKey(pref)) === "1";
  } catch {
    return false;
  }
}

export function setDevPref(pref: DevPref, on: boolean) {
  try {
    localStorage.setItem(storageKey(pref), on ? "1" : "0");
  } catch {
    // Private windows can refuse storage; the pref then lasts the page.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useDevPref(pref: DevPref) {
  return useSyncExternalStore(
    subscribe,
    () => readDevPref(pref),
    () => false,
  );
}
