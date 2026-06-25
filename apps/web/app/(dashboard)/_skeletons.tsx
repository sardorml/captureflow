"use client";

import { Card, Flex, Skeleton } from "antd";

export function PageHeaderSkeleton({
  showRecord = true,
}: {
  showRecord?: boolean;
}) {
  return (
    <Flex wrap align="flex-end" justify="space-between" gap={16}>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 320 }}>
        <Skeleton
          active
          title={{ width: "55%" }}
          paragraph={{ rows: 1, width: "85%" }}
        />
      </div>
      {showRecord && <Skeleton.Button active style={{ width: 140 }} />}
    </Flex>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      style={{
        marginTop: 24,
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} loading />
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Card style={{ marginTop: 24 }}>
      <Flex vertical gap={16}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            active
            avatar
            title={false}
            paragraph={{ rows: 1, width: "60%" }}
          />
        ))}
      </Flex>
    </Card>
  );
}

export function FormSectionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Flex vertical gap={24} style={{ marginTop: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} loading />
      ))}
    </Flex>
  );
}

export function DashboardLoading({
  variant,
  showRecord = true,
}: {
  variant: "grid" | "rows" | "form" | "empty";
  showRecord?: boolean;
}) {
  return (
    <div>
      <PageHeaderSkeleton showRecord={showRecord} />
      {variant === "grid" && <CardGridSkeleton />}
      {variant === "rows" && <RowListSkeleton />}
      {variant === "form" && <FormSectionsSkeleton />}
      {variant === "empty" && (
        <Card style={{ marginTop: 40, height: 192 }} loading />
      )}
    </div>
  );
}
