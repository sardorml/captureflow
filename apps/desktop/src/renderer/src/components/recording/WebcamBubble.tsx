import { useEffect, useRef, useState } from "react";

export function WebcamBubble(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  useEffect(() => {
    return window.electronAPI.onWebcamBubbleInit((id: string) => {
      setDeviceId(id);
    });
  }, []);

  // Clearing deviceId trips the acquisition cleanup, stopping the stream and
  // turning the camera LED off even though the component stays mounted.
  useEffect(() => {
    return window.electronAPI.onWebcamBubbleRelease(() => {
      setDeviceId(null);
    });
  }, []);

  // Reset only on an actual device change: a re-show with the same id keeps the
  // stream live, `onPlaying` won't refire, and the overlay would stick.
  const [prevDeviceId, setPrevDeviceId] = useState(deviceId);
  if (prevDeviceId !== deviceId) {
    setPrevDeviceId(deviceId);
    setIsReady(false);
  }

  useEffect(() => {
    if (!deviceId) return;
    let active = true;
    let mediaStream: MediaStream | null = null;

    // The bubble is the highest-res consumer, so it opens the shared session at
    // 1080p; the 720p recording companion downscales instead of renegotiating.
    const acquire = async (): Promise<MediaStream> => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { min: 1280, ideal: 1920 },
            height: { min: 720, ideal: 1080 },
            frameRate: { ideal: 30 },
          },
        });
      } catch {
        // Fallback for cameras that can't satisfy the 1280×720 floor.
        return navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
        });
      }
    };
    acquire()
      .then((s) => {
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      mediaStream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [deviceId]);

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={
        { WebkitAppRegion: "drag", borderRadius: "50%" } as React.CSSProperties
      }
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)", aspectRatio: "1 / 1" }}
        muted
        playsInline
        onPlaying={() => setIsReady(true)}
      />
      {!isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/85 text-white/60 text-[10px] uppercase select-none"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.22em" }}
          aria-live="polite"
        >
          Loading…
        </div>
      )}
    </div>
  );
}
