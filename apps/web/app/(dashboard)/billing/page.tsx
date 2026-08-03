import type { ReactNode } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button, Card, Chip, ProgressBar, Typography } from "@heroui/react";
import {
  ACCOUNT_LIMITS,
  activeArtifactCountForUser,
  getActiveProSubscription,
  getEffectiveLimitsForUser,
  totalStorageForUser,
  type ProSubscriptionRow,
} from "@captureflow/quota";
import { formatBytes } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { PageHeader } from "../PageHeader";
import { UpgradeModal } from "../UpgradeModal";

export const dynamic = "force-dynamic";

/*
 * Lemon Squeezy's self-serve portal. A per-subscription link needs an LS API
 * key, which this deployment doesn't hold — only the webhook secret — so
 * subscribers identify themselves by email here instead.
 */
const LEMON_PORTAL_URL = "https://app.lemonsqueezy.com/my-orders";

const STATUS_LABEL: Record<ProSubscriptionRow["status"], string> = {
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

  const [subscription, usedBytes, artifacts, limits] = env?.DB
    ? await Promise.all([
        getActiveProSubscription(env.DB, user.id),
        totalStorageForUser(env.DB, user.id),
        activeArtifactCountForUser(env.DB, user.id),
        getEffectiveLimitsForUser(env.DB, user.id),
      ])
    : [null, 0, 0, null];

  const storageLimit = limits?.storageBytes ?? ACCOUNT_LIMITS.totalStorageBytes;
  const artifactLimit =
    limits?.activeArtifacts ?? ACCOUNT_LIMITS.activeArtifactsPerAccount;
  const isPro = subscription !== null;

  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Billing"
        subtitle="Your plan, and what you've used of it."
        showRecord={false}
      />

      <div className="mt-6 flex flex-col gap-8">
        <Section label="Plan">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Typography weight="semibold">
                  {isPro ? "Pro" : "Free"}
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
                {subscription
                  ? subscriptionLine(subscription)
                  : `${formatBytes(ACCOUNT_LIMITS.totalStorageBytes)} of storage and up to ${ACCOUNT_LIMITS.activeArtifactsPerAccount} recordings and screenshots.`}
              </Typography>
            </div>

            {isPro ? (
              <a
                href={LEMON_PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="secondary">
                  Manage subscription
                  <ExternalLink size={14} />
                </Button>
              </a>
            ) : (
              <UpgradeModal
                email={user.email}
                userId={user.id}
                trigger={
                  <Button variant="primary" className="shrink-0">
                    <Sparkles size={16} />
                    Upgrade to Pro
                  </Button>
                }
              />
            )}
          </div>
        </Section>

        <Section label="Usage">
          <Meter
            label="Storage"
            value={usedBytes}
            limit={storageLimit}
            format={formatBytes}
          />
          <div className="mt-5">
            <Meter
              label="Recordings and screenshots"
              value={artifacts}
              limit={artifactLimit}
              format={(n) => String(n)}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function subscriptionLine(subscription: ProSubscriptionRow): string {
  const cycle =
    subscription.cycle === "annual" ? "Billed yearly" : "Billed monthly";
  if (!subscription.current_period_end) return cycle;
  const date = formatDate(subscription.current_period_end);
  return subscription.cancelled_at
    ? `${cycle} — access until ${date}`
    : `${cycle} — renews ${date}`;
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

// Pro lifts the artifact cap to MAX_SAFE_INTEGER, which has no meaningful bar
// to draw — say so rather than rendering an empty sliver.
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
