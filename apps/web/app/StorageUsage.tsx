"use client";

import { Sparkles } from "lucide-react";
import { Button, ProgressBar, Typography } from "@heroui/react";
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
        <Typography type="body-xs" color="muted" weight="medium">
          Storage
        </Typography>
        <Typography.Paragraph size="sm" color="muted" className="mt-2">
          Cloud storage is a Pro feature.
        </Typography.Paragraph>
        <UpgradeModal
          email={email}
          userId={userId}
          trigger={
            <Button variant="primary" size="sm" fullWidth>
              <Sparkles size={14} />
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
      <Typography type="body-xs" color="muted" weight="medium">
        Storage
      </Typography>
      <ProgressBar
        value={pct}
        size="sm"
        color={over ? "danger" : near ? "warning" : "accent"}
        aria-label="Storage used"
        className="mt-1"
      />
      <Typography.Paragraph size="sm" color="muted" className="mt-1">
        {formatBytes(usedBytes)} of {formatBytes(limitBytes)}
      </Typography.Paragraph>
      {over && (
        <UpgradeModal
          email={email}
          userId={userId}
          trigger={
            <Button variant="primary" size="sm" fullWidth className="mt-2">
              <Sparkles size={14} />
              Upgrade to Pro
            </Button>
          }
        />
      )}
    </div>
  );
}
