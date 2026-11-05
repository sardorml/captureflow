import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import {
  UNLIMITED_STORAGE_BYTES,
  getSeatPlan,
  isSelfHosted,
  listSeatChangesSince,
  seatPriceUsd,
  type SubscriptionStatus,
  type WorkspaceSubscriptionRow,
} from "@captureflow/quota";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import type { AppMessages } from "@/lib/i18n/app/messages";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt, plural } from "@/lib/i18n/format";
import { formatDate } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";
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
import { SwitchPlanButton } from "./SwitchPlanButton";

export const dynamic = "force-dynamic";

// Fallback for a subscription whose webhook hasn't carried its own portal
// link yet; subscribers identify themselves by email there.
const LEMON_PORTAL_URL = "https://app.lemonsqueezy.com/my-orders";

type BillingCopy = AppMessages["billing"];

const STATUS_KEY: Record<SubscriptionStatus, keyof BillingCopy["status"]> = {
  on_trial: "onTrial",
  active: "active",
  paused: "paused",
  past_due: "pastDue",
  unpaid: "unpaid",
  cancelled: "cancelled",
  expired: "expired",
};

function periodDate(epochSeconds: number, lang: string): string {
  return formatDate(
    epochSeconds * 1000,
    lang,
    { year: "numeric", month: "long", day: "numeric" },
    "en",
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ switch?: string }>;
}) {
  const openSwitch = (await searchParams).switch === "pro";
  const { messages: m } = await getAppI18n();
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
        title={m.billing.page.title}
        subtitle={m.billing.page.subtitle}
        showRecord={false}
      />

      <div className="mt-6 flex flex-col gap-8">
        {seatContext ? (
          <WorkspacePlanSection
            workspaceName={current.workspace.name}
            isOwner={current.role === "owner"}
            context={seatContext}
            nextCharge={nextCharge}
            openSwitch={openSwitch}
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
async function WorkspacePlanSection({
  workspaceName,
  isOwner,
  context,
  nextCharge,
  openSwitch,
  email,
  userId,
}: {
  workspaceName: string;
  isOwner: boolean;
  context: WorkspaceSeatContext;
  nextCharge: NextCharge | null;
  openSwitch: boolean;
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
  const { messages: m, lang } = await getAppI18n();
  const t = m.billing;
  const paid = entitlement.tier === "team";
  const line = subscription
    ? subscription.cycle === "annual"
      ? t.plan.billedYearly
      : t.plan.billedMonthly
    : fmt(t.plan.freeSummary, {
        members: plural(t.counts.members, memberCount, lang),
        recordings: String(entitlement.recordingsPerPerson),
        minutes: Math.round((entitlement.maxRecordingMs ?? 0) / 60000),
      });

  return (
    <Section label={fmt(t.page.workspaceLabel, { name: workspaceName })}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base leading-7 font-semibold text-foreground">
              {paid
                ? entitlement.plan
                  ? getSeatPlan(entitlement.plan).name
                  : t.plan.paid
                : t.plan.free}
            </p>
            {subscription && (
              <Badge
                className={cn(
                  subscription.status === "past_due" &&
                    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                )}
              >
                {t.status[STATUS_KEY[subscription.status]]}
              </Badge>
            )}
          </div>
          <p className="mt-1 block text-sm leading-6 text-muted-foreground">
            {line}
          </p>
        </div>

        {subscription ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {isOwner &&
              subscription.plan === "light" &&
              subscription.cancelled_at === null && (
                <SwitchPlanButton
                  from="light"
                  to="pro"
                  seats={subscription.quantity}
                  cycle={subscription.cycle}
                  defaultOpen={openSwitch}
                />
              )}
            <Button variant="secondary" asChild>
              <a
                href={subscription.portal_url ?? LEMON_PORTAL_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t.page.manageSubscription}
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        ) : offer && isOwner ? (
          <UpgradeModal
            email={email}
            userId={userId}
            seat={offer}
            trigger={
              <Button className="shrink-0">
                <Sparkles size={16} />
                {t.page.upgradeWorkspace}
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
            label={t.page.storage}
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

function prorationLine(
  charge: NextCharge,
  t: BillingCopy["details"],
  lang: string,
): string {
  const amount = usd(Math.abs(charge.prorated));
  if (charge.seatsRemoved === 0) {
    return fmt(plural(t.seatsAdded, charge.seatsAdded, lang), {
      amount: `+${amount}`,
    });
  }
  if (charge.seatsAdded === 0) {
    return fmt(plural(t.seatsRemoved, charge.seatsRemoved, lang), {
      amount: `−${amount}`,
    });
  }
  return fmt(t.seatChanges, {
    amount: `${charge.prorated < 0 ? "−" : "+"}${amount}`,
  });
}

async function BillingDetails({
  subscription,
  viewerCount,
  nextCharge,
}: {
  subscription: WorkspaceSubscriptionRow;
  viewerCount: number;
  nextCharge: NextCharge | null;
}) {
  const { messages: m, lang } = await getAppI18n();
  const t = m.billing.details;
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
    ? periodDate(subscription.current_period_end, lang)
    : null;
  const card = subscription.card_last_four
    ? fmt(t.cardEnding, {
        brand: cardBrand(subscription.card_brand, t.card),
        last4: subscription.card_last_four,
      })
    : null;
  const paidSeats = plural(m.billing.counts.paidSeats, seats, lang);

  return (
    <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-line pt-5 text-sm">
      <Detail label={t.youPay}>
        <span className="font-semibold text-fg">
          {fmt(annual ? t.amountPerYear : t.amountPerMonth, {
            amount: usd(charge),
          })}
        </span>
        <span className="text-fg-muted">
          {" "}
          ·{" "}
          {fmt(plural(annual ? t.seatsYearly : t.seatsMonthly, seats, lang), {
            price: usd(perSeat),
            total: usd(perMonth),
          })}
        </span>
      </Detail>
      <Detail label={ending ? t.ends : t.nextPayment}>
        {ending
          ? (date ?? t.endOfPeriod)
          : date
            ? fmt(t.amountOnDate, {
                amount: usd(Math.max(0, nextCharge?.total ?? charge)),
                date,
              })
            : t.firstPaymentPending}
        {!ending && nextCharge && nextCharge.prorated !== 0 && (
          <span className="mt-0.5 block text-fg-muted">
            {fmt(t.estimate, {
              base: fmt(plural(t.baseForSeats, seats, lang), {
                amount: usd(nextCharge.base),
              }),
              change: prorationLine(nextCharge, t, lang),
            })}
          </span>
        )}
      </Detail>
      <Detail label={t.seats}>
        {viewerCount > 0
          ? fmt(t.seatsAndViewers, {
              seats: paidSeats,
              viewers: plural(m.billing.counts.freeViewers, viewerCount, lang),
            })
          : paidSeats}
      </Detail>
      <Detail label={t.billedTo}>{subscription.ls_customer_email}</Detail>
      {card && (
        <Detail label={t.paymentMethod}>
          {card}
          {subscription.update_payment_url && (
            <>
              {" · "}
              <a
                href={subscription.update_payment_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent-strong hover:underline"
              >
                {t.updateCard}
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

function cardBrand(brand: string | null, fallback: string): string {
  if (!brand) return fallback;
  return CARD_BRANDS[brand.toLowerCase()] ?? brand;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 block text-sm leading-6 font-semibold text-foreground">
        {label}
      </p>
      <Card className="gap-3 p-5">{children}</Card>
    </section>
  );
}

async function Meter({
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
  const t = (await getAppI18n()).messages.billing.page;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm leading-6 font-medium text-foreground">{label}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {unlimited
            ? fmt(t.usedNoLimit, { used: format(value) })
            : fmt(t.usedOfLimit, {
                used: format(value),
                limit: format(limit),
              })}
        </p>
      </div>
      {!unlimited && (
        <Progress
          value={pct}
          aria-label={label}
          className={cn(
            "mt-2 h-1.5 rounded-full bg-tint-strong *:data-[slot=progress-indicator]:rounded-full",
            ratio >= 1
              ? "*:data-[slot=progress-indicator]:bg-destructive"
              : ratio >= 0.8 && "*:data-[slot=progress-indicator]:bg-amber-500",
          )}
        />
      )}
    </div>
  );
}
