"use client";

import { Sparkles } from "lucide-react";
import { Button, Progress, Typography } from "antd";
import { formatBytes } from "@/lib/format";
import { UpgradeModal } from "./(dashboard)/UpgradeModal";

type StorageUsageProps = {
  usedBytes: number;
  limitBytes: number;
  email: string;
  userId: string;
};

export function StorageUsage({
  usedBytes,
  limitBytes,
  email,
  userId,
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
          userId={userId}
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
        <UpgradeModal
          email={email}
          userId={userId}
          trigger={
            <Button
              type="primary"
              size="small"
              block
              icon={<Sparkles size={14} />}
              style={{ marginTop: 8 }}
            >
              Upgrade to Pro
            </Button>
          }
        />
      )}
    </div>
  );
}
