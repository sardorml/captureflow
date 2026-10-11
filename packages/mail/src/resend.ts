export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
};

const RESEND_EMAILS = "https://api.resend.com/emails";
const RESEND_BATCH = "https://api.resend.com/emails/batch";
export const RESEND_BATCH_LIMIT = 100;
// Resend's default API limit is a few requests a second; stay under it.
const SINGLE_SEND_SPACING_MS = 600;

// Retrying the whole batch later is the right response to these.
export class TransientSendError extends Error {}

function payload(from: string, email: OutgoingEmail) {
  return {
    from,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    // RFC 8058 one-click: Gmail and Yahoo require both for bulk senders.
    headers: {
      "List-Unsubscribe": `<${email.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

function isTransient(status: number): boolean {
  return status === 429 || status >= 500;
}

/*
 * One batch request per page. Resend validates a batch as a whole, so a single
 * malformed address rejects all of it; on that rejection the page goes out one
 * email at a time and only the bad address is marked failed.
 */
export async function sendBatch(args: {
  apiKey: string;
  from: string;
  emails: OutgoingEmail[];
  idempotencyKey: string;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}): Promise<boolean[]> {
  const fetcher = args.fetcher ?? fetch;
  const sleep =
    args.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const headers = {
    authorization: `Bearer ${args.apiKey}`,
    "content-type": "application/json",
  };

  const res = await fetcher(RESEND_BATCH, {
    method: "POST",
    headers: { ...headers, "idempotency-key": args.idempotencyKey },
    body: JSON.stringify(args.emails.map((e) => payload(args.from, e))),
  }).catch(() => null);
  if (!res || isTransient(res.status)) {
    throw new TransientSendError(
      `batch send failed: ${res?.status ?? "network"}`,
    );
  }
  if (res.ok) return args.emails.map(() => true);

  const results: boolean[] = [];
  for (const [i, email] of args.emails.entries()) {
    if (i > 0) await sleep(SINGLE_SEND_SPACING_MS);
    const single = await fetcher(RESEND_EMAILS, {
      method: "POST",
      headers,
      body: JSON.stringify(payload(args.from, email)),
    }).catch(() => null);
    if (!single || isTransient(single.status)) {
      throw new TransientSendError(
        `single send failed: ${single?.status ?? "network"}`,
      );
    }
    results.push(single.ok);
  }
  return results;
}

export async function sendOne(args: {
  apiKey: string;
  from: string;
  email: OutgoingEmail;
  fetcher?: typeof fetch;
}): Promise<boolean> {
  const res = await (args.fetcher ?? fetch)(RESEND_EMAILS, {
    method: "POST",
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload(args.from, args.email)),
  }).catch(() => null);
  return res?.ok ?? false;
}
