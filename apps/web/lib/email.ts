/// <reference types="@cloudflare/workers-types" />

import { type TransactionalEmail, sendTransactional } from "@captureflow/mail";
import { getAppWebEnv } from "./cf-env";

// All sends are best-effort: failures log and return false so the caller can
// still report a recoverable error.

// Dev skips the binding so local sends go through Resend and reach a real inbox.
async function sendEmail(args: TransactionalEmail): Promise<boolean> {
  const env = await getAppWebEnv();
  const sent = await sendTransactional(
    {
      from: env?.RESEND_FROM_ADDRESS ?? "CaptureFlow <hello@captureflow.dev>",
      binding: process.env.NODE_ENV === "development" ? undefined : env?.EMAIL,
      resendApiKey: env?.RESEND_API_KEY,
    },
    args,
  );
  if (!sent) {
    console.warn("email: not delivered", {
      to: args.to,
      subject: args.subject,
    });
  }
  return sent !== null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    "",
    `Accept the invitation:`,
    args.acceptUrl,
    "",
    `Workspaces let teammates share recordings and screenshots privately. The link expires in 7 days.`,
    "",
    `If you weren't expecting this invite, you can ignore this email.`,
  ].join("\n");

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
            invited you to join their workspace on CaptureFlow. Workspaces let teammates share recordings and screenshots privately.
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

  // The invite names a person, so a reply should reach them rather than the
  // unattended sending address.
  return sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.inviterEmail,
  });
}

export async function sendAccessRequestEmail(args: {
  to: string;
  ownerName: string | null;
  requesterEmail: string;
  requesterName: string | null;
  artifactKind: "recording" | "screenshot";
  artifactTitle: string;
  artifactUrl: string;
  message: string | null;
  manageUrl: string;
}): Promise<boolean> {
  const requester = args.requesterName?.trim()
    ? args.requesterName.trim()
    : args.requesterEmail;
  const noun = args.artifactKind === "recording" ? "recording" : "screenshot";
  const subject = `${requester} requested access to your ${noun}`;

  const textLines = [
    `${requester} (${args.requesterEmail}) requested access to your ${noun} "${args.artifactTitle}" on CaptureFlow.`,
    "",
    `View it: ${args.artifactUrl}`,
  ];
  if (args.message?.trim()) {
    textLines.push("", `Message:`, args.message.trim());
  }
  textLines.push(
    "",
    `Grant access by inviting them to your workspace:`,
    args.manageUrl,
    "",
    `If you don't recognise this person, you can ignore this email.`,
  );
  const text = textLines.join("\n");

  const requesterSafe = escapeHtml(requester);
  const requesterEmailSafe = escapeHtml(args.requesterEmail);
  const titleSafe = escapeHtml(args.artifactTitle);
  const artifactUrlSafe = escapeHtml(args.artifactUrl);
  const manageSafe = escapeHtml(args.manageUrl);
  const messageBlock = args.message?.trim()
    ? `<p style="margin:0 0 20px 0; padding:12px 14px; background:#0a0a0a; border-left:2px solid #2563eb; color:#d4d4d4; line-height:1.55; font-style:italic;">${escapeHtml(
        args.message.trim(),
      )}</p>`
    : "";

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
            Adding them to your workspace will let them view this and any other workspace-visible recordings or screenshots you share there.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  // Same as the invite: the owner's reply belongs with the person asking.
  return sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.requesterEmail,
  });
}

export const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/lgpgeoelaokbigdljofhkgbfnfcnmcol";

const WELCOME_POINTS = [
  [
    "Record and share in one step",
    "Your screen uploads while you record, so the link is ready the moment you stop.",
  ],
  [
    "Get feedback on the video",
    "Viewers react and comment at the exact moment they mean, right on the timeline.",
  ],
  [
    "Share screenshots as links",
    "Capture your screen and send it as a link instead of an attachment.",
  ],
  [
    "Work as a team",
    "Invite teammates to a workspace so everyone's recordings live in one place.",
  ],
] as const;

export async function sendWelcomeEmail(args: {
  to: string;
  name: string | null;
  appUrl: string;
}): Promise<boolean> {
  const first = args.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = first ? `Hi ${first},` : "Hi there,";
  const base = args.appUrl.replace(/\/+$/, "");
  const recordingsUrl = `${base}/recordings`;

  const text = [
    greeting,
    "",
    "Welcome to CaptureFlow. Here's what you can do:",
    "",
    ...WELCOME_POINTS.map(([title, body]) => `- ${title}: ${body}`),
    "",
    `Add CaptureFlow to Chrome: ${CHROME_EXTENSION_URL}`,
    `Open your recordings: ${recordingsUrl}`,
  ].join("\n");

  const points = WELCOME_POINTS.map(
    ([title, body]) =>
      `<tr><td style="padding:0 0 14px;"><strong style="color:#1f1b17;">${escapeHtml(title)}</strong><br /><span style="color:#5c5650;">${escapeHtml(body)}</span></td></tr>`,
  ).join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f1b17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 0;">
          <a href="${escapeHtml(base)}" style="display:inline-block; text-decoration:none; color:#1f1b17;">
            <img src="https://captureflow.dev/logo.png" width="32" height="32" alt="" style="display:inline-block; vertical-align:middle; border:0; border-radius:8px;" />
            <span style="display:inline-block; vertical-align:middle; margin-left:10px; font-size:17px; font-weight:600;">CaptureFlow</span>
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px; font-size:16px; line-height:1.6;">
          <p style="margin:0 0 8px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 24px;">Welcome to CaptureFlow. Here's what you can do:</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px; line-height:1.5;">${points}</table>
          <p style="margin:12px 0 16px;">
            <a href="${CHROME_EXTENSION_URL}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">Add to Chrome</a>
          </p>
          <p style="margin:0; font-size:14px; color:#5c5650;">
            Or <a href="${escapeHtml(recordingsUrl)}" style="color:#2563eb;">open your recordings</a>.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to: args.to,
    subject: "Welcome to CaptureFlow",
    html,
    text,
  });
}

export async function sendSuggestionEmail(args: {
  to: string;
  suggestion: {
    name: string;
    email: string;
    category: string;
    title: string;
    description: string;
  };
  adminUrl: string;
}): Promise<boolean> {
  const s = args.suggestion;
  const text = [
    `${s.name} (${s.email}) suggested a feature on CaptureFlow.`,
    "",
    `Category: ${s.category}`,
    `Title: ${s.title}`,
    "",
    s.description,
    "",
    `All suggestions: ${args.adminUrl}`,
    "Reply to this email to answer them directly.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f1b17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 32px; font-size:15px; line-height:1.6;">
          <p style="margin:0 0 4px; font-size:13px; color:#8a847c;">Feature suggestion · ${escapeHtml(s.category)}</p>
          <h1 style="margin:0 0 16px; font-size:20px;">${escapeHtml(s.title)}</h1>
          <p style="margin:0 0 20px; white-space:pre-wrap;">${escapeHtml(s.description)}</p>
          <p style="margin:0; font-size:14px; color:#5c5650;">
            From ${escapeHtml(s.name)} (<a href="mailto:${escapeHtml(s.email)}" style="color:#2563eb;">${escapeHtml(s.email)}</a>). Reply to this email to answer them.
            <br /><a href="${escapeHtml(args.adminUrl)}" style="color:#2563eb;">See all suggestions</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to: args.to,
    subject: `Feature suggestion: ${s.title}`,
    html,
    text,
    replyTo: s.email,
  });
}

export async function sendCompanyRequestEmail(args: {
  to: string;
  label: string;
  subject: string;
  name: string;
  email: string;
  company: string;
  details: [string, string][];
  notes: string;
  adminUrl: string;
}): Promise<boolean> {
  const r = args;
  const rows = args.details.filter(([, value]) => value !== "");
  const text = [
    `${r.name} (${r.email}) sent a message from the ${r.label.toLowerCase()} form on CaptureFlow.`,
    "",
    `Company: ${r.company}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(r.notes ? ["", r.notes] : []),
    "",
    `All requests: ${args.adminUrl}`,
    "Reply to this email to answer them directly.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1f1b17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 32px; font-size:15px; line-height:1.6;">
          <p style="margin:0 0 4px; font-size:13px; color:#8a847c;">${escapeHtml(r.label)}</p>
          <h1 style="margin:0 0 16px; font-size:20px;">${escapeHtml(r.company)}</h1>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px; font-size:14px;">
            ${rows
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:2px 16px 2px 0; color:#8a847c;">${escapeHtml(k)}</td><td style="padding:2px 0;">${escapeHtml(v)}</td></tr>`,
              )
              .join("")}
          </table>
          ${r.notes ? `<p style="margin:0 0 20px; white-space:pre-wrap;">${escapeHtml(r.notes)}</p>` : ""}
          <p style="margin:0; font-size:14px; color:#5c5650;">
            From ${escapeHtml(r.name)} (<a href="mailto:${escapeHtml(r.email)}" style="color:#2563eb;">${escapeHtml(r.email)}</a>). Reply to this email to answer them.
            <br /><a href="${escapeHtml(args.adminUrl)}" style="color:#2563eb;">See all requests</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to: args.to,
    subject: r.subject,
    html,
    text,
    replyTo: r.email,
  });
}
