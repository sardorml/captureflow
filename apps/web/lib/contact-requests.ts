/// <reference types="@cloudflare/workers-types" />

import { FEATURE_CATEGORIES } from "@/lib/marketing/constants";

export type Suggestion = {
  name: string;
  email: string;
  category: string;
  title: string;
  description: string;
};

export type SetupRequest = {
  name: string;
  email: string;
  company: string;
  topic: string;
  teamSize: string;
  cloudflare: string;
  notes: string;
};

export type EnterpriseRequest = {
  name: string;
  email: string;
  company: string;
  need: string;
  teamSize: string;
  storage: string;
  notes: string;
};

export type Hydrated<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }
  | { ok: false; spam: true };

export type ContactRequest = {
  kind: "suggestion" | "setup" | "enterprise";
  name: string;
  email: string;
  subject: string;
  body: string;
  details: Record<string, string>;
};

export const CONTACT_REQUESTS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, key: string, max: number): string | null {
  const value = String(form.get(key) ?? "").trim();
  return value && value.length <= max ? value : null;
}

function optional(form: FormData, key: string, max: number): string {
  return String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function contact(
  form: FormData,
): { name: string; email: string } | { error: string } {
  const name = field(form, "name", 120);
  const email = field(form, "email", 254)?.toLowerCase() ?? null;
  if (!name) return { error: "Add your name." };
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Add an email address we can reply to." };
  }
  return { name, email };
}

// `honeypot` is a field hidden from people that form bots fill in.
function isSpam(form: FormData, honeypot: string): boolean {
  return String(form.get(honeypot) ?? "").trim() !== "";
}

export function hydrateSuggestion(form: FormData): Hydrated<Suggestion> {
  if (isSpam(form, "website")) return { ok: false, spam: true };
  const who = contact(form);
  if ("error" in who) return { ok: false, error: who.error };
  const title = field(form, "title", 200);
  const description = field(form, "description", 5000);
  const raw = String(form.get("category") ?? "");
  const category = (FEATURE_CATEGORIES as readonly string[]).includes(raw)
    ? raw
    : "Other";
  if (!title) return { ok: false, error: "Give the idea a short title." };
  if (!description) {
    return { ok: false, error: "Describe the idea in a sentence or two." };
  }
  return { ok: true, value: { ...who, category, title, description } };
}

export function hydrateSetupRequest(form: FormData): Hydrated<SetupRequest> {
  if (isSpam(form, "_honey")) return { ok: false, spam: true };
  const who = contact(form);
  if ("error" in who) return { ok: false, error: who.error };
  const company = field(form, "company", 200);
  if (!company) return { ok: false, error: "Add your company name." };
  return {
    ok: true,
    value: {
      ...who,
      company,
      topic: optional(form, "topic", 80),
      teamSize: optional(form, "team_size", 40),
      cloudflare: optional(form, "cloudflare", 40),
      notes: optional(form, "notes", 5000),
    },
  };
}

export function hydrateEnterpriseRequest(
  form: FormData,
): Hydrated<EnterpriseRequest> {
  if (isSpam(form, "website")) return { ok: false, spam: true };
  const who = contact(form);
  if ("error" in who) return { ok: false, error: who.error };
  const company = field(form, "company", 200);
  if (!company) return { ok: false, error: "Add your company name." };
  return {
    ok: true,
    value: {
      ...who,
      company,
      need: optional(form, "need", 80),
      teamSize: optional(form, "team_size", 40),
      storage: optional(form, "storage", 40),
      notes: optional(form, "notes", 5000),
    },
  };
}

export function suggestionRequest(s: Suggestion): ContactRequest {
  return {
    kind: "suggestion",
    name: s.name,
    email: s.email,
    subject: s.title,
    body: s.description,
    details: { category: s.category },
  };
}

export function setupRequest(s: SetupRequest): ContactRequest {
  return {
    kind: "setup",
    name: s.name,
    email: s.email,
    subject: s.company,
    body: s.notes,
    details: {
      topic: s.topic,
      teamSize: s.teamSize,
      cloudflare: s.cloudflare,
    },
  };
}

export function enterpriseRequest(e: EnterpriseRequest): ContactRequest {
  return {
    kind: "enterprise",
    name: e.name,
    email: e.email,
    subject: e.company,
    body: e.notes,
    details: { need: e.need, teamSize: e.teamSize, storage: e.storage },
  };
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(ip),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function recentRequestCount(
  db: D1Database,
  ipHash: string,
  now: number,
): Promise<number> {
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS n FROM contact_requests WHERE ip_hash = ?1 AND created_at > ?2",
    )
    .bind(ipHash, now - HOUR_MS)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function insertContactRequest(
  db: D1Database,
  r: ContactRequest & { userId: string | null; ipHash: string },
  now: number,
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO contact_requests
         (id, kind, name, email, subject, body, details, user_id, ip_hash, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    )
    .bind(
      id,
      r.kind,
      r.name,
      r.email,
      r.subject,
      r.body,
      JSON.stringify(r.details),
      r.userId,
      r.ipHash,
      now,
    )
    .run();
  return id;
}
