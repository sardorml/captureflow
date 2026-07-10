"use client";

import Link from "next/link";
import { Card, Flex, Tag, theme, Typography } from "antd";
import { ArrowRight } from "lucide-react";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const { Title, Text } = Typography;

export function ManagedCard() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const { token } = theme.useToken();
  const copy = m.pricing.monthly;

  // Checkout requires an account: the lemon-webhook attaches the purchase by
  // the signed-in user_id, so anonymous checkouts can strand a paid
  // subscription. Funnel through signup into the dashboard upgrade modal.
  const signupHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;

  return (
    <Card
      style={{ height: "100%", borderColor: token.colorPrimary }}
      styles={{ body: { padding: 20 } }}
    >
      <Flex vertical gap={12} style={{ height: "100%" }}>
        <Flex gap={8} wrap style={{ minHeight: 24 }}>
          <Tag color="blue" variant="filled" style={{ margin: 0 }}>
            {copy.badgePro}
          </Tag>
          <Tag variant="filled" style={{ margin: 0 }}>
            {copy.badgeCycle}
          </Tag>
        </Flex>

        <div>
          <Title level={3} style={{ margin: 0 }}>
            {copy.title}
          </Title>
          <Text type="secondary">{copy.subtitle}</Text>
        </div>

        <Flex vertical gap={10}>
          {MANAGED_TIERS.map((tier) => (
            <Link
              key={tier.storageGb}
              href={signupHref}
              onClick={() =>
                track("upgrade_signup_opened", {
                  plan: "managed",
                  storage_gb: tier.storageGb,
                })
              }
              aria-label={`${tier.storageGb} GB — $${tier.price}${copy.period}`}
            >
              <Card
                hoverable
                size="small"
                styles={{ body: { padding: 14 } }}
                style={{
                  borderColor:
                    tier.tag === "recommended"
                      ? token.colorPrimary
                      : tier.tag === "mostValue"
                        ? token.colorWarning
                        : undefined,
                }}
              >
                <Flex vertical gap={4}>
                  <Flex align="center" justify="space-between" gap={12}>
                    <Text strong style={{ fontSize: 17, whiteSpace: "nowrap" }}>
                      {tier.storageGb} GB
                    </Text>
                    <Flex
                      align="baseline"
                      gap={2}
                      flex="none"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Text strong style={{ fontSize: 20 }}>
                        ${tier.price}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {copy.period}
                      </Text>
                      <ArrowRight
                        size={16}
                        style={{
                          marginInlineStart: 6,
                          color: token.colorTextTertiary,
                        }}
                      />
                    </Flex>
                  </Flex>
                  <Flex align="center" gap={8} wrap>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {m.pricing.tierStorageLabel}
                    </Text>
                    {tier.tag === "recommended" ? (
                      <Tag color="blue" variant="filled" style={{ margin: 0 }}>
                        {m.pricing.recommended}
                      </Tag>
                    ) : tier.tag === "mostValue" ? (
                      <Tag
                        color="orange"
                        variant="filled"
                        style={{ margin: 0 }}
                      >
                        {m.pricing.mostValue}
                      </Tag>
                    ) : null}
                  </Flex>
                </Flex>
              </Card>
            </Link>
          ))}
        </Flex>

        <Text
          type="secondary"
          style={{ marginTop: "auto", textAlign: "center", fontSize: 12 }}
        >
          {copy.note}
        </Text>
      </Flex>
    </Card>
  );
}
