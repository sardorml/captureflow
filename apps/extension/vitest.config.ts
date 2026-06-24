import { defineConfig } from "vitest/config";

// Phase 0 tests are pure logic only (no WXT/browser APIs), so no WxtVitest
// plugin is needed. Scope the runner to tests/ to keep it independent of the
// extension build.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
