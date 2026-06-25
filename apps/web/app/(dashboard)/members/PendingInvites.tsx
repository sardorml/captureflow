"use client";

import type { WorkspaceInviteRow } from "@captureflow/quota";
import { Clock } from "lucide-react";
import { Button, List, Typography } from "antd";
import { revokeInviteAction } from "./actions";

const { Text } = Typography;

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PendingInvites({
  invites,
  canRevoke,
}: {
  invites: WorkspaceInviteRow[];
  canRevoke: boolean;
}) {
  return (
    <List
      header={
        <Text strong>
          Pending invitations <Text type="secondary">({invites.length})</Text>
        </Text>
      }
      bordered
      dataSource={invites}
      rowKey={(invite) => invite.id}
      renderItem={(invite) => (
        <List.Item
          actions={
            canRevoke
              ? [
                  <form action={revokeInviteAction} key="revoke">
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <Button danger type="text" size="small" htmlType="submit">
                      Revoke
                    </Button>
                  </form>,
                ]
              : undefined
          }
        >
          <List.Item.Meta
            title={invite.email}
            description={
              <Text type="secondary" suppressHydrationWarning>
                <Clock
                  size={12}
                  style={{ verticalAlign: "-2px", marginInlineEnd: 4 }}
                />
                Invited {formatRelative(invite.created_at)}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );
}
