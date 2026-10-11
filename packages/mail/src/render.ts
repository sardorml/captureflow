import { marked } from "marked";

export type RenderedEmail = { html: string; text: string };

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
        <td style="padding:32px; font-size:16px; line-height:1.6;">
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
