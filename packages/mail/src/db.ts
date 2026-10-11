export type CampaignStatus = "draft" | "sending" | "sent";
export type Audience = "all" | "selected";

export type Campaign = {
  id: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  audience: Audience;
  createdBy: string;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  sentCount: number;
  failedCount: number;
};

type CampaignRow = {
  id: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  audience: Audience;
  created_by: string;
  created_at: number;
  started_at: number | null;
  finished_at: number | null;
  sent_count: number;
  failed_count: number;
};

function toCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    status: row.status,
    audience: row.audience,
    createdBy: row.created_by,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
  };
}

export type CampaignDraft = {
  subject: string;
  body: string;
  audience: Audience;
  emails: string[];
};

export type AudienceMember = {
  email: string;
  name: string | null;
  unsubscribed: boolean;
};

/*
 * One row per account address, minus unsubscribes. Selected addresses still
 * have to belong to an account at send time, so a deleted user is skipped.
 */
function recipientsOf(campaignParam: string): string {
  return `
  SELECT DISTINCT lower(u.email) AS email FROM users u
  WHERE lower(u.email) NOT IN (SELECT email FROM mail_unsubscribes)
    AND (
      (SELECT audience FROM mail_campaigns WHERE id = ${campaignParam}) = 'all'
      OR lower(u.email) IN (
        SELECT email FROM mail_campaign_recipients WHERE campaign_id = ${campaignParam}
      )
    )`;
}

// Replaces the selection, but only while the campaign is still a draft.
function selectionStatements(
  db: D1Database,
  id: string,
  draft: CampaignDraft,
): D1PreparedStatement[] {
  const isDraft = `EXISTS (SELECT 1 FROM mail_campaigns WHERE id = ?1 AND status = 'draft')`;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO mail_campaign_recipients (campaign_id, email)
     SELECT ?1, ?2 WHERE ${isDraft}`,
  );
  return [
    db
      .prepare(
        `DELETE FROM mail_campaign_recipients WHERE campaign_id = ?1 AND ${isDraft}`,
      )
      .bind(id),
    ...(draft.audience === "selected"
      ? draft.emails.map((email) => insert.bind(id, email))
      : []),
  ];
}

export async function createCampaign(
  db: D1Database,
  input: CampaignDraft & { createdBy: string },
  now: number,
): Promise<string> {
  const id = crypto.randomUUID();
  await db.batch([
    db
      .prepare(
        `INSERT INTO mail_campaigns (id, subject, body, status, audience, created_by, created_at)
         VALUES (?1, ?2, ?3, 'draft', ?4, ?5, ?6)`,
      )
      .bind(
        id,
        input.subject,
        input.body,
        input.audience,
        input.createdBy,
        now,
      ),
    ...selectionStatements(db, id, input),
  ]);
  return id;
}

export async function updateDraft(
  db: D1Database,
  id: string,
  input: CampaignDraft,
): Promise<boolean> {
  const [update] = await db.batch([
    db
      .prepare(
        `UPDATE mail_campaigns SET subject = ?2, body = ?3, audience = ?4
         WHERE id = ?1 AND status = 'draft'`,
      )
      .bind(id, input.subject, input.body, input.audience),
    ...selectionStatements(db, id, input),
  ]);
  return (update?.meta.changes ?? 0) > 0;
}

export async function deleteDraft(
  db: D1Database,
  id: string,
): Promise<boolean> {
  const res = await db
    .prepare(`DELETE FROM mail_campaigns WHERE id = ?1 AND status = 'draft'`)
    .bind(id)
    .run();
  return res.meta.changes > 0;
}

export async function getCampaign(
  db: D1Database,
  id: string,
): Promise<Campaign | null> {
  const row = await db
    .prepare(`SELECT * FROM mail_campaigns WHERE id = ?1`)
    .bind(id)
    .first<CampaignRow>();
  return row ? toCampaign(row) : null;
}

export async function listCampaigns(
  db: D1Database,
  limit = 50,
): Promise<Campaign[]> {
  const { results } = await db
    .prepare(`SELECT * FROM mail_campaigns ORDER BY created_at DESC LIMIT ?1`)
    .bind(limit)
    .all<CampaignRow>();
  return results.map(toCampaign);
}

export async function countRecipients(
  db: D1Database,
  campaignId?: string,
): Promise<number> {
  const query = campaignId
    ? db
        .prepare(`SELECT COUNT(*) AS n FROM (${recipientsOf("?1")})`)
        .bind(campaignId)
    : db.prepare(
        `SELECT COUNT(DISTINCT lower(email)) AS n FROM users
         WHERE lower(email) NOT IN (SELECT email FROM mail_unsubscribes)`,
      );
  return (await query.first<{ n: number }>())?.n ?? 0;
}

export async function selectedEmails(
  db: D1Database,
  campaignId: string,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT email FROM mail_campaign_recipients WHERE campaign_id = ?1 ORDER BY email`,
    )
    .bind(campaignId)
    .all<{ email: string }>();
  return results.map((r) => r.email);
}

export async function listAudience(db: D1Database): Promise<AudienceMember[]> {
  const { results } = await db
    .prepare(
      `SELECT lower(u.email) AS email, MAX(u.name) AS name,
              lower(u.email) IN (SELECT email FROM mail_unsubscribes) AS unsubscribed
       FROM users u GROUP BY lower(u.email) ORDER BY lower(u.email)`,
    )
    .all<{ email: string; name: string | null; unsubscribed: number }>();
  return results.map((r) => ({
    email: r.email,
    name: r.name?.trim() || null,
    unsubscribed: r.unsubscribed === 1,
  }));
}

export async function countUnsubscribed(db: D1Database): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM mail_unsubscribes`)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// Draft → sending exactly once, so a double-clicked send can't start two runs.
export async function startCampaign(
  db: D1Database,
  id: string,
  now: number,
): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE mail_campaigns SET status = 'sending', started_at = ?2
       WHERE id = ?1 AND status = 'draft'`,
    )
    .bind(id, now)
    .run();
  return res.meta.changes > 0;
}

// Undoes a start whose first page never made it onto the queue.
export async function revertStart(db: D1Database, id: string): Promise<void> {
  await db
    .prepare(
      `UPDATE mail_campaigns SET status = 'draft', started_at = NULL
       WHERE id = ?1 AND status = 'sending' AND sent_count = 0 AND failed_count = 0`,
    )
    .bind(id)
    .run();
}

export async function finishCampaign(
  db: D1Database,
  id: string,
  now: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE mail_campaigns SET status = 'sent', finished_at = ?2
       WHERE id = ?1 AND status = 'sending'`,
    )
    .bind(id, now)
    .run();
}

/*
 * Addresses after the cursor that this campaign hasn't reached yet. Skipping
 * recorded deliveries is what makes a retried page safe: whatever went out
 * before the failure is not sent twice.
 */
export async function nextRecipients(
  db: D1Database,
  campaignId: string,
  after: string,
  limit: number,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT email FROM (${recipientsOf("?2")})
       WHERE email > ?1
         AND email NOT IN (SELECT email FROM mail_deliveries WHERE campaign_id = ?2)
       ORDER BY email LIMIT ?3`,
    )
    .bind(after, campaignId, limit)
    .all<{ email: string }>();
  return results.map((r) => r.email);
}

export async function recordDeliveries(
  db: D1Database,
  campaignId: string,
  results: { email: string; ok: boolean }[],
  now: number,
): Promise<void> {
  if (results.length === 0) return;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO mail_deliveries (campaign_id, email, status, created_at)
     VALUES (?1, ?2, ?3, ?4)`,
  );
  await db.batch([
    ...results.map((r) =>
      insert.bind(campaignId, r.email, r.ok ? "sent" : "failed", now),
    ),
    db
      .prepare(
        `UPDATE mail_campaigns SET
           sent_count = (SELECT COUNT(*) FROM mail_deliveries WHERE campaign_id = ?1 AND status = 'sent'),
           failed_count = (SELECT COUNT(*) FROM mail_deliveries WHERE campaign_id = ?1 AND status = 'failed')
         WHERE id = ?1`,
      )
      .bind(campaignId),
  ]);
}

export async function addUnsubscribe(
  db: D1Database,
  email: string,
  now: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO mail_unsubscribes (email, created_at) VALUES (?1, ?2)`,
    )
    .bind(email, now)
    .run();
}
