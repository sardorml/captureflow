import {
  addUnsubscribe,
  normalizeEmail,
  verifyUnsubscribeToken,
} from "@captureflow/mail";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(status: number, title: string, body: string): Response {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(title)} · CaptureFlow</title>
  </head>
  <body style="margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; background:#15120f; color:#f3eee6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
    <main style="max-width:420px; text-align:center;">
      <h1 style="font-size:24px; margin:0 0 12px;">${escapeHtml(title)}</h1>
      ${body}
    </main>
  </body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function invalid(): Response {
  return page(
    400,
    "This link doesn't work",
    `<p style="color:#a69f95; line-height:1.6;">It may have been cut short when it was copied. Use the unsubscribe link at the bottom of any CaptureFlow email.</p>`,
  );
}

/*
 * GET only shows a confirm button, because link scanners and mail previews
 * fetch every URL in a message. The unsubscribe itself is a POST: either that
 * button, or the mail client's RFC 8058 one-click request.
 */
export async function handleUnsubscribe(
  req: Request,
  db: D1Database,
  secret: string,
  now: number,
): Promise<Response> {
  const url = new URL(req.url);
  const email = normalizeEmail(url.searchParams.get("e") ?? "");
  const token = url.searchParams.get("t") ?? "";
  if (
    !email ||
    !token ||
    !(await verifyUnsubscribeToken(secret, email, token))
  ) {
    return invalid();
  }

  if (req.method === "POST") {
    await addUnsubscribe(db, email, now);
    return page(
      200,
      "You're unsubscribed",
      `<p style="color:#a69f95; line-height:1.6;">${escapeHtml(email)} won't get CaptureFlow product emails any more. Emails about your account, like workspace invites, still arrive.</p>`,
    );
  }

  return page(
    200,
    "Unsubscribe from CaptureFlow emails?",
    `<p style="color:#a69f95; line-height:1.6;">${escapeHtml(email)} will stop getting product updates.</p>
      <form method="post" action="${escapeHtml(url.pathname + url.search)}">
        <button type="submit" style="margin-top:12px; padding:12px 20px; border:0; border-radius:999px; background:#2563eb; color:#fff; font-size:15px; font-weight:600; cursor:pointer;">Unsubscribe</button>
      </form>`,
  );
}
