import { useEffect, useState } from "react";

export type MediaDeviceOption = {
  deviceId: string;
  label: string;
};

export type MediaDevices = {
  cameras: MediaDeviceOption[];
  mics: MediaDeviceOption[];
};

const EMPTY: MediaDevices = { cameras: [], mics: [] };

function toOption(
  device: MediaDeviceInfo,
  fallback: string,
): MediaDeviceOption {
  return {
    deviceId: device.deviceId,
    // Labels are empty until the extension origin holds a camera/mic grant.
    label: device.label || fallback,
  };
}

export function useMediaDevices(): MediaDevices {
  const [devices, setDevices] = useState<MediaDevices>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    const refresh = async (): Promise<void> => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setDevices({
          cameras: all
            .filter((d) => d.kind === "videoinput")
            .map((d) => toOption(d, "Camera")),
          mics: all
            .filter((d) => d.kind === "audioinput")
            .map((d) => toOption(d, "Microphone")),
        });
      } catch {
        if (!cancelled) setDevices(EMPTY);
      }
    };
    void refresh();
    navigator.mediaDevices.addEventListener("devicechange", refresh);
    // Labels appear the moment the combined grant lands, without a re-open.
    const watched: PermissionStatus[] = [];
    void (async () => {
      for (const name of ["camera", "microphone"]) {
        try {
          const perm = await navigator.permissions.query({
            name: name as PermissionName,
          });
          if (cancelled) return;
          perm.addEventListener("change", refresh);
          watched.push(perm);
        } catch {
          /* permission name unsupported */
        }
      }
    })();
    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener("devicechange", refresh);
      for (const perm of watched) perm.removeEventListener("change", refresh);
    };
  }, []);

  return devices;
}
