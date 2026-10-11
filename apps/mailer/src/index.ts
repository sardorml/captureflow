import { hydrateMailerMessage, type MailerMessage } from "@captureflow/mail";
import { handleMessage, type MailerEnv } from "./send";
import { handleUnsubscribe } from "./unsubscribe";

/*
 * Local dev only: admin runs under `next dev`, a separate process whose queue
 * never reaches this Worker's consumer, so it posts messages here instead.
 * MAILER_DEV_INBOX is set in .dev.vars and never deployed.
 */
async function forwardToQueue(
  req: Request,
  queue: Queue<MailerMessage>,
): Promise<Response> {
  if (req.method !== "POST") return new Response("Not found", { status: 404 });
  const body = hydrateMailerMessage(await req.json().catch(() => null));
  if (!body) return new Response("Bad message", { status: 400 });
  await queue.send(body);
  return new Response(null, { status: 202 });
}

export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (env.MAILER_DEV_INBOX === "1" && pathname === "/dev/queue") {
      return forwardToQueue(req, env.MAIL_QUEUE);
    }
    if (
      pathname !== "/unsubscribe" ||
      (req.method !== "GET" && req.method !== "POST")
    ) {
      return new Response("Not found", { status: 404 });
    }
    if (!env.MAIL_UNSUBSCRIBE_SECRET) {
      return new Response("Unavailable", { status: 503 });
    }
    return handleUnsubscribe(
      req,
      env.DB,
      env.MAIL_UNSUBSCRIBE_SECRET,
      Date.now(),
    );
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      const body = hydrateMailerMessage(message.body);
      if (!body) {
        console.error("mailer: dropped malformed message", message.id);
        message.ack();
        continue;
      }
      try {
        await handleMessage(env, body);
        message.ack();
      } catch (err) {
        console.error("mailer: will retry", body.campaignId, err);
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<MailerEnv, MailerMessage>;
