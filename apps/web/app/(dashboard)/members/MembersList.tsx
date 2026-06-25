"use client";

import type { WorkspaceMember } from "@captureflow/quota";
import { LogOut, X } from "lucide-react";
import { Avatar, Button, List, Tag, Typography } from "antd";
import { leaveWorkspaceAction, removeMemberAction } from "./actions";

const { Text } = Typography;

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  return source
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  members: WorkspaceMember[];
  viewerUserId: string;
  viewerIsOwner: boolean;
};

export function MembersList({ members, viewerUserId, viewerIsOwner }: Props) {
  return (
    <List
      header={
        <Text strong>
          Members <Text type="secondary">({members.length})</Text>
        </Text>
      }
      bordered
      dataSource={members}
      rowKey={(m) => m.user_id}
      renderItem={(m) => {
        const isOwnerRow = m.role === "owner";
        const isSelfRow = m.user_id === viewerUserId;
        const action =
          viewerIsOwner && !isOwnerRow ? (
            <form action={removeMemberAction}>
              <input type="hidden" name="userId" value={m.user_id} />
              <Button
                type="text"
                danger
                size="small"
                htmlType="submit"
                aria-label={`Remove ${m.name || m.email}`}
                title="Remove from workspace"
                icon={<X size={16} />}
              />
            </form>
          ) : !viewerIsOwner && isSelfRow ? (
            <form action={leaveWorkspaceAction}>
              <Button
                size="small"
                htmlType="submit"
                aria-label="Leave workspace"
                title="Leave workspace"
                icon={<LogOut size={14} />}
              >
                Leave
              </Button>
            </form>
          ) : null;

        return (
          <List.Item actions={action ? [action] : undefined}>
            <List.Item.Meta
              avatar={
                <Avatar src={m.image || undefined}>
                  {initials(m.name, m.email)}
                </Avatar>
              }
              title={m.name || m.email}
              description={m.email}
            />
            <Tag color={isOwnerRow ? "blue" : "default"}>
              {isOwnerRow ? "Admin" : "Member"}
            </Tag>
          </List.Item>
        );
      }}
    />
  );
}
