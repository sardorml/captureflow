import {
  countUnreadNotifications,
  listInvitesForEmail,
  listNotifications,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import type { NotificationFeed } from "./notification-text";

// Pending invites count as unread until they're accepted or declined.
export async function loadNotificationFeed(
  user: { id: string; email: string },
  limit: number,
): Promise<NotificationFeed | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  const [invites, notifications, unread] = await Promise.all([
    listInvitesForEmail(env.DB, user.email),
    listNotifications(env.DB, user.id, limit),
    countUnreadNotifications(env.DB, user.id),
  ]);
  return { invites, notifications, unread: unread + invites.length };
}
