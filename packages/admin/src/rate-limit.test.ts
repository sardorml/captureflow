/// <reference types="@cloudflare/workers-types" />

import { describe, expect, it } from "vitest";
import {
  checkThrottle,
  clearThrottle,
  loginScopeKeys,
  recordFailure,
  throttleMessage,
} from "./rate-limit";

/*
 * An in-memory stand-in for the one table this module touches. It reimplements
 * the upsert's branches rather than the SQL text, so a test passing means the
 * intended policy holds — the statement itself is covered by the migration
 * running against real D1.
 */
type Row = { failures: number; firstFailureAt: number; lockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const LOCK_MS = 15 * 60 * 1000;

function fakeDb() {
  const rows = new Map<string, Row>();
  const apply = (key: string, now: number) => {
    const existing = rows.get(key);
    const restart = !existing || existing.firstFailureAt < now - WINDOW_MS;
    const failures = restart ? 1 : existing.failures + 1;
    rows.set(key, {
      failures,
      firstFailureAt: restart ? now : existing.firstFailureAt,
      lockedUntil:
        failures >= MAX_FAILURES ? now + LOCK_MS : (existing?.lockedUntil ?? 0),
    });
  };

  // D1's bind() returns a NEW statement rather than mutating the receiver, which
  // is what lets recordFailure reuse one prepared statement across every key.
  // A fake that mutated would quietly collapse the batch onto the last key.
  const make = (bound: unknown[]) => ({
    bind: (...args: unknown[]) => make(args),
    async first<T>() {
      const max = (bound as string[]).reduce(
        (acc, k) => Math.max(acc, rows.get(k)?.lockedUntil ?? 0),
        0,
      );
      return { locked_until: max } as T;
    },
    async run() {
      for (const key of bound as string[]) rows.delete(key);
      return {};
    },
    _bound: () => bound,
  });

  const db = {
    rows,
    prepare(_sql: string) {
      return make([]);
    },
    async batch(statements: { _bound: () => unknown[] }[]) {
      for (const s of statements) {
        const [key, now] = s._bound() as [string, number];
        apply(key, now);
      }
      return [];
    },
  };
  return db as unknown as D1Database & { rows: Map<string, Row> };
}

const KEYS = ["ip:203.0.113.7", "email:ops@example.com"];

describe("loginScopeKeys", () => {
  it("always scopes by address, and by account when there is one", () => {
    expect(loginScopeKeys("203.0.113.7", "ops@example.com")).toEqual(KEYS);
  });

  it("still throttles when the address is unknown", () => {
    expect(loginScopeKeys(null, null)).toEqual(["ip:unknown"]);
  });
});

describe("checkThrottle", () => {
  it("allows a caller with no history", async () => {
    expect(await checkThrottle(fakeDb(), KEYS)).toEqual({ allowed: true });
  });

  it("allows the attempt that reaches the limit, and refuses the next", async () => {
    const db = fakeDb();
    const now = 1_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) {
      expect((await checkThrottle(db, KEYS, now)).allowed).toBe(true);
      await recordFailure(db, KEYS, now);
    }
    const verdict = await checkThrottle(db, KEYS, now);
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) {
      expect(verdict.retryAfterSeconds).toBe(LOCK_MS / 1000);
    }
  });

  it("locks a shared address even when each attempt names a different account", async () => {
    const db = fakeDb();
    const now = 2_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) {
      await recordFailure(
        db,
        loginScopeKeys("203.0.113.7", `u${i}@x.com`),
        now,
      );
    }
    const verdict = await checkThrottle(
      db,
      loginScopeKeys("203.0.113.7", "fresh@x.com"),
      now,
    );
    expect(verdict.allowed).toBe(false);
  });

  it("locks a targeted account even when each attempt comes from a new address", async () => {
    const db = fakeDb();
    const now = 3_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) {
      await recordFailure(
        db,
        loginScopeKeys(`198.51.100.${i}`, "ops@x.com"),
        now,
      );
    }
    const verdict = await checkThrottle(
      db,
      loginScopeKeys("203.0.113.99", "ops@x.com"),
      now,
    );
    expect(verdict.allowed).toBe(false);
  });

  it("expires the lock once it has elapsed", async () => {
    const db = fakeDb();
    const now = 4_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) await recordFailure(db, KEYS, now);
    expect((await checkThrottle(db, KEYS, now)).allowed).toBe(false);
    expect((await checkThrottle(db, KEYS, now + LOCK_MS + 1)).allowed).toBe(
      true,
    );
  });

  it("restarts the window rather than accumulating slow attempts", async () => {
    const db = fakeDb();
    let now = 5_000_000;
    for (let i = 0; i < MAX_FAILURES * 2; i++) {
      await recordFailure(db, KEYS, now);
      now += WINDOW_MS + 1;
      expect((await checkThrottle(db, KEYS, now)).allowed).toBe(true);
    }
  });
});

describe("clearThrottle", () => {
  it("frees the keys, so a correct password undoes earlier typos", async () => {
    const db = fakeDb();
    const now = 6_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) await recordFailure(db, KEYS, now);
    expect((await checkThrottle(db, KEYS, now)).allowed).toBe(false);
    await clearThrottle(db, KEYS);
    expect((await checkThrottle(db, KEYS, now)).allowed).toBe(true);
  });
});

describe("throttleMessage", () => {
  it("rounds up, so it never says zero minutes", () => {
    expect(throttleMessage(1)).toBe(
      "Too many attempts. Try again in 1 minute.",
    );
    expect(throttleMessage(61)).toBe(
      "Too many attempts. Try again in 2 minutes.",
    );
  });
});
