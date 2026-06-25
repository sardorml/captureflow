"use client";

import { useTransition } from "react";
import { Monitor } from "lucide-react";
import { Button, Empty, List, Popconfirm, Tag } from "antd";
import type { DeviceTokenRow } from "@/lib/device-tokens";
import { revokeDeviceTokenAction } from "./actions";

type DevicesSectionProps = {
  tokens: DeviceTokenRow[];
};

export function DevicesSection({ tokens }: DevicesSectionProps) {
  if (tokens.length === 0) {
    return (
      <Empty
        description="No connected devices. Open the CaptureFlow desktop app and click Sign in on the record bar to link this account."
        style={{ marginTop: 16 }}
      />
    );
  }
  return (
    <List
      bordered
      style={{ marginTop: 16 }}
      dataSource={tokens}
      renderItem={(token) => <DeviceRow token={token} />}
    />
  );
}

function DeviceRow({ token }: { token: DeviceTokenRow }) {
  const [pending, startTransition] = useTransition();

  const onRevoke = () => {
    startTransition(async () => {
      await revokeDeviceTokenAction(token.id);
    });
  };

  return (
    <List.Item
      actions={[
        <Popconfirm
          key="revoke"
          title="Sign this device out?"
          description="It will need to sign in again to manage shares."
          okText="Revoke"
          okButtonProps={{ danger: true }}
          onConfirm={onRevoke}
        >
          <Button danger size="small" type="text" loading={pending}>
            Revoke
          </Button>
        </Popconfirm>,
      ]}
    >
      <List.Item.Meta
        avatar={<Monitor className="h-4 w-4 text-neutral-500" />}
        title={token.label || "Unlabelled device"}
        description={
          <>
            Added {formatDate(token.createdAt)}
            {token.lastUsedAt
              ? ` · last used ${formatDate(token.lastUsedAt)}`
              : ""}
            {token.lastUsedAt ? null : (
              <Tag style={{ marginLeft: 8 }}>Never used</Tag>
            )}
          </>
        }
      />
    </List.Item>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
