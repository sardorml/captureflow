import { Card, Empty } from "antd";
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
      <Card style={{ marginTop: 40 }}>
        <Empty
          description={
            <span>
              You&rsquo;re all caught up. When teammates view your recordings,
              leave feedback, or join your workspace, you&rsquo;ll see it here.
            </span>
          }
        />
      </Card>
    </>
  );
}
