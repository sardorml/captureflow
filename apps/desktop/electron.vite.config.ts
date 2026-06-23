import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
);

// The main process can't read `process.env` at runtime inside a packaged
// `.app`, so values are inlined from `.env*` into the bundle via Vite's `define`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isBeta = /-beta(\.|$)/.test(pkg.version);
  const define = {
    // Dev builds open the test-mode checkout, packaged builds the live one;
    // selecting at build time keeps the test URL out of production bundles.
    "process.env.LEMON_SQUEEZY_CHECKOUT_URL": JSON.stringify(
      mode === "development"
        ? (env.LEMON_SQUEEZY_TEST_CHECKOUT_URL ??
            process.env["LEMON_SQUEEZY_TEST_CHECKOUT_URL"] ??
            "")
        : (env.LEMON_SQUEEZY_CHECKOUT_URL ??
            process.env["LEMON_SQUEEZY_CHECKOUT_URL"] ??
            ""),
    ),
    "process.env.FORMIK_KEY": JSON.stringify(
      env.FORMIK_KEY ?? process.env["FORMIK_KEY"] ?? "",
    ),
    __IS_BETA__: JSON.stringify(isBeta),
    __APP_VERSION__: JSON.stringify(pkg.version),
    // PostHog project key is a write-only ingest key, safe to embed in the
    // client bundle. Empty when unconfigured keeps the analytics client dormant.
    __POSTHOG_KEY__: JSON.stringify(
      env.POSTHOG_KEY ?? process.env["POSTHOG_KEY"] ?? "",
    ),
    __POSTHOG_HOST__: JSON.stringify(
      env.POSTHOG_HOST ??
        process.env["POSTHOG_HOST"] ??
        "https://us.i.posthog.com",
    ),
  };

  /*
   * Consumers read these as `process.env.CAPTUREFLOW_X ?? 'https://...'`. In
   * production, only inline when set in the env — must NOT inline `''`, since
   * `'' ?? fallback` keeps the empty string and breaks the prod fallback.
   */
  const webBaseDevDefaults = {
    CAPTUREFLOW_SHARE_API_BASE: "http://localhost:3032/api/r",
    CAPTUREFLOW_SNAP_API_BASE: "http://localhost:3032/api/s",
    CAPTUREFLOW_APP_WEB_BASE: "http://localhost:3032",
    CAPTUREFLOW_APP_WEB_API_BASE: "http://localhost:3032",
  };
  for (const key of Object.keys(webBaseDevDefaults)) {
    const value =
      env[key] ??
      (mode === "development" ? webBaseDevDefaults[key] : undefined);
    if (value !== undefined) {
      define[`process.env.${key}`] = JSON.stringify(value);
    }
  }
  return {
    main: { define },
    preload: { define },
    renderer: {
      define,
      resolve: {
        alias: {
          "@renderer": resolve("src/renderer/src"),
          "@": resolve("src/renderer/src"),
        },
      },
      plugins: [react(), tailwindcss()],
    },
  };
});
