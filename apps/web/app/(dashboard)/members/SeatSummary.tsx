import { Sparkles } from "lucide-react";
import { getSeatPlan } from "@captureflow/quota";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkspaceSeatContext } from "@/lib/billing/seats";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt, plural } from "@/lib/i18n/format";
import { UpgradeModal } from "../UpgradeModal";

// One line on the members page saying what a member costs here: nothing on
// the free tier, a seat on a paid one. Viewers are free everywhere.
export async function SeatSummary({
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
  const { messages, lang } = await getAppI18n();
  const m = messages.members.seatSummary;
  const paid = entitlement.tier === "team";
  const members = plural(m.members, memberCount, lang);
  const people =
    viewerCount > 0
      ? fmt(m.membersAndViewers, {
          members,
          viewers: plural(m.viewers, viewerCount, lang),
        })
      : members;
  const line = subscription
    ? fmt(m.onPaidSeats, {
        people,
        seats: plural(m.paidSeats, subscription.quantity, lang),
      })
    : paid
      ? fmt(m.membersFree, { people })
      : fmt(m.freePlan, {
          people,
          recordings: String(entitlement.recordingsPerPerson),
          minutes: Math.round((entitlement.maxRecordingMs ?? 0) / 60000),
        });
  const planTitle = !paid
    ? m.freePlanTitle
    : entitlement.plan
      ? fmt(m.planTitle, { plan: getSeatPlan(entitlement.plan).name })
      : m.paidPlanTitle;

  return (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="text-base leading-7 font-semibold text-foreground">
          {planTitle}
        </p>
        <p className="mt-0.5 block text-sm leading-6 text-muted-foreground">
          {line}
        </p>
      </div>
      {offer && isOwner ? (
        <UpgradeModal
          email={email}
          userId={userId}
          seat={offer}
          trigger={
            <Button size="sm">
              <Sparkles size={14} />
              {m.upgrade}
            </Button>
          }
        />
      ) : null}
    </Card>
  );
}
