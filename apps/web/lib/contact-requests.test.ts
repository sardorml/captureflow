import { readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { describe, expect, it } from "vitest";
import {
  enterpriseRequest,
  hashIp,
  hydrateEnterpriseRequest,
  hydrateSetupRequest,
  hydrateSuggestion,
  insertContactRequest,
  recentRequestCount,
  setupRequest,
  suggestionRequest,
} from "./contact-requests";

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
    run: async () => {
      sqlite.prepare(sql).run(...params);
      return {};
    },
  });
  return { prepare } as unknown as D1Database;
}

function migrated(): DatabaseSync {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0011_contact_requests.sql", import.meta.url),
      "utf8",
    ),
  );
  return sqlite;
}

function form(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const SUGGESTION = {
  name: " Ada ",
  email: "Ada@Example.com",
  category: "Sharing",
  title: "Folders",
  description: "Group recordings.",
};

const SETUP = {
  company: "Acme",
  name: "Jane",
  email: "jane@acme.com",
  topic: "Self-hosting setup",
  team_size: "11–50",
  cloudflare: "Yes",
  notes: "",
};

describe("hydrateSuggestion", () => {
  it("trims, lowercases the email and keeps a known category", () => {
    expect(hydrateSuggestion(form(SUGGESTION))).toEqual({
      ok: true,
      value: {
        name: "Ada",
        email: "ada@example.com",
        category: "Sharing",
        title: "Folders",
        description: "Group recordings.",
      },
    });
  });

  it("flags a filled honeypot as spam", () => {
    expect(hydrateSuggestion(form({ ...SUGGESTION, website: "x" }))).toEqual({
      ok: false,
      spam: true,
    });
  });

  it("falls back to Other for an unknown category", () => {
    const r = hydrateSuggestion(form({ ...SUGGESTION, category: "Hacks" }));
    expect(r.ok && r.value.category).toBe("Other");
  });

  it("rejects a bad email or an over-long title", () => {
    expect(hydrateSuggestion(form({ ...SUGGESTION, email: "nope" })).ok).toBe(
      false,
    );
    expect(
      hydrateSuggestion(form({ ...SUGGESTION, title: "x".repeat(201) })).ok,
    ).toBe(false);
  });
});

describe("hydrateSetupRequest", () => {
  it("accepts a request without notes and maps it to a setup row", () => {
    const r = hydrateSetupRequest(form(SETUP));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(setupRequest(r.value)).toEqual({
      kind: "setup",
      name: "Jane",
      email: "jane@acme.com",
      subject: "Acme",
      body: "",
      details: {
        topic: "Self-hosting setup",
        teamSize: "11–50",
        cloudflare: "Yes",
      },
    });
  });

  it("flags the _honey field as spam and requires a company", () => {
    expect(hydrateSetupRequest(form({ ...SETUP, _honey: "x" }))).toEqual({
      ok: false,
      spam: true,
    });
    expect(hydrateSetupRequest(form({ ...SETUP, company: " " })).ok).toBe(
      false,
    );
  });
});

describe("hydrateEnterpriseRequest", () => {
  it("maps a request to an enterprise row with its picks as details", () => {
    const r = hydrateEnterpriseRequest(
      form({
        company: "Globex",
        name: "Hank",
        email: "hank@globex.com",
        need: "More than 1 TB of storage",
        team_size: "200+",
        storage: "5–20 TB",
        notes: "SSO review next month.",
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(enterpriseRequest(r.value)).toEqual({
      kind: "enterprise",
      name: "Hank",
      email: "hank@globex.com",
      subject: "Globex",
      body: "SSO review next month.",
      details: {
        need: "More than 1 TB of storage",
        teamSize: "200+",
        storage: "5–20 TB",
      },
    });
  });

  it("flags the website honeypot as spam", () => {
    expect(hydrateEnterpriseRequest(form({ ...SETUP, website: "x" }))).toEqual({
      ok: false,
      spam: true,
    });
  });
});

describe("contact request storage", () => {
  it("counts one sender's requests across both forms within the hour", async () => {
    const sqlite = migrated();
    const db = d1(sqlite);
    const now = Date.now();
    const s = hydrateSuggestion(form(SUGGESTION));
    const setup = hydrateSetupRequest(form(SETUP));
    if (!s.ok || !setup.ok) throw new Error("fixture invalid");
    const row = { userId: null, ipHash: "a" };
    await insertContactRequest(
      db,
      { ...suggestionRequest(s.value), ...row },
      now - 2 * 60 * 60 * 1000,
    );
    await insertContactRequest(
      db,
      { ...suggestionRequest(s.value), ...row },
      now - 1000,
    );
    await insertContactRequest(
      db,
      { ...setupRequest(setup.value), ...row },
      now - 500,
    );
    await insertContactRequest(
      db,
      { ...setupRequest(setup.value), userId: null, ipHash: "b" },
      now,
    );
    expect(await recentRequestCount(db, "a", now)).toBe(2);
    const stored = sqlite
      .prepare(
        "SELECT details FROM contact_requests WHERE kind = 'suggestion' LIMIT 1",
      )
      .get() as { details: string };
    expect(JSON.parse(stored.details)).toEqual({ category: "Sharing" });
  });

  it("hashes an IP to stable hex that depends on the secret", async () => {
    const a = await hashIp("1.2.3.4", "s1");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashIp("1.2.3.4", "s1")).toBe(a);
    expect(await hashIp("1.2.3.4", "s2")).not.toBe(a);
  });
});
