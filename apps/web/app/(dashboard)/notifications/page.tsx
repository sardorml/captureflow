import { Card } from "@/components/ui/card";
import { NotificationList } from "@/app/_components/NotificationList";
import { loadNotificationFeed } from "@/lib/notification-feed";
import { requireSession } from "@/lib/session-guard";
import { PageHeader } from "../PageHeader";
import { MarkRead } from "./MarkRead";

export const dynamic = "force-dynamic";

const PAGE_LIMIT = 100;

export default async function NotificationsPage() {
  const session = await requireSession();
  const feed = await loadNotificationFeed(session.user, PAGE_LIMIT);
  const hasStoredUnread =
    feed?.notifications.some((n) => n.read_at === null) ?? false;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Invites and changes to your workspaces."
        showRecord={false}
      />
      {hasStoredUnread && <MarkRead />}
      <Card className="mt-10 gap-0 overflow-hidden p-0">
        <NotificationList
          invites={feed?.invites ?? []}
          notifications={feed?.notifications ?? []}
          emptyText="You’re all caught up. When someone invites you, joins your workspace, or changes your role, you’ll see it here."
        />
      </Card>
    </>
  );
}
