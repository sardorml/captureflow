import { Skeleton } from "antd";

export default function Loading() {
  return (
    <>
      <Skeleton active title={{ width: 240 }} paragraph={{ rows: 1 }} />
      <Skeleton active avatar paragraph={{ rows: 1 }} style={{ marginTop: 24 }} />
    </>
  );
}
