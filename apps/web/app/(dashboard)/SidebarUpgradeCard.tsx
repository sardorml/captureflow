import { Button } from "@heroui/react";
import { FREE_TIER, SEAT_PLANS } from "@captureflow/quota";
import type { SeatOffer } from "@/lib/billing/seat-checkout";
import { UpgradeModal } from "./UpgradeModal";

export function SidebarUpgradeCard({
  email,
  userId,
  seat,
}: {
  email: string;
  userId: string;
  seat: SeatOffer;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4 ring-1 ring-line">
      <p className="text-sm font-semibold text-fg-strong">
        Upgrade your workspace
      </p>
      <p className="mt-1 text-xs leading-5 text-fg-muted">
        Free is {FREE_TIER.recordingsPerPerson} recordings per person at data
        saver quality. Paid plans lift every limit, from $
        {SEAT_PLANS[0].priceMonthlyUsd} a member.
      </p>
      <UpgradeModal
        email={email}
        userId={userId}
        seat={seat}
        openOnUpgradeParam
        trigger={
          <Button variant="primary" fullWidth className="mt-3">
            View plans
          </Button>
        }
      />
    </div>
  );
}
