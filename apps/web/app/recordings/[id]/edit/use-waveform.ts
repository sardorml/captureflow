"use client";

import { useEffect, useState } from "react";
import { WAVEFORM_BUCKETS, waveformBuckets } from "@/lib/recording/waveform";

// Decoded PCM for a long recording runs to hundreds of MB; past this the
// lane stays empty.
const MAX_WAVEFORM_SECONDS = 20 * 60;
// Lets the player and the filmstrip get going before a third fetch starts.
const START_DELAY_MS = 2500;

// The recording's audio as bucketed peaks for the timeline's audio lane.
// Null until decoded, or when the audio can't be fetched or decoded.
export function useWaveform(
  videoUrl: string,
  durationMs: number | null,
): Float32Array | null {
  const [buckets, setBuckets] = useState<Float32Array | null>(null);

  useEffect(() => {
    if (durationMs !== null && durationMs > MAX_WAVEFORM_SECONDS * 1000) return;
    if (typeof OfflineAudioContext !== "function") return;
    let cancelled = false;
    const controller = new AbortController();

    const decode = async (): Promise<void> => {
      const res = await fetch(videoUrl, { signal: controller.signal });
      if (!res.ok) return;
      const bytes = await res.arrayBuffer();
      if (cancelled) return;
      const ctx = new OfflineAudioContext(1, 1, 44_100);
      const audio = await ctx.decodeAudioData(bytes);
      if (cancelled) return;
      const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>
        audio.getChannelData(i),
      );
      setBuckets(waveformBuckets(channels, WAVEFORM_BUCKETS));
    };

    const timer = window.setTimeout(() => {
      decode().catch(() => {});
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
      setBuckets(null);
    };
  }, [videoUrl, durationMs]);

  return buckets;
}
