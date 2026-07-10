"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { Card, Flex, Modal, Tag, theme, Typography } from "antd";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";

const BENEFITS = [
  "No cap on the number of recordings & Screenshots",
  "Automatic backups & monitoring",
  "Priority support",
] as const;

type Props = {
  email: string;
  userId: string;
  trigger: ReactNode;
  // Auto-opens when the URL has ?upgrade — the landing/pricing tiers send
  // signed-out buyers through /login?mode=signup&next=/recordings?upgrade=1. Enable on
  // one instance per page or they all pop.
  openOnUpgradeParam?: boolean;
};

// checkout[custom][user_id] is what the lemon-webhook attaches the
// subscription by; the email prefill is UX only and the buyer can edit it.
function checkoutUrlFor(base: string, email: string, userId: string): string {
  const u = new URL(base);
  if (email) u.searchParams.set("checkout[email]", email);
  u.searchParams.set("checkout[custom][user_id]", userId);
  return u.toString();
}

export function UpgradeModal({
  email,
  userId,
  trigger,
  openOnUpgradeParam = false,
}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    () => openOnUpgradeParam && searchParams.has("upgrade"),
  );
  const { token } = theme.useToken();

  // PostHog distinct_id isn't available server-side at render, so append it
  // at click time.
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
    <>
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {trigger}
      </span>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={520}
        title={
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Sparkles size={16} />
            Upgrade to CaptureFlow Pro
          </span>
        }
      >
        <Typography.Paragraph type="secondary">
          Pick how much cloud storage you need for your recordings and
          Screenshots. Billed monthly, cancel anytime.
        </Typography.Paragraph>

        <Flex vertical gap={10}>
          {MANAGED_TIERS.map((tier) => (
            <a
              key={tier.storageGb}
              href={checkoutUrlFor(tier.checkoutUrl, email, userId)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCheckoutClick}
              aria-label={`${tier.storageGb} GB — $${tier.price}/month`}
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
                <Flex align="center" justify="space-between" gap={12}>
                  <Flex align="center" gap={8} wrap>
                    <Typography.Text
                      strong
                      style={{ fontSize: 17, whiteSpace: "nowrap" }}
                    >
                      {tier.storageGb} GB
                    </Typography.Text>
                    {tier.tag === "recommended" ? (
                      <Tag color="blue" variant="filled" style={{ margin: 0 }}>
                        Recommended
                      </Tag>
                    ) : tier.tag === "mostValue" ? (
                      <Tag
                        color="orange"
                        variant="filled"
                        style={{ margin: 0 }}
                      >
                        Most value
                      </Tag>
                    ) : null}
                  </Flex>
                  <Flex
                    align="baseline"
                    gap={2}
                    flex="none"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <Typography.Text strong style={{ fontSize: 20 }}>
                      ${tier.price}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      /month
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Card>
            </a>
          ))}
        </Flex>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "16px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {BENEFITS.map((b) => (
            <li
              key={b}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <Check size={16} />
              <Typography.Text>{b}</Typography.Text>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
