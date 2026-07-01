"use client";

import { Card, Flex, Tag, theme, Typography } from "antd";
import { ArrowRight } from "lucide-react";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";

const { Title, Text } = Typography;

export function ManagedCard() {
  const m = useMessages();
  const { token } = theme.useToken();
  const copy = m.pricing.monthly;

  const checkoutHref = (url: string) =>
    `${url}?utm_source=site&utm_medium=pricing&utm_content=managed`;

  // PostHog distinct_id isn't available server-side at render, so append it at click time.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("checkout_opened", { plan: "managed" });
    const distinctId = getPosthogDistinctId();
    if (!distinctId) return;
    try {
      const url = new URL(e.currentTarget.href);
      url.searchParams.set("checkout[custom][ph_distinct_id]", distinctId);
      e.currentTarget.href = url.toString();
    } catch {
      // Malformed URL — keep the plain href rather than block the click.
    }
  };

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
            <a
              key={tier.storageGb}
              href={checkoutHref(tier.checkoutUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCheckoutClick}
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
                      <Tag color="orange" variant="filled" style={{ margin: 0 }}>
                        {m.pricing.mostValue}
                      </Tag>
                    ) : null}
                  </Flex>
                </Flex>
              </Card>
            </a>
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
