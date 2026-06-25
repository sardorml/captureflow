"use client";

import { useFormStatus } from "react-dom";
import { type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, Flex, Spin, Tag, Typography } from "antd";

type Props = {
  active: boolean;
  icon: ReactNode;
  title: string;
  body: string;
};

export function PolicyCardButton({ active, icon, title, body }: Props) {
  const { pending } = useFormStatus();
  const showActive = active && !pending;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      style={{
        all: "unset",
        display: "block",
        width: "100%",
        cursor: pending ? "progress" : "pointer",
      }}
    >
      <Card hoverable={!pending} variant={showActive ? "borderless" : "outlined"}>
        <Flex gap={12} align="flex-start">
          <span style={{ marginTop: 2, lineHeight: 0 }}>{icon}</span>
          <Flex vertical gap={4} flex={1} style={{ minWidth: 0 }}>
            <Flex gap={8} align="center">
              <Typography.Text strong>{title}</Typography.Text>
              {pending && <Tag color="processing">Updating…</Tag>}
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {body}
            </Typography.Text>
          </Flex>
          {pending ? (
            <Spin size="small" />
          ) : showActive ? (
            <CheckCircle2 size={20} color="#1677ff" />
          ) : null}
        </Flex>
      </Card>
    </button>
  );
}
