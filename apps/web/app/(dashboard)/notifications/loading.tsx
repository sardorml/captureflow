import { Card, Skeleton } from "antd";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader title="Notifications" showRecord={false} />
      <Card style={{ marginTop: 40 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    </>
  );
}
