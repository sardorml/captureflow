"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Label, Radio, RadioGroup, TextField } from "@heroui/react";
import {
  Camera,
  Captions,
  Check,
  Cloud,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  MessageSquare,
  PenLine,
  Scissors,
  Sparkle,
  Users,
} from "lucide-react";
import {
  FREE_TIER,
  SEAT_ANNUAL_SAVING_PERCENT,
  SEAT_PLAN,
  seatPriceUsd,
} from "@captureflow/quota";
import { TEAM_CHECKOUT_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import type { Messages } from "@/lib/marketing/messages";
import { cn } from "@/lib/utils";
import { LANDING_FORM_FIELDS } from "./form-parts";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const INCLUDE_ICONS = [
  LayoutGrid,
  Users,
  Camera,
  Captions,
  Scissors,
  Lock,
  MessageSquare,
  ImageIcon,
  PenLine,
];

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

type Cycle = "monthly" | "annual";

export const DEFAULT_SEATS = 5;
const MAX_SEATS = 9999;

export const GRADIENT_BORDER =
  "bg-[linear-gradient(165deg,#a855f7,#f97316_45%,#2563eb)]";

// Three plans side by side: Free, Team at one price per member, and
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
  const total = (seatPriceUsd(seats, cycle) * 12).toLocaleString("en-US");
  const values = {
    recordings: FREE_TIER.recordingsPerPerson,
    minutes: Math.round(FREE_TIER.maxRecordingMs / 60_000),
    perSeat: annual
      ? SEAT_PLAN.priceAnnualUsdPerMonth
      : SEAT_PLAN.priceMonthlyUsd,
    seats,
    members: seats === 1 ? copy.team.member : copy.team.members,
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
      <div className="grid gap-4 md:grid-cols-3">
        <PlanCard
          name={copy.free.name}
          description={copy.free.description}
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
        <PlanCard
          highlighted
          badge={copy.team.badge}
          name={copy.team.name}
          description={copy.team.description}
          price={annual ? `$${total}` : `$${SEAT_PLAN.priceMonthlyUsd}`}
          priceKey={`${cycle}-${seats}`}
          period={annual ? copy.team.periodAnnual : copy.team.period}
          note={annual ? fill(copy.team.rateAnnual, values) : undefined}
          featuresHeading={copy.team.featuresHeading}
          features={copy.team.features.map((f) => fill(f, values))}
          cta={{
            label: copy.team.cta,
            href: teamHref,
            onClick: () => track("upgrade_signup_opened", { plan: "seats" }),
          }}
        />
        <PlanCard
          name={copy.enterprise.name}
          description={copy.enterprise.description}
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
    <div
      className={cn(
        "mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4",
        LANDING_FORM_FIELDS,
      )}
    >
      <TextField
        type="number"
        value={String(seats)}
        onChange={(v) => {
          const n = Number.parseInt(v, 10);
          onSeatsChange(
            Number.isFinite(n) ? Math.min(MAX_SEATS, Math.max(1, n)) : 1,
          );
        }}
        className="flex flex-row items-center gap-3"
      >
        <Label className="text-base font-semibold text-fg">
          {copy.teamSize}
        </Label>
        <Input
          min={1}
          max={MAX_SEATS}
          inputMode="numeric"
          autoComplete="off"
          className="w-24 text-center tabular-nums"
        />
        <span className="text-base text-fg-muted">{copy.members}</span>
      </TextField>
      <RadioGroup
        value={cycle}
        onChange={(v) => onCycleChange(v as Cycle)}
        orientation="horizontal"
        className="flex-row items-center gap-3"
      >
        <Label className="text-base font-semibold text-fg">
          {copy.billing}
        </Label>
        {cycles.map((c) => (
          <Radio key={c.key} value={c.key}>
            {({ isSelected }) => (
              <Radio.Content className="flex cursor-pointer items-center gap-2 text-base text-fg">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none",
                    isSelected ? "border-accent" : "border-fg/60",
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full bg-accent transition-transform motion-reduce:transition-none",
                      isSelected ? "scale-100" : "scale-0",
                    )}
                  />
                </span>
                {c.label}
              </Radio.Content>
            )}
          </Radio>
        ))}
        <span className="inline-flex items-center rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
          {fill(copy.save, { percent: SEAT_ANNUAL_SAVING_PERCENT })}
        </span>
      </RadioGroup>
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
        "flex h-full flex-col p-6 text-fg sm:p-8",
        highlighted
          ? "rounded-[26px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))]"
          : "rounded-[28px] border border-line bg-panel",
      )}
    >
      <div
        className={cn(
          "mb-4 min-h-7 items-center",
          badge ? "flex" : "hidden md:flex",
        )}
      >
        {badge && (
          <span className="inline-flex items-center rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
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
          "mt-2 min-h-18 text-[15px] leading-relaxed",
          "text-fg-muted",
        )}
      >
        {description}
      </p>

      <p className="mt-6 text-4xl font-bold tracking-[-0.03em]">
        <span key={priceKey} className="animate-storage-pop inline-block">
          {price}
        </span>
        {period && (
          <span className="ms-2 align-baseline text-sm font-normal text-fg-muted">
            {period}
          </span>
        )}
      </p>
      <p className="mt-1 min-h-10 text-sm text-fg-muted">{note}</p>

      <Link
        href={cta.href}
        onClick={cta.onClick}
        className={cn(
          "mt-6 inline-flex h-11 w-fit shrink-0 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors motion-reduce:transition-none",
          highlighted
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-accent/10 text-fg hover:bg-accent/20",
        )}
      >
        {cta.label}
      </Link>

      <p className="mt-8 text-sm font-semibold">{featuresHeading}</p>
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
  return (
    <div
      className={cn("rounded-[28px] p-0.5 md:-translate-y-3", GRADIENT_BORDER)}
    >
      {card}
    </div>
  );
}

// The feature list the dashboard's upgrade dialog shows beside the Team panel.
export function PlanIncludes({
  copy,
}: {
  copy: Messages["pricing"]["includes"];
}) {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <p className="text-base font-semibold text-fg">{copy.heading}</p>
      <ul className="mt-4 flex list-none flex-col gap-3">
        {copy.items.map((label, i) => {
          const Icon = INCLUDE_ICONS[i] ?? Cloud;
          return (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-tint text-fg">
                <Icon size={15} />
              </span>
              <span className="text-[15px] text-fg">{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
