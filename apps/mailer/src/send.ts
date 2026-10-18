import {
  type MailerMessage,
  type OutgoingEmail,
  RESEND_BATCH_LIMIT,
  finishCampaign,
  getCampaign,
  nextRecipients,
  recordDeliveries,
  renderCampaign,
  sendBatch,
  sendOne,
  unsubscribeUrl,
} from "@captureflow/mail";

export type MailerEnv = {
  DB: D1Database;
  MAIL_QUEUE: Queue<MailerMessage>;
  RESEND_API_KEY?: string;
  MAIL_UNSUBSCRIBE_SECRET?: string;
  MAILER_BASE_URL: string;
  MAIL_FROM: string;
  MAIL_REPLY_TO?: string;
  MAILER_DEV_INBOX?: string;
};

async function compose(
  env: MailerEnv & { MAIL_UNSUBSCRIBE_SECRET: string },
  campaign: { subject: string; body: string },
  to: string,
  subjectPrefix = "",
): Promise<OutgoingEmail> {
  const link = await unsubscribeUrl(
    env.MAILER_BASE_URL,
    env.MAIL_UNSUBSCRIBE_SECRET,
    to,
  );
  const subject = `${subjectPrefix}${campaign.subject}`;
  return {
    to,
    subject,
    unsubscribeUrl: link,
    ...renderCampaign({ subject, body: campaign.body, unsubscribeUrl: link }),
  };
}

/*
 * Handles one queue message. Throwing means "retry this message later": a page
 * either fully records its deliveries and queues the next page, or leaves no
 * trace and runs again.
 */
export async function handleMessage(
  env: MailerEnv,
  message: MailerMessage,
  options: { fetcher?: typeof fetch; now?: () => number } = {},
): Promise<void> {
  const now = options.now ?? Date.now;
  const apiKey = env.RESEND_API_KEY;
  const secret = env.MAIL_UNSUBSCRIBE_SECRET;
  if (!apiKey || !secret) throw new Error("mailer: Resend is not configured");
  const configured = { ...env, MAIL_UNSUBSCRIBE_SECRET: secret };

  const campaign = await getCampaign(env.DB, message.campaignId);
  if (!campaign) return;

  if (message.kind === "test") {
    const ok = await sendOne({
      apiKey,
      from: env.MAIL_FROM,
      replyTo: env.MAIL_REPLY_TO,
      email: await compose(configured, campaign, message.to, "[Test] "),
      fetcher: options.fetcher,
    });
    if (!ok) console.error("mailer: test send failed", campaign.id);
    return;
  }

  if (campaign.status !== "sending") return;
  const recipients = await nextRecipients(
    env.DB,
    campaign.id,
    message.after,
    RESEND_BATCH_LIMIT,
  );
  if (recipients.length > 0) {
    const emails = await Promise.all(
      recipients.map((to) => compose(configured, campaign, to)),
    );
    const results = await sendBatch({
      apiKey,
      from: env.MAIL_FROM,
      replyTo: env.MAIL_REPLY_TO,
      emails,
      idempotencyKey: `${campaign.id}:${message.after}`,
      fetcher: options.fetcher,
    });
    await recordDeliveries(
      env.DB,
      campaign.id,
      recipients.map((email, i) => ({ email, ok: results[i] ?? false })),
      now(),
    );
  }
  if (recipients.length === RESEND_BATCH_LIMIT) {
    await env.MAIL_QUEUE.send({
      kind: "page",
      campaignId: campaign.id,
      after: recipients.at(-1)!,
    });
  } else {
    await finishCampaign(env.DB, campaign.id, now());
  }
}
