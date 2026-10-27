#!/usr/bin/env node
/*
 * Post-deploy smoke test: the pages every visitor hits, the signed-out
 * dashboard redirect, and the health check that reads the core tables.
 * Retries for a minute while the new version propagates; exits non-zero so
 * the deploy job rolls the worker back.
 *
 *   node scripts/smoke.mjs https://captureflow.dev
 */

const CHECKS = [
  { path: "/", status: 200 },
  { path: "/login", status: 200 },
  { path: "/pricing", status: 200 },
  { path: "/recordings", status: 307 },
  { path: "/api/health", status: 200, json: (body) => body?.ok === true },
];

const ATTEMPTS = 6;
const WAIT_MS = 10_000;

async function check(base, { path, status, json }) {
  const url = `${base}${path}?smoke=${Date.now()}`;
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== status)
    return `${path}: ${res.status}, expected ${status}`;
  if (json && !json(await res.json().catch(() => null))) {
    return `${path}: unexpected body`;
  }
  return null;
}

async function main() {
  const base = (process.argv[2] ?? "").replace(/\/$/, "");
  if (!base) {
    console.error("usage: node scripts/smoke.mjs <base-url>");
    process.exit(2);
  }
  let failures = [];
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const results = await Promise.all(
      CHECKS.map((c) => check(base, c).catch((e) => `${c.path}: ${e.message}`)),
    );
    failures = results.filter(Boolean);
    if (!failures.length) {
      console.log(`smoke: ${CHECKS.length} checks passed on ${base}`);
      return;
    }
    console.warn(
      `smoke attempt ${attempt}/${ATTEMPTS}:\n  ${failures.join("\n  ")}`,
    );
    if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, WAIT_MS));
  }
  console.error("smoke: failed");
  process.exit(1);
}

main();
