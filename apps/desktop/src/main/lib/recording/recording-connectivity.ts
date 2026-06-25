import { EventEmitter } from "events";
import type { RecordingConnectivityState } from "../../../shared/types";
import { logInfo } from "../logger";

let current: RecordingConnectivityState = "online";
const events = new EventEmitter();

export function getRecordingConnectivity(): RecordingConnectivityState {
  return current;
}

export function setRecordingConnectivity(
  next: RecordingConnectivityState,
): void {
  if (current === next) return;
  const prev = current;
  current = next;
  logInfo("recording-connectivity", `${prev} → ${next}`);
  events.emit("change", next);
}

export function onRecordingConnectivityChange(
  fn: (state: RecordingConnectivityState) => void,
): () => void {
  events.on("change", fn);
  return () => {
    events.off("change", fn);
  };
}
