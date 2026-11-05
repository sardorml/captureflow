import { Card } from "@/components/ui/card";
import { NotificationList } from "@/app/_components/NotificationList";
import { getAppI18n } from "@/lib/i18n/app/server";
import { loadNotificationFeed } from "@/lib/notification-feed";
import { requireSession } from "@/lib/session-guard";
import { PageHeader } from "../PageHeader";
import { MarkRead } from "./MarkRead";

export const dynamic = "force-dynamic";

const PAGE_LIMIT = 100;

export default async function NotificationsPage() {
  const session = await requireSession();
  const copy = (await getAppI18n()).messages.shell.notifications;
  const feed = await loadNotificationFeed(session.user, PAGE_LIMIT);
  const hasStoredUnread =
    feed?.notifications.some((n) => n.read_at === null) ?? false;

  return (
    <>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        showRecord={false}
      />
      {hasStoredUnread && <MarkRead />}
      <Card className="mt-10 gap-0 overflow-hidden p-0">
        <NotificationList
          invites={feed?.invites ?? []}
          notifications={feed?.notifications ?? []}
          emptyText={copy.pageEmpty}
        />
      </Card>
    </>
  );
}
