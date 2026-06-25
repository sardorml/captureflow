import { Skeleton } from "antd";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton active title={{ width: 200 }} paragraph={{ rows: 1 }} />
      <Skeleton active avatar title={false} paragraph={{ rows: 4 }} />
    </div>
  );
}
