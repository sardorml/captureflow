"use client";

import type { ReactNode } from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { Check } from "lucide-react";

// One structure for both pricing plans so every row (badges → title → price →
// CTA → features) lines up across the two cards. Differences are data-only.
export type PlanCardProps = {
  badges: { label: string; icon?: ReactNode; color?: string }[];
  name: string;
  tagline: string;
  price: string;
  period: string;
  note: string;
  cta: {
    label: string;
    href: string;
    primary?: boolean;
    target?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  };
  guarantee: string;
  features: string[];
  highlighted?: boolean;
};

export function PlanCard(props: PlanCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        height: "100%",
        borderColor: props.highlighted ? token.colorPrimary : undefined,
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Flex vertical gap={12} style={{ height: "100%" }}>
        <Space size={8} wrap style={{ minHeight: 24 }}>
          {props.badges.map((b) => (
            <Tag
              key={b.label}
              color={b.color}
              variant="filled"
              style={{
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {b.icon}
              {b.label}
            </Tag>
          ))}
        </Space>

        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {props.name}
          </Typography.Title>
          <Typography.Text type="secondary">{props.tagline}</Typography.Text>
        </div>

        <Flex align="baseline" gap={8}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {props.price}
          </Typography.Title>
          <Typography.Text type="secondary">{props.period}</Typography.Text>
        </Flex>
        <Typography.Text type="secondary" style={{ marginTop: -6 }}>
          {props.note}
        </Typography.Text>

        <Button
          block
          size="large"
          type={props.cta.primary ? "primary" : "default"}
          href={props.cta.href}
          target={props.cta.target}
          rel={
            props.cta.target === "_blank" ? "noopener noreferrer" : undefined
          }
          onClick={props.cta.onClick}
        >
          {props.cta.label}
        </Button>
        <Typography.Text
          type="secondary"
          style={{ textAlign: "center", fontSize: 12 }}
        >
          {props.guarantee}
        </Typography.Text>

        <Divider style={{ margin: 0 }} />

        <Space orientation="vertical" size={10} style={{ width: "100%" }}>
          {props.features.map((label) => (
            <Flex key={label} align="center" gap={12}>
              <Check size={18} color={token.colorSuccess} />
              <Typography.Text>{label}</Typography.Text>
            </Flex>
          ))}
        </Space>
      </Flex>
    </Card>
  );
}
