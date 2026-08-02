import { useEffect, useState } from "react";

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
    <div className="cf-meter" aria-hidden>
      <div
        className="cf-meter-fill"
        style={{ width: `${Math.round(level * 100)}%` }}
      />
    </div>
  );
}
