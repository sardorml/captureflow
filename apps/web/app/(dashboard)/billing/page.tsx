import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button, Card, Chip, ProgressBar, Typography } from "@heroui/react";
import {
  UNLIMITED_STORAGE_BYTES,
  getSeatPlan,
  isSelfHosted,
  listSeatChangesSince,
  seatPriceUsd,
  type SubscriptionStatus,
  type WorkspaceSubscriptionRow,
} from "@captureflow/quota";
import { formatBytes } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  getWorkspaceSeatContext,
  type WorkspaceSeatContext,
} from "@/lib/billing/seats";
import {
  estimateNextCharge,
  periodStartOf,
  type NextCharge,
} from "@/lib/billing/next-charge";
import { PageHeader } from "../PageHeader";
import { UpgradeModal } from "../UpgradeModal";

export const dynamic = "force-dynamic";

// Fallback for a subscription whose webhook hasn't carried its own portal
// link yet; subscribers identify themselves by email there.
const LEMON_PORTAL_URL = "https://app.lemonsqueezy.com/my-orders";

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  on_trial: "Trial",
  active: "Active",
  paused: "Paused",
  past_due: "Payment failed",
  unpaid: "Unpaid",
  cancelled: "Cancelled",
  expired: "Expired",
};

function formatDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BillingPage() {
  const session = await requireSession();
  const user = session.user;
  const env = await getAppWebEnv();
  if (isSelfHosted(env)) redirect("/recordings");

  const current = await resolveCurrentWorkspace(user.id, user.name ?? null);
  // The plan, its price and the card on file are the owner's business.
  if (current.role !== "owner") redirect("/recordings");
  const seatContext = await getWorkspaceSeatContext(current.workspace);
  const nextCharge = await loadNextCharge(
    env?.DB,
    seatContext?.subscription ?? null,
  );

  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Billing"
        subtitle="Your plan, and what you've used of it."
        showRecord={false}
      />

      <div className="mt-6 flex flex-col gap-8">
        {seatContext ? (
          <WorkspacePlanSection
            workspaceName={current.workspace.name}
            isOwner={current.role === "owner"}
            context={seatContext}
            nextCharge={nextCharge}
            email={user.email}
            userId={user.id}
          />
        ) : null}
      </div>
    </div>
  );
}

async function loadNextCharge(
  db: D1Database | undefined,
  subscription: WorkspaceSubscriptionRow | null,
): Promise<NextCharge | null> {
  if (!db || !subscription?.current_period_end) return null;
  const periodEndMs = subscription.current_period_end * 1000;
  const changes = await listSeatChangesSince(
    db,
    subscription.ls_subscription_id,
    periodStartOf(periodEndMs, subscription.cycle),
  );
  return estimateNextCharge({
    plan: subscription.plan,
    cycle: subscription.cycle,
    quantity: subscription.quantity,
    periodEndMs,
    changes,
  });
}

// The workspace's plan: its tier and seats, the pooled storage once paid,
// and the upgrade for its owner.
function WorkspacePlanSection({
  workspaceName,
  isOwner,
  context,
  nextCharge,
  email,
  userId,
}: {
  workspaceName: string;
  isOwner: boolean;
  context: WorkspaceSeatContext;
  nextCharge: NextCharge | null;
  email: string;
  userId: string;
}) {
  const {
    entitlement,
    subscription,
    memberCount,
    viewerCount,
    usedBytes,
    offer,
  } = context;
  const paid = entitlement.tier === "team";
  const members = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;
  const line = subscription
    ? subscription.cycle === "annual"
      ? "Billed yearly"
      : "Billed monthly"
    : `${members} · up to ${entitlement.recordingsPerPerson} recordings per person, ${Math.round((entitlement.maxRecordingMs ?? 0) / 60000)} minutes each, data saver quality`;

  return (
    <Section label={`Workspace · ${workspaceName}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Typography weight="semibold">
              {paid
                ? entitlement.plan
                  ? getSeatPlan(entitlement.plan).name
                  : "Paid"
                : "Free"}
            </Typography>
            {subscription && (
              <Chip
                size="sm"
                color={
                  subscription.status === "past_due" ? "warning" : "accent"
                }
              >
                {STATUS_LABEL[subscription.status]}
              </Chip>
            )}
          </div>
          <Typography type="body-sm" color="muted" className="mt-1 block">
            {line}
          </Typography>
        </div>

        {subscription ? (
          <a
            href={subscription.portal_url ?? LEMON_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <Button variant="secondary">
              Manage subscription
              <ExternalLink size={14} />
            </Button>
          </a>
        ) : offer && isOwner ? (
          <UpgradeModal
            email={email}
            userId={userId}
            seat={offer}
            trigger={
              <Button variant="primary" className="shrink-0">
                <Sparkles size={16} />
                Upgrade workspace
              </Button>
            }
          />
        ) : null}
      </div>
      {subscription && (
        <BillingDetails
          subscription={subscription}
          viewerCount={viewerCount}
          nextCharge={nextCharge}
        />
      )}
      {paid && entitlement.storageBytes < UNLIMITED_STORAGE_BYTES && (
        <div className="mt-5">
          <Meter
            label="Workspace storage"
            value={usedBytes}
            limit={entitlement.storageBytes}
            format={formatBytes}
          />
        </div>
      )}
    </Section>
  );
}

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function seatCount(n: number): string {
  return `${n} ${n === 1 ? "seat" : "seats"}`;
}

function prorationLine(charge: NextCharge): string {
  const amount = Math.abs(charge.prorated);
  if (charge.seatsRemoved === 0) {
    return `+${usd(amount)} for ${seatCount(charge.seatsAdded)} added this period`;
  }
  if (charge.seatsAdded === 0) {
    return `−${usd(amount)} credit for ${seatCount(charge.seatsRemoved)} removed this period`;
  }
  return `${charge.prorated < 0 ? "−" : "+"}${usd(amount)} for seat changes this period`;
}

function BillingDetails({
  subscription,
  viewerCount,
  nextCharge,
}: {
  subscription: WorkspaceSubscriptionRow;
  viewerCount: number;
  nextCharge: NextCharge | null;
}) {
  const { plan, cycle, quantity: seats } = subscription;
  const seatPlan = getSeatPlan(plan);
  const annual = cycle === "annual";
  const perSeat = annual
    ? seatPlan.priceAnnualUsdPerMonth
    : seatPlan.priceMonthlyUsd;
  const perMonth = seatPriceUsd(seats, cycle, plan);
  const charge = annual ? perMonth * 12 : perMonth;
  const ending = subscription.cancelled_at !== null;
  const date = subscription.current_period_end
    ? formatDate(subscription.current_period_end)
    : null;
  const card = subscription.card_last_four
    ? `${cardBrand(subscription.card_brand)} ending ${subscription.card_last_four}`
    : null;

  return (
    <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-line pt-5 text-sm">
      <Detail label="You pay">
        <span className="font-semibold text-fg">
          {usd(charge)} {annual ? "a year" : "a month"}
        </span>
        <span className="text-fg-muted">
          {" "}
          · {seats} {seats === 1 ? "seat" : "seats"} × {usd(perSeat)} a month
          {annual ? `, ${usd(perMonth)} a month billed yearly` : ""}
        </span>
      </Detail>
      <Detail label={ending ? "Ends" : "Next payment"}>
        {ending
          ? (date ?? "At the end of this period")
          : date
            ? `${usd(Math.max(0, nextCharge?.total ?? charge))} on ${date}`
            : "When the first payment settles"}
        {!ending && nextCharge && nextCharge.prorated !== 0 && (
          <span className="mt-0.5 block text-fg-muted">
            {usd(nextCharge.base)} for {seatCount(seats)} ·{" "}
            {prorationLine(nextCharge)}, estimated
          </span>
        )}
      </Detail>
      <Detail label="Seats">
        {seats} paid {seats === 1 ? "seat" : "seats"}
        {viewerCount > 0
          ? `, ${viewerCount} free ${viewerCount === 1 ? "viewer" : "viewers"}`
          : ""}
      </Detail>
      <Detail label="Billed to">{subscription.ls_customer_email}</Detail>
      {card && (
        <Detail label="Payment method">
          {card}
          {subscription.update_payment_url && (
            <>
              {" · "}
              <a
                href={subscription.update_payment_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Update
              </a>
            </>
          )}
        </Detail>
      )}
    </dl>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-fg">{children}</dd>
    </>
  );
}

const CARD_BRANDS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
  unionpay: "UnionPay",
};

function cardBrand(brand: string | null): string {
  if (!brand) return "Card";
  return CARD_BRANDS[brand.toLowerCase()] ?? brand;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <Typography type="body-sm" weight="semibold" className="mb-2 block">
        {label}
      </Typography>
      <Card className="p-5">{children}</Card>
    </section>
  );
}

function Meter({
  label,
  value,
  limit,
  format,
}: {
  label: string;
  value: number;
  limit: number;
  format: (n: number) => string;
}) {
  const unlimited = limit >= Number.MAX_SAFE_INTEGER;
  const ratio = unlimited || limit <= 0 ? 0 : Math.min(1, value / limit);
  const pct = Math.round(ratio * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Typography type="body-sm" weight="medium">
          {label}
        </Typography>
        <Typography type="body-sm" color="muted">
          {unlimited
            ? `${format(value)} — no limit`
            : `${format(value)} of ${format(limit)}`}
        </Typography>
      </div>
      {!unlimited && (
        /* The track and fill are children, not something the root draws for
           you — a childless ProgressBar renders an empty grid. */
        <ProgressBar
          value={pct}
          color={ratio >= 1 ? "danger" : ratio >= 0.8 ? "warning" : "accent"}
          aria-label={label}
          className="mt-2"
        >
          <ProgressBar.Track className="h-1.5 rounded-full bg-tint-strong">
            <ProgressBar.Fill className="rounded-full" />
          </ProgressBar.Track>
        </ProgressBar>
      )}
    </div>
  );
}
