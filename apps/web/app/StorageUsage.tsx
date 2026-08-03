"use client";

import type { ReactNode } from "react";
import { Database, Sparkles } from "lucide-react";
import { Button, ProgressBar, Typography } from "@heroui/react";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "./(dashboard)/UpgradeModal";

type StorageUsageProps = {
  usedBytes: number;
  limitBytes: number;
  email: string;
  userId: string;
};

const NEAR_FULL = 0.8;

export function StorageUsage({
  usedBytes,
  limitBytes,
  email,
  userId,
}: StorageUsageProps) {
  const upgrade = (label: string) => (
    <UpgradeModal
      email={email}
      userId={userId}
      trigger={
        <Button variant="primary" size="sm" fullWidth className="mt-3">
          <Sparkles size={14} />
          {label}
        </Button>
      }
    />
  );

  if (limitBytes <= 0) {
    return (
      <Panel>
        <Header />
        <Typography type="body-xs" color="muted" className="mt-2 block">
          Cloud storage is a Pro feature.
        </Typography>
        {upgrade("Upgrade to Pro")}
      </Panel>
    );
  }

  const ratio = Math.min(1, usedBytes / limitBytes);
  const over = usedBytes >= limitBytes;
  const near = !over && ratio >= NEAR_FULL;

  return (
    <Panel>
      <Header trailing={percentLabel(ratio)} />

      <ProgressBar
        value={Math.round(ratio * 100)}
        color={over ? "danger" : near ? "warning" : "accent"}
        aria-label="Storage used"
        className="mt-2.5"
      >
        <ProgressBar.Track className="h-1.5 rounded-full bg-tint-strong">
          {/* Under about half a percent the fill rounds away to nothing, and an
              empty track reads as broken rather than as nearly empty. */}
          <ProgressBar.Fill
            className={cn("rounded-full", usedBytes > 0 && "min-w-1.5")}
          />
        </ProgressBar.Track>
      </ProgressBar>

      <Typography type="body-xs" color="muted" className="mt-2 block">
        <span className="tabular-nums">{formatBytes(usedBytes)}</span> of{" "}
        <span className="tabular-nums">{formatBytes(limitBytes)}</span>
      </Typography>

      {over && upgrade("Get more storage")}
      {near && upgrade("Upgrade to Pro")}
    </Panel>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-3">{children}</div>
  );
}

function Header({ trailing }: { trailing?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
        <Database size={13} />
        Storage
      </span>
      {trailing ? (
        <span className="text-xs font-medium tabular-nums text-fg">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function percentLabel(ratio: number): string {
  const pct = Math.round(ratio * 100);
  return ratio > 0 && pct === 0 ? "<1%" : `${pct}%`;
}
