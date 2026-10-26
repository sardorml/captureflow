"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@heroui/react";
import { UpgradeModal } from "@/app/(dashboard)/UpgradeModal";
import { formatBytes } from "@/lib/format";
import type { UpgradeOffer } from "@/lib/upgrade-offer";

type Props = { offer: UpgradeOffer; email: string; userId: string };

export function StorageUpgradeBanner({ offer, email, userId }: Props) {
  const used = formatBytes(offer.usedBytes);
  const usage =
    offer.limitBytes === null
      ? `${used} used.`
      : `${used} of ${formatBytes(offer.limitBytes)} used.`;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-accent-soft px-4 py-3 text-sm text-fg">
      <p>
        <span className="font-semibold">{usage}</span> Upgrade for more storage.
      </p>
      <UpgradeModal
        email={email}
        userId={userId}
        trigger={
          <Button size="sm" variant="primary">
            <Sparkles size={14} />
            Upgrade
          </Button>
        }
      />
    </div>
  );
}
