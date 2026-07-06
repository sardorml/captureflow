import { createWindowDetector } from "@captureflow/engine/main";
import { engineBinaryPath } from "./lib/engine-paths";
import type { WindowAtPoint } from "../shared/types";

const detector = createWindowDetector({
  binaryPath: () => engineBinaryPath("window-detector"),
});

export function warmWindowDetector(): void {
  detector.warm();
}

export function getWindowAtPoint(
  x: number,
  y: number,
  excludePid?: number,
): Promise<WindowAtPoint> {
  return detector.getWindowAtPoint(x, y, excludePid);
}

export function focusAppByPid(pid: number): Promise<boolean> {
  return detector.focusAppByPid(pid);
}

export function focusTopmostApp(excludePid?: number): Promise<boolean> {
  return detector.focusTopmostApp(excludePid);
}
