import { useEffect, useCallback, useRef } from "react";
import { useRecordingStore } from "../stores/recording-store";

export function useSources(): { refresh: () => void } {
  const setSources = useRecordingStore((s) => s.setSources);
  const lastThumbRef = useRef("");
  const thumbCacheRef = useRef(new Map<string, string>());

  const refresh = useCallback(async () => {
    try {
      const sources = await window.electronAPI.getSources();
      // Sort screens first, then windows, stable by ID to prevent layout shifts
      sources.sort((a, b) => {
        const aScreen = a.displayId !== "" ? 0 : 1;
        const bScreen = b.displayId !== "" ? 0 : 1;
        if (aScreen !== bScreen) return aScreen - bScreen;
        return a.id.localeCompare(b.id);
      });
      // Preserve last valid thumbnail for each source
      for (const source of sources) {
        if (source.thumbnailDataUrl.length > 100) {
          thumbCacheRef.current.set(source.id, source.thumbnailDataUrl);
        } else {
          const cached = thumbCacheRef.current.get(source.id);
          if (cached) source.thumbnailDataUrl = cached;
        }
      }
      setSources(sources);

      const { selectedSource, setSelectedSource } =
        useRecordingStore.getState();
      if (selectedSource) {
        const updated = sources.find((s) => s.id === selectedSource.id);
        if (
          updated &&
          updated.thumbnailDataUrl &&
          updated.thumbnailDataUrl.length > 100 &&
          updated.thumbnailDataUrl !== lastThumbRef.current
        ) {
          lastThumbRef.current = updated.thumbnailDataUrl;
          /*
           * Preserve fields set by the SelectionOverlay (ownerName,
           * windowBounds, cornerRadius, pid) — desktopCapturer's refreshed
           * sources do not include them, so a plain overwrite would erase
           * the app name, the alpha-detected window radius (used for the
           * dim cutout + editor panel rounding), and the pid (used to
           * raise the captured app at recording start).
           */
          setSelectedSource({
            ...updated,
            ownerName: selectedSource.ownerName ?? updated.ownerName,
            windowBounds: selectedSource.windowBounds ?? updated.windowBounds,
            cornerRadius: selectedSource.cornerRadius ?? updated.cornerRadius,
            pid: selectedSource.pid ?? updated.pid,
          });
        }
      }
    } catch (error) {
      console.error("Failed to get sources:", error);
    }
  }, [setSources]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { refresh };
}
