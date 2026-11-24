/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv, runInBackground } from "./cf-env";
import { POSTHOG_HOST, POSTHOG_KEY } from "./public-analytics";

// Mirrored by the labels in packages/admin/src/user-activity.ts.
export type UserEventAction =
  | "account.sign_up"
  | "account.sign_in"
  | "recording.create"
  | "recording.upload"
  | "recording.rename"
  | "recording.visibility"
  | "recording.edit"
  | "recording.background"
  | "recording.transcript_edit"
  | "recording.transcript_reset"
  | "recording.delete"
  | "recording.discard"
  | "recording.chapters_edit"
  | "comment.delete"
  | "reaction.remove"
  | "screenshot.create"
  | "screenshot.rename"
  | "screenshot.visibility"
  | "screenshot.edit"
  | "screenshot.delete"
  | "device.revoke"
  | "account.avatar_upload"
  | "account.avatar_remove"
  | "account.sign_out"
  | "workspace.rename"
  | "workspace.logo_upload"
  | "workspace.logo_remove"
  | "workspace.uploads_policy"
  | "workspace.switch"
  | "workspace.plan_switch"
  | "workspace.leave"
  | "member.invite_revoke"
  | "member.remove"
  | "member.role_change"
  | "member.seat_deny"
  | "member.invite"
  | "member.seat_request"
  | "invite.accept"
  | "invite.decline";

export type UserEvent = {
  userId: string;
  action: UserEventAction;
  subject?: string | null;
  slug?: string | null;
  workspaceId?: string | null;
  detail?: string | null;
};

export const SERVER_EVENT_PREFIX = "cf:";
const MAX_TEXT = 200;

// The browser identifies people by email (see posthog-identify.tsx), so server
// events use the same distinct id to land on the same person.
async function sendUserEvent(event: UserEvent): Promise<void> {
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const user = await env.DB.prepare(
    `SELECT email FROM users WHERE id = ?1 LIMIT 1`,
  )
    .bind(event.userId)
    .first<{ email: string | null }>();
  if (!user?.email) return;
  const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event: `${SERVER_EVENT_PREFIX}${event.action}`,
      distinct_id: user.email,
      timestamp: new Date().toISOString(),
      properties: {
        $lib: "captureflow-server",
        $process_person_profile: true,
        user_id: event.userId,
        subject: event.subject?.slice(0, MAX_TEXT) ?? null,
        slug: event.slug ?? null,
        workspace_id: event.workspaceId ?? null,
        detail: event.detail?.slice(0, MAX_TEXT) ?? null,
        $set: { user_id: event.userId },
      },
    }),
  });
  if (!res.ok) throw new Error(`posthog capture ${res.status}`);
}

// Best effort and off the response path: a failed send never fails an action.
// Self-hosted builds have no key, so nothing leaves the instance.
export function logUserEvent(event: UserEvent): void {
  if (!POSTHOG_KEY) return;
  void runInBackground(sendUserEvent(event));
}
