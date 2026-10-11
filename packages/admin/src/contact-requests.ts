/// <reference types="@cloudflare/workers-types" />

export type ContactKind = "suggestion" | "setup" | "enterprise";

export type ContactRequestRow = {
  id: string;
  kind: ContactKind;
  name: string;
  email: string;
  subject: string;
  body: string;
  details: Record<string, string>;
  userId: string | null;
  createdAt: number;
};

type ContactD1Row = {
  id: string;
  kind: ContactKind;
  name: string;
  email: string;
  subject: string;
  body: string;
  details: string;
  user_id: string | null;
  created_at: number;
};

function parseDetails(raw: string): Record<string, string> {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        (e): e is [string, string] => typeof e[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

export async function listContactRequests(
  db: D1Database,
  kind: ContactKind,
  limit = 200,
): Promise<ContactRequestRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, kind, name, email, subject, body, details, user_id, created_at
         FROM contact_requests WHERE kind = ?1
        ORDER BY created_at DESC LIMIT ?2`,
    )
    .bind(kind, limit)
    .all<ContactD1Row>();
  return (results ?? []).map((r) => ({
    id: r.id,
    kind: r.kind,
    name: r.name,
    email: r.email,
    subject: r.subject,
    body: r.body,
    details: parseDetails(r.details),
    userId: r.user_id,
    createdAt: r.created_at,
  }));
}
