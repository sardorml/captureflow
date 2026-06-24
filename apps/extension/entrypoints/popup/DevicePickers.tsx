import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getCameraBlocked,
  getCapturePrefs,
  setCapturePrefs,
  watchCameraBlocked,
  watchCapturePrefs,
  type CapturePrefs,
} from "@/lib/storage";

export function DevicePickers() {
  const [prefs, setPrefs] = useState<CapturePrefs>({
    camera: false,
    mic: false,
  });
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    void getCapturePrefs().then(setPrefs);
    void getCameraBlocked().then(setBlocked);
    const unwatchPrefs = watchCapturePrefs(setPrefs);
    const unwatchBlocked = watchCameraBlocked(setBlocked);
    return () => {
      unwatchPrefs();
      unwatchBlocked();
    };
  }, []);

  // Mic rides the camera stream (Decision 4), so camera-off clears it. The bubble
  // both previews and seeds the grant, so reflect the new state on the active tab.
  const update = async (partial: Partial<CapturePrefs>) => {
    const next = { ...prefs, ...partial };
    if (!next.camera) next.mic = false;
    setPrefs(next);
    await setCapturePrefs(next);
    void sendMessage("setCameraBubble", { on: next.camera, mic: next.mic });
  };

  if (blocked) {
    return (
      <section className="cf-section cf-pickers">
        <div className="cf-picker">
          <span className="cf-picker-icon" aria-hidden>
            ◎
          </span>
          <select className="cf-select" value="none" disabled>
            <option value="none">No camera</option>
          </select>
        </div>
        <div className="cf-notice">
          <p className="cf-notice-title">Camera blocked</p>
          <p className="cf-hint">
            Allow the camera for this extension in your browser&rsquo;s camera
            settings, then try again.
          </p>
          <button
            type="button"
            className="cf-try"
            onClick={() => void update({ camera: true })}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

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
      {prefs.camera && (
        <p className="cf-hint">
          Your camera bubble appears on normal web pages — not on internal
          browser pages like this one.
        </p>
      )}
    </section>
  );
}
