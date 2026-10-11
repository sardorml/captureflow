export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type TransactionalChannels = {
  from: string;
  binding?: Pick<SendEmail, "send">;
  resendApiKey?: string;
  fetcher?: typeof fetch;
};

export type TransactionalResult = "cloudflare" | "resend" | null;

const RESEND_EMAILS = "https://api.resend.com/emails";

function parseAddress(from: string): string | EmailAddress {
  const match = /^\s*(.+?)\s*<([^>]+)>\s*$/.exec(from);
  return match ? { name: match[1], email: match[2] } : from.trim();
}

async function viaResend(
  apiKey: string,
  from: string,
  email: TransactionalEmail,
  fetcher: typeof fetch,
): Promise<boolean> {
  const res = await fetcher(RESEND_EMAILS, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  }).catch(() => null);
  if (!res?.ok) {
    console.error("email: resend send failed", res?.status ?? "network");
    return false;
  }
  return true;
}

/*
 * Cloudflare Email Service first, Resend when the binding is missing or the
 * send throws: Email Service sending is still in beta, and a lost invite or
 * sign-in email costs more than a second provider.
 */
export async function sendTransactional(
  channels: TransactionalChannels,
  email: TransactionalEmail,
): Promise<TransactionalResult> {
  if (channels.binding) {
    try {
      await channels.binding.send({
        from: parseAddress(channels.from),
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { replyTo: email.replyTo } : {}),
      });
      return "cloudflare";
    } catch (err) {
      const code = (err as { code?: string }).code ?? String(err);
      console.error("email: cloudflare send failed, trying resend", code);
    }
  }
  if (!channels.resendApiKey) return null;
  const sent = await viaResend(
    channels.resendApiKey,
    channels.from,
    email,
    channels.fetcher ?? fetch,
  );
  return sent ? "resend" : null;
}
