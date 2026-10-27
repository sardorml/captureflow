import { readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { switchWorkspacePlan } from "./plan-switch";
import { seatVariant, variantIdFor } from "./variants";

// Minimal D1 over node:sqlite, the same shim the workspace tests use.
function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
    run: async () => {
      const r = sqlite.prepare(sql).run(...params);
      return { meta: { changes: Number(r.changes) } };
    },
  });
  return { prepare } as unknown as D1Database;
}

const SNAPSHOT = readFileSync(
  new URL("../../db/schema.snapshot.sql", import.meta.url),
  "utf8",
);
const SUBSCRIPTION_TABLE =
  /CREATE TABLE workspace_subscription \([\s\S]*?\) STRICT;/.exec(SNAPSHOT)![0];

const VARIANTS = {
  LEMON_LIGHT_MONTHLY_VARIANT_ID: "11",
  LEMON_LIGHT_ANNUAL_VARIANT_ID: "12",
  LEMON_PRO_MONTHLY_VARIANT_ID: "21",
  LEMON_PRO_ANNUAL_VARIANT_ID: "22",
};

let sqlite: DatabaseSync;
let db: D1Database;

function insertSubscription(id: string, patch: Record<string, unknown> = {}) {
  const row = {
    ls_subscription_id: id,
    workspace_id: "w",
    ls_variant_id: "12",
    ls_customer_email: "owner@x.io",
    status: "active",
    plan: "light",
    cycle: "annual",
    quantity: 3,
    current_period_end: Math.floor(Date.now() / 1000) + 86_400,
    cancelled_at: null,
    created_at: 1,
    updated_at: 1,
    ...patch,
  };
  const cols = Object.keys(row);
  sqlite
    .prepare(
      `INSERT INTO workspace_subscription (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    )
    .run(...(Object.values(row) as SQLInputValue[]));
}

function planOf(id: string) {
  return sqlite
    .prepare(
      `SELECT plan, ls_variant_id FROM workspace_subscription WHERE ls_subscription_id = ?`,
    )
    .get(id);
}

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE workspace (id TEXT PRIMARY KEY);
    INSERT INTO workspace (id) VALUES ('w');`);
  sqlite.exec(SUBSCRIPTION_TABLE);
  db = d1(sqlite);
});

afterEach(() => vi.unstubAllGlobals());

describe("variants", () => {
  it("maps both ways between variant ids and plans", () => {
    expect(seatVariant(VARIANTS, "22")).toEqual({
      plan: "pro",
      cycle: "annual",
    });
    expect(variantIdFor(VARIANTS, { plan: "pro", cycle: "monthly" })).toBe(
      "21",
    );
    expect(variantIdFor({}, { plan: "pro", cycle: "monthly" })).toBeNull();
  });
});

describe("switchWorkspacePlan", () => {
  it("moves a Light subscription to Pro's variant for the same cycle", async () => {
    insertSubscription("9");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await switchWorkspacePlan(
      { DB: db, LEMON_API_KEY: "k", ...VARIANTS },
      { workspaceId: "w", plan: "pro" },
    );

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toMatch(/\/subscriptions\/9$/);
    expect(JSON.parse(String(init.body)).data.attributes).toEqual({
      variant_id: 22,
      invoice_immediately: false,
    });
    expect(planOf("9")).toEqual({ plan: "pro", ls_variant_id: "22" });
  });

  it("leaves the plan alone when billing refuses", async () => {
    insertSubscription("9");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 422 })),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await switchWorkspacePlan(
      { DB: db, LEMON_API_KEY: "k", ...VARIANTS },
      { workspaceId: "w", plan: "pro" },
    );

    expect(result.ok).toBe(false);
    expect(planOf("9")).toEqual({ plan: "light", ls_variant_id: "12" });
  });

  it("refuses a cancelled subscription and switches fake checkouts locally", async () => {
    insertSubscription("9", { cancelled_at: 5 });
    expect(
      (
        await switchWorkspacePlan(
          { DB: db, ...VARIANTS },
          { workspaceId: "w", plan: "pro" },
        )
      ).ok,
    ).toBe(false);

    sqlite.exec(`DELETE FROM workspace_subscription`);
    insertSubscription("dev-w", { cycle: "monthly" });
    expect(
      await switchWorkspacePlan({ DB: db }, { workspaceId: "w", plan: "pro" }),
    ).toEqual({ ok: true });
    expect(planOf("dev-w")).toEqual({
      plan: "pro",
      ls_variant_id: "dev-pro-monthly",
    });
  });
});
