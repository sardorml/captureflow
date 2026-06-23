/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// All sends are best-effort: failures log and return false so the caller can
// still report a recoverable error.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function sendEmail(args: SendArgs): Promise<boolean> {
  const env = await getAppWebEnv();
  const apiKey = env?.RESEND_API_KEY;
  const from = env?.RESEND_FROM_ADDRESS ?? 'CaptureFlow <hello@captureflow.xyz>';
  if (!apiKey) {
    console.warn('email: RESEND_API_KEY not configured; skipping send', {
      to: args.to,
      subject: args.subject,
    });
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('email: resend send failed', res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error('email: resend send threw', err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendWorkspaceInviteEmail(args: {
  to: string;
  inviterName: string | null;
  inviterEmail: string;
  workspaceName: string;
  acceptUrl: string;
}): Promise<boolean> {
  const inviter = args.inviterName?.trim()
    ? args.inviterName.trim()
    : args.inviterEmail;
  const subject = `${inviter} invited you to ${args.workspaceName} on CaptureFlow`;

  const text = [
    `${inviter} (${args.inviterEmail}) invited you to join the "${args.workspaceName}" workspace on CaptureFlow.`,
    '',
    `Accept the invitation:`,
    args.acceptUrl,
    '',
    `Workspaces let teammates share screen recordings and screenshots privately. The link expires in 7 days.`,
    '',
    `If you weren't expecting this invite, you can ignore this email.`,
  ].join('\n');

  const inviterSafe = escapeHtml(inviter);
  const inviterEmailSafe = escapeHtml(args.inviterEmail);
  const workspaceSafe = escapeHtml(args.workspaceName);
  const acceptSafe = escapeHtml(args.acceptUrl);

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#0a0a0a; color:#e5e5e5; padding:32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px; margin:0 auto; background:#171717; border-radius:12px; padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 12px 0; font-size:22px; color:#fafafa;">You're invited to ${workspaceSafe}</h1>
          <p style="margin:0 0 20px 0; color:#a3a3a3; line-height:1.55;">
            <strong style="color:#e5e5e5;">${inviterSafe}</strong>
            (<a href="mailto:${inviterEmailSafe}" style="color:#a3a3a3;">${inviterEmailSafe}</a>)
            invited you to join their workspace on CaptureFlow. Workspaces let teammates share screen recordings and screenshots privately.
          </p>
          <p style="margin:0 0 24px 0;">
            <a href="${acceptSafe}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">Accept invitation</a>
          </p>
          <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
            This link expires in 7 days. If you weren't expecting this invitation, you can ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({ to: args.to, subject, html, text });
}

export async function sendAccessRequestEmail(args: {
  to: string;
  ownerName: string | null;
  requesterEmail: string;
  requesterName: string | null;
  artifactKind: 'share' | 'snap';
  artifactTitle: string;
  artifactUrl: string;
  message: string | null;
  manageUrl: string;
}): Promise<boolean> {
  const requester = args.requesterName?.trim()
    ? args.requesterName.trim()
    : args.requesterEmail;
  const noun = args.artifactKind === 'share' ? 'recording' : 'snap';
  const subject = `${requester} requested access to your ${noun}`;

  const textLines = [
    `${requester} (${args.requesterEmail}) requested access to your ${noun} "${args.artifactTitle}" on CaptureFlow.`,
    '',
    `View it: ${args.artifactUrl}`,
  ];
  if (args.message?.trim()) {
    textLines.push('', `Message:`, args.message.trim());
  }
  textLines.push(
    '',
    `Grant access by inviting them to your workspace:`,
    args.manageUrl,
    '',
    `If you don't recognise this person, you can ignore this email.`
  );
  const text = textLines.join('\n');

  const requesterSafe = escapeHtml(requester);
  const requesterEmailSafe = escapeHtml(args.requesterEmail);
  const titleSafe = escapeHtml(args.artifactTitle);
  const artifactUrlSafe = escapeHtml(args.artifactUrl);
  const manageSafe = escapeHtml(args.manageUrl);
  const messageBlock = args.message?.trim()
    ? `<p style="margin:0 0 20px 0; padding:12px 14px; background:#0a0a0a; border-left:2px solid #2563eb; color:#d4d4d4; line-height:1.55; font-style:italic;">${escapeHtml(
        args.message.trim()
      )}</p>`
    : '';

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#0a0a0a; color:#e5e5e5; padding:32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px; margin:0 auto; background:#171717; border-radius:12px; padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 12px 0; font-size:22px; color:#fafafa;">${requesterSafe} wants access</h1>
          <p style="margin:0 0 16px 0; color:#a3a3a3; line-height:1.55;">
            <strong style="color:#e5e5e5;">${requesterSafe}</strong>
            (<a href="mailto:${requesterEmailSafe}" style="color:#a3a3a3;">${requesterEmailSafe}</a>)
            requested access to your ${noun} <a href="${artifactUrlSafe}" style="color:#e5e5e5;">${titleSafe}</a>.
          </p>
          ${messageBlock}
          <p style="margin:0 0 24px 0;">
            <a href="${manageSafe}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">Invite them to your workspace</a>
          </p>
          <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
            Adding them to your workspace will let them view this and any other workspace-visible recordings or snaps you share there.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({ to: args.to, subject, html, text });
}
