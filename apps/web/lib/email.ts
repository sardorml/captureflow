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

const EMAIL_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const EMAIL_TEXT = "#1f1b17";
const EMAIL_MUTED = "#5c5650";
const EMAIL_LINK = "#2563eb";

/*
 * The light card every product email shares, the welcome email's design:
 * logo, heading, body, an optional button and a muted footnote. `body` and
 * `footnote` are HTML the caller has already escaped.
 */
function emailHtml(args: {
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  footnote?: string;
}): string {
  const cta = args.cta
    ? `<p style="margin:8px 0 24px;"><a href="${escapeHtml(args.cta.url)}" style="display:inline-block; padding:12px 20px; background:${EMAIL_LINK}; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">${escapeHtml(args.cta.label)}</a></p>`
    : "";
  const footnote = args.footnote
    ? `<p style="margin:0; font-size:13px; line-height:1.5; color:${EMAIL_MUTED};">${args.footnote}</p>`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0; padding:32px 16px; background:#f5f3ef; font-family:${EMAIL_FONT}; color:${EMAIL_TEXT};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px 0;">
          <a href="https://captureflow.dev" style="display:inline-block; text-decoration:none; color:${EMAIL_TEXT};">
            <img src="https://captureflow.dev/logo.png" width="32" height="32" alt="" style="display:inline-block; vertical-align:middle; border:0; border-radius:8px;" />
            <span style="display:inline-block; vertical-align:middle; margin-left:10px; font-size:17px; font-weight:600;">CaptureFlow</span>
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px; font-size:15px; line-height:1.6;">
          <h1 style="margin:0 0 12px; font-size:22px; line-height:1.3; color:${EMAIL_TEXT};">${escapeHtml(args.heading)}</h1>
          ${args.body}
          ${cta}
          ${footnote}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px; color:${EMAIL_TEXT};">${html}</p>`;
}

function emailPerson(name: string, email: string): string {
  return `<strong>${escapeHtml(name)}</strong> (<a href="mailto:${escapeHtml(email)}" style="color:${EMAIL_MUTED};">${escapeHtml(email)}</a>)`;
}

export async function sendWorkspaceInviteEmail(args: {
  to: string;
  inviterName: string | null;
  inviterEmail: string;
  workspaceName: string;
  role: "member" | "viewer";
  acceptUrl: string;
}): Promise<boolean> {
  const inviter = args.inviterName?.trim()
    ? args.inviterName.trim()
    : args.inviterEmail;
  const subject = `${inviter} invited you to ${args.workspaceName} on CaptureFlow`;
  const asRole =
    args.role === "viewer"
      ? "as a viewer, to watch and comment"
      : "as a member, to record and share";

  const text = [
    `${inviter} (${args.inviterEmail}) invited you to join the "${args.workspaceName}" workspace on CaptureFlow ${asRole}.`,
    "",
    `Accept the invitation:`,
    args.acceptUrl,
    "",
    `Workspaces let teammates share recordings and screenshots privately. The link expires in 7 days.`,
    "",
    `If you weren't expecting this invite, you can ignore this email.`,
  ].join("\n");

  const html = emailHtml({
    heading: `You're invited to ${args.workspaceName}`,
    body: emailParagraph(
      `${emailPerson(inviter, args.inviterEmail)} invited you to join their workspace on CaptureFlow ${escapeHtml(asRole)}. Workspaces let teammates share recordings and screenshots privately.`,
    ),
    cta: { label: "Accept invitation", url: args.acceptUrl },
    footnote:
      "This link expires in 7 days. If you weren't expecting this invitation, you can ignore this email.",
  });

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

  const titleSafe = escapeHtml(args.artifactTitle);
  const messageBlock = args.message?.trim()
    ? `<p style="margin:0 0 16px; padding:12px 14px; background:#f5f3ef; border-left:2px solid ${EMAIL_LINK}; color:${EMAIL_TEXT}; line-height:1.55; font-style:italic;">${escapeHtml(
        args.message.trim(),
      )}</p>`
    : "";

  const html = emailHtml({
    heading: `${requester} wants access`,
    body:
      emailParagraph(
        `${emailPerson(requester, args.requesterEmail)} requested access to your ${noun} <a href="${escapeHtml(args.artifactUrl)}" style="color:${EMAIL_LINK};">${titleSafe}</a>.`,
      ) + messageBlock,
    cta: { label: "Invite them to your workspace", url: args.manageUrl },
    footnote:
      "Adding them to your workspace will let them view this and any other workspace-visible recordings or screenshots you share there.",
  });

  // Same as the invite: the owner's reply belongs with the person asking.
  return sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.requesterEmail,
  });
}

export async function sendSeatRequestEmail(args: {
  to: string;
  ownerName: string | null;
  requesterName: string | null;
  requesterEmail: string;
  workspaceName: string;
  manageUrl: string;
}): Promise<boolean> {
  const requester = args.requesterName?.trim()
    ? args.requesterName.trim()
    : args.requesterEmail;
  const subject = `${requester} asked for a paid seat in ${args.workspaceName}`;

  const text = [
    `${requester} (${args.requesterEmail}) is a viewer in "${args.workspaceName}" and asked for a paid seat so they can record.`,
    "",
    `Approve or deny the request:`,
    args.manageUrl,
    "",
    `Approving adds one seat to your plan. Nothing changes until you decide.`,
  ].join("\n");

  const html = emailHtml({
    heading: `${requester} wants to record`,
    body: emailParagraph(
      `${emailPerson(requester, args.requesterEmail)} is a viewer in ${escapeHtml(args.workspaceName)} and asked for a paid seat so they can record.`,
    ),
    cta: { label: "Review the request", url: args.manageUrl },
    footnote:
      "Approving adds one seat to your plan. Nothing changes until you decide.",
  });

  return sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.requesterEmail,
  });
}

export type JoinedSeat = {
  planName: string;
  seats: number;
  monthlyUsd: number;
  annual: boolean;
};

// To the owner when an invite is accepted, with the bill if it adds a seat.
export async function sendMemberJoinedEmail(args: {
  to: string;
  joinerName: string | null;
  joinerEmail: string;
  workspaceName: string;
  role: "member" | "viewer";
  seat: JoinedSeat | null;
  membersUrl: string;
}): Promise<boolean> {
  const joiner = args.joinerName?.trim() || args.joinerEmail;
  const subject = `${joiner} joined ${args.workspaceName}`;
  const asRole = args.role === "member" ? "a member" : "a viewer";
  const billing =
    args.role === "viewer"
      ? "Viewers watch and comment, and are free."
      : args.seat
        ? `That adds a paid seat: your ${args.seat.planName} plan is now ${args.seat.seats} seats, $${args.seat.monthlyUsd} a month${args.seat.annual ? ", billed yearly" : ""}. The rest of this billing period goes on your next invoice.`
        : "Members can record and share in the workspace.";

  const text = [
    `${joiner} (${args.joinerEmail}) accepted your invite and joined "${args.workspaceName}" as ${asRole}.`,
    "",
    billing,
    "",
    `Manage members: ${args.membersUrl}`,
  ].join("\n");

  const html = emailHtml({
    heading: subject,
    body:
      emailParagraph(
        `${emailPerson(joiner, args.joinerEmail)} accepted your invite and joined ${escapeHtml(args.workspaceName)} as ${asRole}.`,
      ) + emailParagraph(escapeHtml(billing)),
    cta: { label: "See members", url: args.membersUrl },
    footnote:
      "You can change their role or remove them from the members page at any time.",
  });

  return sendEmail({
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.joinerEmail,
  });
}

// To the person who accepted, saying where they landed and what they can do.
export async function sendWorkspaceJoinedEmail(args: {
  to: string;
  name: string | null;
  workspaceName: string;
  role: "member" | "viewer";
  workspaceUrl: string;
}): Promise<boolean> {
  const first = args.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = first ? `Hi ${first},` : "Hi there,";
  const subject = `You joined ${args.workspaceName} on CaptureFlow`;
  const roleLine =
    args.role === "member"
      ? `You're a member, so you can record and share there. New recordings go to ${args.workspaceName} while it's your selected workspace.`
      : `You're a viewer, so you can watch, comment and react. To record there, use Request to record at the top of the dashboard and the owner can give you a paid seat.`;

  const text = [
    greeting,
    "",
    `You joined "${args.workspaceName}" on CaptureFlow.`,
    "",
    roleLine,
    "",
    `Open the workspace: ${args.workspaceUrl}`,
  ].join("\n");

  const html = emailHtml({
    heading: `Welcome to ${args.workspaceName}`,
    body:
      emailParagraph(escapeHtml(greeting)) +
      emailParagraph(
        `You joined ${escapeHtml(args.workspaceName)} on CaptureFlow. ${escapeHtml(roleLine)}`,
      ),
    cta: { label: `Open ${args.workspaceName}`, url: args.workspaceUrl },
  });

  return sendEmail({ to: args.to, subject, html, text });
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
