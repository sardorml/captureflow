import { headers } from "next/headers";
import type { AdminRole } from "@captureflow/admin";
import { getAdminEnv } from "./env";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

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
// to pass on by hand, not that the invite failed.
export async function sendInviteEmail(
  to: string,
  url: string,
  role: AdminRole,
): Promise<boolean> {
  const env = await getAdminEnv();
  const apiKey = env?.RESEND_API_KEY;
  if (!apiKey) return false;

  const text = `You have been invited to the CaptureFlow instance admin as ${role}.\n\nSet your password: ${url}\n\nThe link expires in 7 days.`;
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_ADDRESS ?? "CaptureFlow <hello@captureflow.dev>",
        to: [to],
        subject: "You have been invited to the CaptureFlow admin",
        text,
        html: `<p>You have been invited to the CaptureFlow instance admin as <strong>${role}</strong>.</p><p><a href="${url}">Set your password</a></p><p>The link expires in 7 days.</p>`,
      }),
    });
    if (!res.ok) {
      console.error("admin invite email failed", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("admin invite email threw", err);
    return false;
  }
}
