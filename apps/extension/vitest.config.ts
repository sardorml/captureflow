import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

// WxtVitest wires the WXT auto-imports (storage, etc.) to an in-memory
// fakeBrowser, so storage-backed modules are testable. Pure-logic tests run
// fine under it too. Scoped to tests/ to stay independent of the build.
export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
