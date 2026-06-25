"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Globe, Lock, Users } from "lucide-react";
import { Modal, Radio, Space, Spin, Typography } from "antd";

export type Visibility = "public" | "workspace" | "private";

type Props = {
  value: Visibility;
  disabled?: boolean;
  onChange: (next: Visibility) => Promise<void> | void;
  allowPublic?: boolean;
  workspaceName?: string | null;
  trigger: ReactNode;
};

type Option = {
  value: Visibility;
  icon: ReactNode;
  label: string;
  description: string;
};

export function VisibilityDialog({
  value,
  disabled,
  onChange,
  allowPublic = true,
  workspaceName,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const showPublic = allowPublic || value === "public";

  const pick = (next: Visibility) => {
    if (next === value) return;
    startTransition(async () => {
      await onChange(next);
    });
  };

  const options: Option[] = [
    ...(showPublic
      ? [
          {
            value: "public" as const,
            icon: <Globe size={18} />,
            label: "Public",
            description: "Anyone with the link can view.",
          },
        ]
      : []),
    {
      value: "workspace",
      icon: <Users size={18} />,
      label: "Workspace",
      description: workspaceName
        ? `Members of ${workspaceName} can view.`
        : "Members of your workspace can view.",
    },
    {
      value: "private",
      icon: <Lock size={18} />,
      label: "Private",
      description: "Only you can view.",
    },
  ];

  return (
    <>
      <span
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        style={{ display: "contents" }}
      >
        {trigger}
      </span>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title={
          <Space size={8}>
            Visibility
            {pending && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                <Spin size="small" style={{ marginInlineEnd: 6 }} />
                Updating…
              </Typography.Text>
            )}
          </Space>
        }
      >
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          General access
        </Typography.Text>
        <Radio.Group
          value={value}
          disabled={pending || disabled}
          onChange={(e) => pick(e.target.value as Visibility)}
          style={{ display: "block", marginTop: 12, width: "100%" }}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {options.map((o) => (
              <Radio key={o.value} value={o.value} style={{ width: "100%" }}>
                <Space align="start" size={8}>
                  {o.icon}
                  <span>
                    <Typography.Text strong>{o.label}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {o.description}
                    </Typography.Text>
                  </span>
                </Space>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </>
  );
}
