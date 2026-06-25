"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecordingConfig } from "@/lib/recording-config";
import { saveRecordingConfigAction } from "@/app/actions";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_DEBOUNCE_MS = 700;
// Cap the undo stack so a long editing session can't grow it unbounded.
const MAX_HISTORY = 50;

type History = { stack: RecordingConfig[]; pointer: number };

export type EditorConfig = {
  config: RecordingConfig;
  update: (patch: Partial<RecordingConfig>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus;
  error: string | null;
  flushNow: () => Promise<{ error: string | null }>;
};

export function useEditorConfig(
  slug: string,
  initialConfig: RecordingConfig,
): EditorConfig {
  const [history, setHistory] = useState<History>({
    stack: [initialConfig],
    pointer: 0,
  });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const config = history.stack[history.pointer];

  const timerRef = useRef<number | null>(null);
  // The newest config awaiting persistence (null once it's on disk).
  const pendingRef = useRef<RecordingConfig | null>(null);
  // What's actually persisted, so a no-op edit/undo doesn't write identical bytes.
  const lastSavedRef = useRef<RecordingConfig>(initialConfig);
  // Serializes saves: every enqueued save chains after the previous one, so two
  // PUTs to the same sidecar key can never be in flight and reorder.
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueSave = useCallback((): Promise<{ error: string | null }> => {
    const run = chainRef.current.then(async () => {
      const next = pendingRef.current;
      if (!next || shallowEqualConfig(next, lastSavedRef.current)) {
        pendingRef.current = null;
        return;
      }
      setStatus("saving");
      setError(null);
      const res = await saveRecordingConfigAction(slug, next);
      if (res.error) {
        // Keep `next` pending so the next flush/edit retries it.
        setStatus("error");
        setError(res.error);
        throw new Error(res.error);
      }
      lastSavedRef.current = next;
      if (pendingRef.current === next) pendingRef.current = null;
      setStatus("saved");
    });
    chainRef.current = run.catch(() => {});
    return run.then(
      () => ({ error: null }),
      (e) => ({ error: e instanceof Error ? e.message : "Could not save" }),
    );
  }, [slug]);

  const scheduleSave = useCallback(
    (next: RecordingConfig) => {
      pendingRef.current = next;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void enqueueSave();
      }, SAVE_DEBOUNCE_MS);
    },
    [enqueueSave],
  );

  // Persist on any config change — edit, undo, or redo — but skip writes whose
  // bytes already match disk (initial mount, undo back to the saved state, and
  // React strict-mode's dev double-invoke all land here).
  useEffect(() => {
    if (shallowEqualConfig(config, lastSavedRef.current)) return;
    scheduleSave(config);
  }, [config, scheduleSave]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const update = useCallback((patch: Partial<RecordingConfig>) => {
    setHistory((h) => {
      const base = h.stack[h.pointer];
      const next = { ...base, ...patch };
      if (shallowEqualConfig(base, next)) return h;
      const stack = h.stack.slice(0, h.pointer + 1);
      stack.push(next);
      const capped =
        stack.length > MAX_HISTORY
          ? stack.slice(stack.length - MAX_HISTORY)
          : stack;
      return { stack: capped, pointer: capped.length - 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => (h.pointer > 0 ? { ...h, pointer: h.pointer - 1 } : h));
  }, []);

  const redo = useCallback(() => {
    setHistory((h) =>
      h.pointer < h.stack.length - 1 ? { ...h, pointer: h.pointer + 1 } : h,
    );
  }, []);

  // Run any debounced save immediately and report whether it landed; Finish
  // awaits this and stays on the page if it failed.
  const flushNow = useCallback(async (): Promise<{ error: string | null }> => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return enqueueSave();
  }, [enqueueSave]);

  return {
    config,
    update,
    undo,
    redo,
    canUndo: history.pointer > 0,
    canRedo: history.pointer < history.stack.length - 1,
    status,
    error,
    flushNow,
  };
}

function shallowEqualConfig(a: RecordingConfig, b: RecordingConfig): boolean {
  return (
    a.background === b.background &&
    a.cameraCorner === b.cameraCorner &&
    a.cameraSize === b.cameraSize &&
    a.micMuted === b.micMuted &&
    a.systemMuted === b.systemMuted
  );
}
