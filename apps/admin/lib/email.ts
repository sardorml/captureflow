import { headers } from "next/headers";
import type { AdminRole } from "@captureflow/admin";
import { sendTransactional } from "@captureflow/mail";
import { getAdminEnv } from "./env";

/*
 * ADMIN_BASE_URL wins, and the request host is only a development fallback. The
 * Host header is attacker-supplied in the general case, and a credential-setting
 * link built from it is the classic reset-poisoning shape — Cloudflare's routing
 * makes that unreachable here, but a mailed password link is the wrong place to
 * depend on that.
 */
export async function inviteUrl(token: string): Promise<string> {
  const env = await getAdminEnv();
  const base = env?.ADMIN_BASE_URL?.trim().replace(/\/+$/, "");
  if (base) return `${base}/invite/${token}`;

  const h = await headers();
  const host = h.get("host") ?? "admin.captureflow.dev";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}/invite/${token}`;
}

// Best-effort: a false return means the caller must show the operator the link
// to pass on by hand, not that the invite failed. Dev skips the binding so local
// invites go through Resend and reach a real inbox.
export async function sendInviteEmail(
  to: string,
  url: string,
  role: AdminRole,
): Promise<boolean> {
  const env = await getAdminEnv();
  const sent = await sendTransactional(
    {
      from: env?.RESEND_FROM_ADDRESS ?? "CaptureFlow <hello@captureflow.dev>",
      binding: process.env.NODE_ENV === "development" ? undefined : env?.EMAIL,
      resendApiKey: env?.RESEND_API_KEY,
    },
    {
      to,
      subject: "You have been invited to the CaptureFlow admin",
      text: `You have been invited to the CaptureFlow instance admin as ${role}.\n\nSet your password: ${url}\n\nThe link expires in 7 days.`,
      html: `<p>You have been invited to the CaptureFlow instance admin as <strong>${role}</strong>.</p><p><a href="${url}">Set your password</a></p><p>The link expires in 7 days.</p>`,
    },
  );
  if (!sent) console.error("admin invite email not delivered");
  return sent !== null;
}
