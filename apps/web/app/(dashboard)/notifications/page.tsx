import { Card, EmptyState } from "@heroui/react";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Activity from your workspaces will show up here."
        showRecord={false}
      />
      <Card className="mt-10 p-6">
        <EmptyState className="text-center text-sm text-fg-muted">
          You&rsquo;re all caught up. When teammates view your recordings, leave
          feedback, or join your workspace, you&rsquo;ll see it here.
        </EmptyState>
      </Card>
    </>
  );
}
