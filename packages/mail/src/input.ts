export type Hydrated<T> = { ok: true; value: T } | { ok: false; error: string };

import type { CampaignDraft } from "./db";

const MAX_SUBJECT = 200;
const MAX_BODY = 50_000;
const MAX_SELECTED = 50_000;
const EMAIL = /^[^\s@]+@[^\s@]+$/;
const CAMPAIGN_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Server actions accept whatever the client posts, even behind the admin gate.
export function hydrateCampaignInput(form: FormData): Hydrated<CampaignDraft> {
  const subject = form.get("subject");
  const body = form.get("body");
  if (typeof subject !== "string" || typeof body !== "string") {
    return { ok: false, error: "Subject and message are required." };
  }
  const s = subject.trim();
  const b = body.trim();
  if (!s) return { ok: false, error: "Add a subject." };
  if (s.length > MAX_SUBJECT) {
    return {
      ok: false,
      error: `Keep the subject under ${MAX_SUBJECT} characters.`,
    };
  }
  if (/[\r\n]/.test(s))
    return { ok: false, error: "The subject must be one line." };
  if (!b) return { ok: false, error: "Write a message." };
  if (b.length > MAX_BODY) {
    return {
      ok: false,
      error: `Keep the message under ${MAX_BODY} characters.`,
    };
  }
  if (form.get("audience") !== "selected") {
    return {
      ok: true,
      value: { subject: s, body: b, audience: "all", emails: [] },
    };
  }
  const emails = [
    ...new Set(
      form
        .getAll("recipient")
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().toLowerCase())
        .filter((v) => v.length <= 320 && EMAIL.test(v)),
    ),
  ];
  if (emails.length === 0) {
    return {
      ok: false,
      error: "Select at least one person, or send to everyone.",
    };
  }
  if (emails.length > MAX_SELECTED) {
    return { ok: false, error: "That's too many people to pick by hand." };
  }
  return {
    ok: true,
    value: { subject: s, body: b, audience: "selected", emails },
  };
}

export function hydrateCampaignId(value: unknown): string | null {
  return typeof value === "string" && CAMPAIGN_ID.test(value) ? value : null;
}

export type MailerMessage =
  | { kind: "page"; campaignId: string; after: string }
  | { kind: "test"; campaignId: string; to: string };

// Queue bodies cross a Worker boundary, so the consumer re-checks their shape.
export function hydrateMailerMessage(value: unknown): MailerMessage | null {
  if (!value || typeof value !== "object") return null;
  const m = value as Record<string, unknown>;
  const campaignId = hydrateCampaignId(m.campaignId);
  if (!campaignId) return null;
  if (m.kind === "page" && typeof m.after === "string") {
    return { kind: "page", campaignId, after: m.after };
  }
  if (m.kind === "test" && typeof m.to === "string" && m.to.includes("@")) {
    return { kind: "test", campaignId, to: m.to };
  }
  return null;
}
