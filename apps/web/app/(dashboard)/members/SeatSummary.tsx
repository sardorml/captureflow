import { Button, Card, Typography } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { getSeatPlan } from "@captureflow/quota";
import type { WorkspaceSeatContext } from "@/lib/billing/seats";
import { UpgradeModal } from "../UpgradeModal";

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

// One line on the members page saying what a member costs here: nothing on
// the free tier, a seat on a paid one. Viewers are free everywhere.
export function SeatSummary({
  context,
  isOwner,
  email,
  userId,
}: {
  context: WorkspaceSeatContext;
  isOwner: boolean;
  email: string;
  userId: string;
}) {
  const { entitlement, subscription, memberCount, viewerCount, offer } =
    context;
  const paid = entitlement.tier === "team";
  const people =
    viewerCount > 0
      ? `${count(memberCount, "member")} and ${count(viewerCount, "viewer")}`
      : count(memberCount, "member");
  const line = subscription
    ? `${people} on ${count(subscription.quantity, "paid seat")}. Every member is a seat; viewers are free.`
    : paid
      ? `${people}. Members are free on this plan.`
      : `${people}. Free plan: each member gets ${entitlement.recordingsPerPerson} recordings of up to ${Math.round((entitlement.maxRecordingMs ?? 0) / 60000)} minutes; viewers watch and comment.`;

  return (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <Typography weight="semibold">
          {paid
            ? `${entitlement.plan ? getSeatPlan(entitlement.plan).name : "Paid"} plan`
            : "Free plan"}
        </Typography>
        <Typography type="body-sm" color="muted" className="mt-0.5 block">
          {line}
        </Typography>
      </div>
      {offer && isOwner ? (
        <UpgradeModal
          email={email}
          userId={userId}
          seat={offer}
          trigger={
            <Button variant="primary" size="sm">
              <Sparkles size={14} />
              Upgrade workspace
            </Button>
          }
        />
      ) : null}
    </Card>
  );
}
