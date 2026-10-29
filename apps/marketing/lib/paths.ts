import path from "node:path";

// The app, the dev server and `pnpm make` all run from apps/marketing.
export const APP_ROOT = process.cwd();
export const HYPERFRAMES_DIR = path.join(APP_ROOT, "hyperframes");
export const LIBRARY_DIR = path.join(APP_ROOT, "library");
export const HYPERFRAMES_BIN = path.join(
  APP_ROOT,
  "node_modules",
  ".bin",
  "hyperframes",
);
export const STUDIO_PORT = 3037;
