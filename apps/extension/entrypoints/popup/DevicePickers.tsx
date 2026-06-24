import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getCapturePrefs,
  setCapturePrefs,
  type CapturePrefs,
} from "@/lib/storage";

async function isGranted(name: "camera" | "microphone"): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({
      name: name as PermissionName,
    });
    return status.state === "granted";
  } catch {
    // The query isn't supported for this name — assume not granted and let the
    // grant flow (a no-op if already allowed) sort it out.
    return false;
  }
}

export function DevicePickers() {
  const [prefs, setPrefs] = useState<CapturePrefs>({
    camera: false,
    mic: false,
  });

  useEffect(() => {
    void getCapturePrefs().then(setPrefs);
  }, []);

  // Mic rides with the camera stream (Decision 4), so it's only meaningful with
  // a camera; turning the camera off clears it.
  const update = async (partial: Partial<CapturePrefs>) => {
    const next = { ...prefs, ...partial };
    if (!next.camera) next.mic = false;
    setPrefs(next);
    await setCapturePrefs(next);

    const needCamera = next.camera && !(await isGranted("camera"));
    const needMic = next.mic && !(await isGranted("microphone"));
    if (needCamera || needMic) {
      void sendMessage("requestMediaPermission", {
        camera: next.camera,
        mic: next.mic,
      });
    }
  };

  return (
    <section className="cf-section cf-pickers">
      <div className="cf-picker">
        <span className="cf-picker-icon" aria-hidden>
          ◎
        </span>
        <select
          className="cf-select"
          value={prefs.camera ? "on" : "none"}
          onChange={(event) => update({ camera: event.target.value === "on" })}
        >
          <option value="none">No camera</option>
          <option value="on">Camera on</option>
        </select>
      </div>
      <div className="cf-picker">
        <span className="cf-picker-icon" aria-hidden>
          ⏺
        </span>
        <select
          className="cf-select"
          value={prefs.mic ? "on" : "none"}
          disabled={!prefs.camera}
          onChange={(event) => update({ mic: event.target.value === "on" })}
        >
          <option value="none">No microphone</option>
          <option value="on">Microphone on</option>
        </select>
      </div>
    </section>
  );
}
