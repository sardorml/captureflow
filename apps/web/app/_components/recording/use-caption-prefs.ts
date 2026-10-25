"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CAPTION_PREFS_STORAGE_KEY,
  DEFAULT_CAPTION_PREFS,
  parseCaptionPrefs,
  type CaptionPrefs,
} from "@/lib/recording/caption-prefs";

function readPrefs(): CaptionPrefs {
  try {
    return parseCaptionPrefs(localStorage.getItem(CAPTION_PREFS_STORAGE_KEY));
  } catch {
    return DEFAULT_CAPTION_PREFS;
  }
}

// The watcher's caption look, shared by every player in this browser; the
// first paint uses the defaults so the server and client agree.
export function useCaptionPrefs(): [
  CaptionPrefs,
  (patch: Partial<CaptionPrefs>) => void,
] {
  const [prefs, setPrefs] = useState<CaptionPrefs>(DEFAULT_CAPTION_PREFS);

  useEffect(() => {
    setPrefs(readPrefs());
    const onStorage = (e: StorageEvent): void => {
      if (e.key === CAPTION_PREFS_STORAGE_KEY) setPrefs(readPrefs());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((patch: Partial<CaptionPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(CAPTION_PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode or a full store: the choice still holds for this page.
      }
      return next;
    });
  }, []);

  return [prefs, update];
}
