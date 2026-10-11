import { hydrateMailerMessage, type MailerMessage } from "@captureflow/mail";
import { handleMessage, type MailerEnv } from "./send";
import { handleUnsubscribe } from "./unsubscribe";

export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
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
