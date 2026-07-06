import { join } from "path";
import { app } from "electron";

type EngineBinary = "screen-recorder" | "window-detector";

/*
 * Packaged builds ship the sidecars via electron-builder extraResources;
 * dev resolves them through the workspace symlink to packages/engine. The
 * engine has no non-macOS sidecars by design — other platforms record via
 * its stream-recorder path instead.
 */
export function engineBinaryPath(name: EngineBinary): string {
  if (process.platform !== "darwin") {
    throw new Error(`no native ${name} sidecar on ${process.platform}`);
  }
  const base = app.isPackaged
    ? join(process.resourcesPath, "native", name, "bin")
    : join(
        __dirname,
        "../../node_modules/@captureflow/engine/native/mac",
        name,
        "bin",
      );
  return join(base, name);
}
