"use client";

import { useEffect, type RefObject } from "react";
import type { RecordingPlayerHandle } from "./RecordingPlayer";

// Anything the space bar already means something to: typing, pressing,
// scrubbing, or the player itself, which has its own hotkey.
const CLAIMS_SPACE =
  "input, textarea, select, button, a[href], summary, [contenteditable], [role=button], [role=slider], [role=menuitem], [role=option], [role=tab], [role=checkbox], [role=switch], [data-recording-player]";

// The space bar plays or pauses the recording from anywhere on the page, the
// way it does inside the player, so clicking away from it does not lose the
// shortcut.
export function useSpaceTogglesPlayback(
  playerRef: RefObject<RecordingPlayerHandle | null>,
): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code !== "Space" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && target !== document.body && target.closest(CLAIMS_SPACE)) {
        return;
      }
      e.preventDefault();
      playerRef.current?.togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playerRef]);
}
