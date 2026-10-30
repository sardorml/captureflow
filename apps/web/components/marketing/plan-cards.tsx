"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkle } from "lucide-react";
import {
  FREE_TIER,
  RECOMMENDED_SEAT_PLAN_ID,
  SEAT_ANNUAL_SAVING_PERCENT,
  getSeatPlan,
  seatPriceUsd,
  type SeatPlanId,
} from "@captureflow/quota";
import { TEAM_CHECKOUT_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { RadioChoice, SeatsField } from "./pricing-fields";

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

type Cycle = "monthly" | "annual";

export const DEFAULT_SEATS = 5;

export const GRADIENT_BORDER =
  "bg-[linear-gradient(165deg,#a855f7,#f97316_45%,#2563eb)]";

// Four plans side by side: Free, Light and Pro at one price per member, and
// Enterprise on custom terms. The copy reads its numbers from the quota
// package so the page can't drift from what the server enforces.
export function PlanCards({
  onSeatsChange,
}: {
  onSeatsChange?: (seats: number) => void;
} = {}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const copy = m.pricing.plans;
  const [seats, setSeats] = useState(DEFAULT_SEATS);
  const [cycle, setCycle] = useState<Cycle>("monthly");

  // Checkout requires an account: the billing webhook attaches the purchase by
  // the signed-in user and workspace, so until a public checkout link exists
  // the Team button funnels through signup into the dashboard upgrade dialog.
  const upgradeHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;
  const teamHref = TEAM_CHECKOUT_URL || upgradeHref;

  const annual = cycle === "annual";
  const values = {
    recordings: FREE_TIER.recordingsPerPerson,
    minutes: Math.round(FREE_TIER.maxRecordingMs / 60_000),
    seats,
    members: seats === 1 ? copy.light.member : copy.light.members,
  };
  const paid = (id: SeatPlanId, highlighted: boolean) => {
    const plan = getSeatPlan(id);
    const planCopy = copy[id];
    const perSeat = annual ? plan.priceAnnualUsdPerMonth : plan.priceMonthlyUsd;
    const yearly = (seatPriceUsd(seats, cycle, id) * 12).toLocaleString(
      "en-US",
    );
    const planValues = { ...values, perSeat };
    return (
      <PlanCard
        highlighted={highlighted}
        badge={"badge" in planCopy ? planCopy.badge : undefined}
        name={planCopy.name}
        description={planCopy.description}
        price={annual ? `$${yearly}` : `$${plan.priceMonthlyUsd}`}
        priceKey={`${cycle}-${seats}`}
        period={annual ? planCopy.periodAnnual : planCopy.period}
        note={annual ? fill(planCopy.rateAnnual, planValues) : undefined}
        featuresHeading={planCopy.featuresHeading}
        features={planCopy.features.map((f) => fill(f, planValues))}
        cta={{
          label: planCopy.cta,
          href: teamHref,
          onClick: () => track("upgrade_signup_opened", { plan: id }),
        }}
      />
    );
  };

  return (
    <div>
      <PricingControls
        seats={seats}
        onSeatsChange={(n) => {
          setSeats(n);
          onSeatsChange?.(n);
        }}
        cycle={cycle}
        onCycleChange={setCycle}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlanCard
          name={copy.free.name}
          description={copy.free.description}
          note={annual ? "" : undefined}
          price="$0"
          featuresHeading={copy.free.featuresHeading}
          features={copy.free.features.map((f) => fill(f, values))}
          cta={{
            label: copy.free.cta,
            href: lh("/download"),
            onClick: () =>
              track("marketing_cta_clicked", { location: "pricing_free" }),
          }}
        />
        {paid("light", RECOMMENDED_SEAT_PLAN_ID === "light")}
        {paid("pro", RECOMMENDED_SEAT_PLAN_ID === "pro")}
        <PlanCard
          name={copy.enterprise.name}
          description={copy.enterprise.description}
          note={annual ? "" : undefined}
          price={copy.enterprise.price}
          featuresHeading={copy.enterprise.featuresHeading}
          features={copy.enterprise.features}
          cta={{
            label: copy.enterprise.cta,
            href: lh("/enterprise"),
            onClick: () =>
              track("marketing_cta_clicked", {
                location: "pricing_enterprise",
              }),
          }}
        />
      </div>
    </div>
  );
}

function PricingControls({
  seats,
  onSeatsChange,
  cycle,
  onCycleChange,
}: {
  seats: number;
  onSeatsChange: (seats: number) => void;
  cycle: Cycle;
  onCycleChange: (cycle: Cycle) => void;
}) {
  const copy = useMessages().pricing.controls;
  const cycles: { key: Cycle; label: string }[] = [
    { key: "monthly", label: copy.monthly },
    { key: "annual", label: copy.annually },
  ];

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      <SeatsField seats={seats} onChange={onSeatsChange} />
      <RadioChoice
        label={copy.billing}
        value={cycle}
        options={cycles}
        onChange={onCycleChange}
        trailing={
          <span className="inline-flex items-center rounded bg-primary/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
            {fill(copy.save, { percent: SEAT_ANNUAL_SAVING_PERCENT })}
          </span>
        }
      />
    </div>
  );
}

function PlanCard({
  name,
  badge,
  description,
  price,
  priceKey,
  period,
  note,
  featuresHeading,
  features,
  cta,
  highlighted = false,
}: {
  name: string;
  badge?: string;
  description: string;
  price: string;
  priceKey?: string;
  period?: string;
  note?: string;
  featuresHeading: string;
  features: readonly string[];
  cta: { label: string; href: string; onClick: () => void };
  highlighted?: boolean;
}) {
  const card = (
    <div
      className={cn(
        "flex h-full flex-col text-fg",
        highlighted
          ? "rounded-[10px] p-[23px] sm:px-[31px] sm:py-[27px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))]"
          : "rounded-xl border border-line bg-panel p-6 sm:px-8 sm:py-7",
      )}
    >
      <div
        className={cn(
          "mb-4 min-h-7 items-center",
          badge ? "flex" : "hidden xl:flex",
        )}
      >
        {badge && (
          <span className="inline-flex items-center rounded bg-primary/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
            {badge}
          </span>
        )}
      </div>
      <h3 className="flex items-start gap-1 text-4xl font-bold tracking-[-0.03em]">
        {name}
        {highlighted && (
          <Sparkle size={16} className="shrink-0 fill-current text-fg" />
        )}
      </h3>
      <p
        className={cn(
          "mt-2 min-h-[3lh] text-[15px] leading-relaxed",
          "text-fg-muted",
        )}
      >
        {description}
      </p>

      <p className="mt-4 text-4xl font-bold tracking-[-0.03em]">
        <span key={priceKey} className="animate-storage-pop inline-block">
          {price}
        </span>
        {period && (
          <span className="ms-2 align-baseline text-sm font-normal text-fg-muted">
            {period}
          </span>
        )}
      </p>
      {note !== undefined && (
        <p className="mt-1 min-h-10 text-sm text-fg-muted">{note}</p>
      )}

      <Link
        href={cta.href}
        onClick={cta.onClick}
        className={cn(
          "mt-5 inline-flex h-11 w-fit shrink-0 items-center justify-center rounded-[10px] px-6 text-sm font-semibold transition-colors motion-reduce:transition-none",
          highlighted
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-fg-strong/10 text-fg-strong hover:bg-fg-strong/15",
        )}
      >
        {cta.label}
      </Link>

      <p className="mt-6 text-sm font-semibold">{featuresHeading}</p>
      <ul className="mt-3 flex list-none flex-col gap-2.5">
        {features.map((label) => (
          <li key={label} className="flex items-start gap-2.5 text-[15px]">
            <Check size={16} className={cn("mt-1 shrink-0", "text-fg-muted")} />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (!highlighted) return card;
  return <div className={cn("rounded-xl p-0.5", GRADIENT_BORDER)}>{card}</div>;
}
