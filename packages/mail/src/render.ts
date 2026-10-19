import { marked } from "marked";

export type RenderedEmail = { html: string; text: string };

// PNG on purpose: Gmail and Outlook don't render SVG.
const LOGO_URL = "https://captureflow.dev/logo.png";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/*
 * Bodies are written by an operator, not a user, but raw HTML in the Markdown
 * is still escaped: a pasted snippet should arrive as text, not restyle or
 * break the template around it.
 */
function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
    renderer: Object.assign(new marked.Renderer(), {
      html: ({ text }: { text: string }) => escapeHtml(text),
    }),
  });
}

function markdownToText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function renderCampaign(args: {
  subject: string;
  body: string;
  unsubscribeUrl: string;
}): RenderedEmail {
  const content = markdownToHtml(args.body);
  const unsubscribe = escapeHtml(args.unsubscribeUrl);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(args.subject)}</title>
  </head>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f1b17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 0;">
          <a href="https://captureflow.dev" style="display:inline-block; text-decoration:none; color:#1f1b17;">
            <img src="${LOGO_URL}" width="32" height="32" alt="" style="display:inline-block; vertical-align:middle; border:0; border-radius:8px;" />
            <span style="display:inline-block; vertical-align:middle; margin-left:10px; font-size:17px; font-weight:600; letter-spacing:-0.01em;">CaptureFlow</span>
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 32px; font-size:16px; line-height:1.6;">
          ${content}
        </td>
      </tr>
    </table>
    <p style="max-width:560px; margin:16px auto 0; font-size:12px; line-height:1.5; color:#8a847c; text-align:center;">
      You're receiving this because you have a CaptureFlow account.
      <a href="${unsubscribe}" style="color:#8a847c;">Unsubscribe</a>
    </p>
  </body>
</html>`;
  const text = `${markdownToText(args.body)}\n\n--\nYou're receiving this because you have a CaptureFlow account.\nUnsubscribe: ${args.unsubscribeUrl}\n`;
  return { html, text };
}

export type NoticeButton = { label: string; url: string };

/*
 * The one layout every automated email uses: a white card on the warm page,
 * an optional small label above the heading, then the body, an optional blue
 * button and a muted footnote. `bodyHtml` and `footnoteHtml` are trusted
 * markup the caller has already escaped; every other field is escaped here.
 */
export function renderNotice(args: {
  label?: string;
  heading: string;
  bodyHtml: string;
  button?: NoticeButton;
  footnoteHtml?: string;
}): string {
  const label = args.label
    ? `<p style="margin:0 0 4px; font-size:13px; color:#8a847c;">${escapeHtml(args.label)}</p>`
    : "";
  const button = args.button
    ? `<p style="margin:0 0 20px;"><a href="${escapeHtml(args.button.url)}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">${escapeHtml(args.button.label)}</a></p>`
    : "";
  const footnote = args.footnoteHtml
    ? `<p style="margin:0; font-size:14px; color:#5c5650;">${args.footnoteHtml}</p>`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f1b17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 32px; font-size:15px; line-height:1.6;">
          ${label}
          <h1 style="margin:0 0 16px; font-size:20px;">${escapeHtml(args.heading)}</h1>
          ${args.bodyHtml}
          ${button}
          ${footnote}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export { escapeHtml };
