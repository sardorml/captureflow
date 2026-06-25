"use client";

import { useState, type ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button, Modal, Typography } from "antd";

const MONTHLY_PRICE = 9;

// NEXT_PUBLIC_* aren't inlined into client bundles here, so hardcode the public
// checkout link; the env still wins when present.
const CHECKOUT_BASE_URL =
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ||
  "https://sardorml.lemonsqueezy.com/checkout/buy/775fbd57-6dea-4dee-9b27-4cc8aa664916";

const BENEFITS = [
  "200 GB cloud storage (up from 200 MB)",
  "No cap on the number of shares & Snaps",
  "Automatic backups & monitoring",
  "Priority support",
] as const;

type Props = {
  email: string;
  trigger: ReactNode;
};

function checkoutUrlFor(email: string): string | null {
  if (!CHECKOUT_BASE_URL) return null;
  const u = new URL(CHECKOUT_BASE_URL);
  u.searchParams.set("billing", "monthly");
  if (email) u.searchParams.set("checkout[email]", email);
  return u.toString();
}

export function UpgradeModal({ email, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const checkoutUrl = checkoutUrlFor(email);

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
          More cloud storage for your shares and Snaps. Cancel any time.
        </Typography.Paragraph>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            ${MONTHLY_PRICE}
          </Typography.Title>
          <Typography.Text type="secondary">/month</Typography.Text>
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Billed monthly. Cancel anytime.
        </Typography.Text>

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

        {checkoutUrl ? (
          <Button
            type="primary"
            size="large"
            block
            icon={<Sparkles size={16} />}
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 24 }}
          >
            Upgrade now
          </Button>
        ) : (
          <Typography.Paragraph
            type="secondary"
            style={{ marginTop: 24, textAlign: "center" }}
          >
            Checkout isn&apos;t configured for this deployment.
          </Typography.Paragraph>
        )}
      </Modal>
    </>
  );
}
