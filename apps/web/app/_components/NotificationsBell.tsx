import { Suspense } from "react";
import { loadNotificationFeed } from "@/lib/notification-feed";
import { NotificationsMenu } from "./NotificationsMenu";

const MENU_LIMIT = 6;

// For the viewers: the bell paints at once and fills in when the feed loads.
export function NotificationsBell({
  user,
  base,
}: {
  user: { id: string; email: string };
  base: string;
}) {
  return (
    <Suspense fallback={<NotificationsMenu base={base} feed={null} />}>
      <LoadedBell user={user} base={base} />
    </Suspense>
  );
}

async function LoadedBell({
  user,
  base,
}: {
  user: { id: string; email: string };
  base: string;
}) {
  const feed = await loadNotificationFeed(user, MENU_LIMIT);
  return <NotificationsMenu base={base} feed={feed} />;
}
