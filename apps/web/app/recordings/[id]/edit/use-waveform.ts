"use client";

import { useEffect, useState } from "react";
import {
  hydratePeaks,
  mergePeaks,
  normalisePeaks,
  peakBuckets,
  WAVEFORM_BUCKETS,
} from "@/lib/recording/waveform";

// Decoded PCM for a long recording runs to hundreds of MB, and the browser has
// to download the whole file for it.
const MAX_DECODE_SECONDS = 20 * 60;
const MAX_DECODE_BYTES = 64 * 1024 * 1024;
const FLAT_LINE = new Float32Array(WAVEFORM_BUCKETS);

export type WaveformTrack = { peaksUrl: string; audioUrl: string };

// The recording's audio as bucketed peaks for the timeline's audio lane: the
// screen file carries system audio and the camera file the mic, and the louder
// wins in each bucket. The server saves each file's peaks the first time it's
// asked; when it can't read the file, the browser does and saves the result.
// Null only while loading: anything that can't be read comes back as a flat
// line.
export function useWaveform(
  tracks: readonly WaveformTrack[],
  durationMs: number | null,
  sizeBytes: number,
): Float32Array | null {
  const [buckets, setBuckets] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const canDecode =
      (durationMs === null || durationMs <= MAX_DECODE_SECONDS * 1000) &&
      sizeBytes <= MAX_DECODE_BYTES &&
      typeof OfflineAudioContext === "function";

    // A file without an audio track fails to decode and is skipped, and isn't
    // saved: another browser may have the codec this one lacks.
    const decodePeaks = async (
      track: WaveformTrack,
    ): Promise<Float32Array | null> => {
      if (!canDecode) return null;
      const res = await fetch(track.audioUrl, {
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
      const peaks = peakBuckets(channels, WAVEFORM_BUCKETS);
      void fetch(track.peaksUrl, { method: "PUT", body: peaks }).catch(
        () => {},
      );
      return peaks;
    };

    const peaksOf = async (
      track: WaveformTrack,
    ): Promise<Float32Array | null> => {
      const res = await fetch(track.peaksUrl, { signal: controller.signal });
      const saved = res.ok ? hydratePeaks(await res.arrayBuffer()) : null;
      return saved ?? decodePeaks(track);
    };

    const load = async (): Promise<void> => {
      const settled = await Promise.allSettled(tracks.map(peaksOf));
      if (cancelled) return;
      const read = settled.flatMap((r) =>
        r.status === "fulfilled" && r.value ? [r.value] : [],
      );
      if (read.length === 0) {
        console.warn("No audio could be read for the waveform", settled);
        setBuckets(FLAT_LINE);
        return;
      }
      setBuckets(normalisePeaks(mergePeaks(read)));
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
      setBuckets(null);
    };
  }, [tracks, durationMs, sizeBytes]);

  return buckets;
}
