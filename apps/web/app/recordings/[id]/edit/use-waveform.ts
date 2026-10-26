"use client";

import { useEffect, useState } from "react";
import {
  WAVEFORM_BUCKETS,
  mergePeaks,
  normalisePeaks,
  peakBuckets,
} from "@/lib/recording/waveform";

// Decoded PCM for a long recording runs to hundreds of MB; past this the
// lane stays empty.
const MAX_WAVEFORM_SECONDS = 20 * 60;
// The audio comes out of a second download of the files, since the player's
// range requests never fill the cache for it; past this size the lane stays
// empty rather than doubling the page's bytes.
const MAX_WAVEFORM_BYTES = 64 * 1024 * 1024;

// The recording's audio as bucketed peaks for the timeline's audio lane: the
// screen file carries system audio and the camera file the mic, so both are
// decoded and the louder wins in each bucket. A file without an audio track
// fails to decode and is skipped. Null until decoded, or when nothing could
// be. The caller passes null until the player is ready, so the downloads
// never compete with the first frames.
export function useWaveform(
  sources: readonly string[] | null,
  durationMs: number | null,
  sizeBytes: number,
): Float32Array | null {
  const [buckets, setBuckets] = useState<Float32Array | null>(null);

  useEffect(() => {
    if (sources === null || sources.length === 0) return;
    if (durationMs !== null && durationMs > MAX_WAVEFORM_SECONDS * 1000) return;
    if (sizeBytes > MAX_WAVEFORM_BYTES) return;
    if (typeof OfflineAudioContext !== "function") return;
    let cancelled = false;
    const controller = new AbortController();

    const peaksOf = async (url: string): Promise<Float32Array | null> => {
      const res = await fetch(url, {
        signal: controller.signal,
        priority: "low",
      });
      if (!res.ok) return null;
      const bytes = await res.arrayBuffer();
      if (cancelled) return null;
      const ctx = new OfflineAudioContext(1, 1, 44_100);
      const audio = await ctx.decodeAudioData(bytes);
      const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>
        audio.getChannelData(i),
      );
      return peakBuckets(channels, WAVEFORM_BUCKETS);
    };

    const decode = async (): Promise<void> => {
      const settled = await Promise.allSettled(sources.map(peaksOf));
      if (cancelled) return;
      const tracks = settled.flatMap((r) =>
        r.status === "fulfilled" && r.value ? [r.value] : [],
      );
      if (tracks.length === 0) return;
      setBuckets(normalisePeaks(mergePeaks(tracks)));
    };

    decode().catch(() => {});

    return () => {
      cancelled = true;
      controller.abort();
      setBuckets(null);
    };
  }, [sources, durationMs, sizeBytes]);

  return buckets;
}
