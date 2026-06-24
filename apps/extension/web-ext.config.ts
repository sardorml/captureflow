import { defineWebExtConfig } from "wxt";

// Don't auto-launch a browser on `pnpm extension`. We load the unpacked dev
// build (.output/chrome-mv3-dev) manually — e.g. into Brave — while the dev
// server runs. Keeps the dev command portable (no per-machine browser path) and
// avoids spawning a stray Chromium window.
export default defineWebExtConfig({
  disabled: true,
});
