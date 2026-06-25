"use client";

import { Sparkles } from "lucide-react";
import { Button, Progress, Typography } from "antd";
import { formatBytes } from "@/lib/format";
import { UpgradeModal } from "./(dashboard)/UpgradeModal";

const UPGRADE_BASE_URL =
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ||
  "https://sardorml.lemonsqueezy.com/checkout/buy/775fbd57-6dea-4dee-9b27-4cc8aa664916";

function upgradeUrlFor(email: string): string {
  const u = new URL(UPGRADE_BASE_URL);
  u.searchParams.set("billing", "monthly");
  if (email) u.searchParams.set("checkout[email]", email);
  return u.toString();
}

type StorageUsageProps = {
  usedBytes: number;
  limitBytes: number;
  email: string;
};

export function StorageUsage({
  usedBytes,
  limitBytes,
  email,
}: StorageUsageProps) {
  if (limitBytes <= 0) {
    return (
      <div>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          Storage
        </Typography.Text>
        <Typography.Paragraph
          type="secondary"
          style={{ fontSize: 12, marginTop: 8 }}
        >
          Cloud storage is a Pro feature.
        </Typography.Paragraph>
        <UpgradeModal
          email={email}
          trigger={
            <Button
              type="primary"
              size="small"
              block
              icon={<Sparkles size={14} />}
            >
              Upgrade to Pro
            </Button>
          }
        />
      </div>
    );
  }

  const ratio = Math.min(1, usedBytes / limitBytes);
  const pct = Math.round(ratio * 100);
  const over = usedBytes >= limitBytes;
  const near = !over && ratio >= 0.8;

  return (
    <div>
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, fontWeight: 500 }}
      >
        Storage
      </Typography.Text>
      <Progress
        percent={pct}
        size="small"
        status={over ? "exception" : "normal"}
        strokeColor={near ? "#faad14" : undefined}
      />
      <Typography.Paragraph
        type="secondary"
        style={{ fontSize: 12, marginTop: 4, marginBottom: 0 }}
      >
        {formatBytes(usedBytes)} of {formatBytes(limitBytes)}
      </Typography.Paragraph>
      {over && (
        <Button
          type="primary"
          size="small"
          block
          icon={<Sparkles size={14} />}
          href={upgradeUrlFor(email)}
          target="_blank"
          rel="noreferrer noopener"
          style={{ marginTop: 8 }}
        >
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
}
