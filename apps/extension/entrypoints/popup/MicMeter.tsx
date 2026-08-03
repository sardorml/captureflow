import { useEffect, useState } from "react";
import { Meter } from "@heroui/react";

/*
 * Live input level under the mic row. Only attaches when the extension origin
 * already holds a mic grant — getUserMedia can't prompt from a popup, so an
 * ungranted mic renders nothing rather than a dead meter.
 */
export function MicMeter({ enabled }: { enabled: boolean }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    void (async () => {
      try {
        const perm = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (perm.state !== "granted") return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        const samples = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          analyser.getByteTimeDomainData(samples);
          let peak = 0;
          for (const sample of samples) {
            peak = Math.max(peak, Math.abs(sample - 128));
          }
          setLevel(Math.min(1, peak / 56));
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        /* no meter — the mic still records */
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      for (const track of stream?.getTracks() ?? []) track.stop();
      void audioContext?.close().catch(() => {});
      setLevel(0);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <Meter
      value={level}
      minValue={0}
      maxValue={1}
      size="sm"
      aria-label="Microphone input level"
      /* Pinned along the row's bottom edge; the row clips it to the rounding. */
      className="pointer-events-none absolute inset-x-0 bottom-0"
    >
      <Meter.Track className="rounded-none bg-transparent">
        <Meter.Fill className="transition-[width] duration-75 ease-linear" />
      </Meter.Track>
    </Meter>
  );
}
