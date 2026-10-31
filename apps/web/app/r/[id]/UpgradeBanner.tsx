import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/app/(dashboard)/UpgradeModal";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceSeatContext } from "@/lib/billing/seats";
import type { SeatOffer } from "@/lib/billing/seat-checkout";
import { countUserRecordingsInWorkspace } from "@/lib/recording/quota";
import type { VerifiedSession } from "@/lib/recording/verify-session";

export type FreePlanUsage = { seat: SeatOffer; used: number; limit: number };

// Only the owner can buy seats, matching the sidebar's upgrade card.
export async function getFreePlanUsage(
  visitor: VerifiedSession,
): Promise<FreePlanUsage | null> {
  const current = await resolveCurrentWorkspace(visitor.userId, visitor.name);
  if (current.role !== "owner") return null;
  const [seat, used] = await Promise.all([
    getWorkspaceSeatContext(current.workspace),
    countUserRecordingsInWorkspace(current.workspace.id, visitor.userId),
  ]);
  const limit = seat?.entitlement.recordingsPerPerson;
  if (!seat?.offer || limit == null) return null;
  return { seat: seat.offer, used, limit };
}

export function UpgradeBanner({
  usage,
  email,
  userId,
}: {
  usage: FreePlanUsage;
  email: string;
  userId: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-primary/10 px-4 py-2.5 text-sm text-fg">
      <p>
        <span className="font-semibold">
          {Math.min(usage.used, usage.limit)} of {usage.limit} recordings used
        </span>{" "}
        on the Free plan. Upgrade for unlimited recordings in full quality.
      </p>
      <UpgradeModal
        email={email}
        userId={userId}
        seat={usage.seat}
        trigger={
          <Button size="sm">
            <Sparkles size={14} />
            Upgrade
          </Button>
        }
      />
    </div>
  );
}
