import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button, Card, Chip, ProgressBar, Typography } from "@heroui/react";
import {
  UNLIMITED_STORAGE_BYTES,
  getSeatPlan,
  isSelfHosted,
  type SubscriptionStatus,
} from "@captureflow/quota";
import { formatBytes } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  getWorkspaceSeatContext,
  type WorkspaceSeatContext,
} from "@/lib/billing/seats";
import { PageHeader } from "../PageHeader";
import { UpgradeModal } from "../UpgradeModal";

export const dynamic = "force-dynamic";

/*
 * Lemon Squeezy's self-serve portal. A per-subscription link needs an LS API
 * key, which this deployment doesn't hold — only the webhook secret — so
 * subscribers identify themselves by email here instead.
 */
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
  const seatContext = await getWorkspaceSeatContext(current.workspace);

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
            email={user.email}
            userId={user.id}
          />
        ) : null}
      </div>
    </div>
  );
}

// The workspace's plan: its tier and seats, the pooled storage once paid,
// and the upgrade for its owner.
function WorkspacePlanSection({
  workspaceName,
  isOwner,
  context,
  email,
  userId,
}: {
  workspaceName: string;
  isOwner: boolean;
  context: WorkspaceSeatContext;
  email: string;
  userId: string;
}) {
  const { entitlement, subscription, memberCount, usedBytes, offer } = context;
  const paid = entitlement.tier === "team";
  const members = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;
  const line = subscription
    ? `${subscription.quantity} ${subscription.quantity === 1 ? "seat" : "seats"} · ${subscriptionLine(subscription)}`
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

function subscriptionLine(subscription: {
  cycle: "monthly" | "annual";
  current_period_end: number | null;
  cancelled_at: number | null;
}): string {
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
