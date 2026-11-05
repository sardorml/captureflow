import { Button } from "@/components/ui/button";
import { FREE_TIER, SEAT_PLANS } from "@captureflow/quota";
import type { SeatOffer } from "@/lib/billing/seat-checkout";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { UpgradeModal } from "./UpgradeModal";

export async function SidebarUpgradeCard({
  email,
  userId,
  seat,
}: {
  email: string;
  userId: string;
  seat: SeatOffer;
}) {
  const copy = (await getAppI18n()).messages.shell.upgradeCard;
  return (
    <div className="rounded-2xl bg-panel p-4 ring-1 ring-line">
      <p className="text-sm font-semibold text-fg-strong">{copy.title}</p>
      <p className="mt-1 text-xs leading-5 text-fg-muted">
        {fmt(copy.description, {
          recordings: FREE_TIER.recordingsPerPerson,
          price: `$${SEAT_PLANS[0].priceMonthlyUsd}`,
        })}
      </p>
      <UpgradeModal
        email={email}
        userId={userId}
        seat={seat}
        openOnUpgradeParam
        trigger={<Button className="mt-3 w-full">{copy.viewPlans}</Button>}
      />
    </div>
  );
}
