"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import {
  Bot,
  Captions,
  Check,
  Clock,
  Eraser,
  MessageCircle,
  Mic,
  Minus,
  Monitor,
  Palette,
  Scissors,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
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
import { RadioGroup } from "@/components/ui/radio-group";
import { FRAME_CELLS, PILL_OUTLINE, PILL_SOLID } from "./frame";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { SeatsField } from "./pricing-fields";

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

type Cycle = "monthly" | "annual";

export const DEFAULT_SEATS = 5;

export const GRADIENT_BORDER =
  "bg-[linear-gradient(165deg,#a855f7,#f97316_45%,#2563eb)]";

type PlanKey = "free" | "light" | "pro";
type RowKey = keyof ReturnType<typeof useMessages>["pricing"]["plans"]["rows"];
type RowValue = string | boolean;

const ROW_ICONS: Record<RowKey, LucideIcon> = {
  recordings: Video,
  length: Clock,
  quality: Monitor,
  transcripts: Captions,
  editing: Scissors,
  chapters: Sparkles,
  filler: Eraser,
  feedback: MessageCircle,
  agents: Bot,
  voiceover: Mic,
  branding: Palette,
};

const ROW_KEYS = Object.keys(ROW_ICONS) as RowKey[];
const HEADER_ROWS = 3;

// Every column spans the same grid rows through subgrid, so a row lines up
// across plans however its text wraps. Below lg each plan stacks with its labels.
const COLUMN =
  "flex min-w-0 flex-col px-5 pt-6 pb-2 lg:grid lg:grid-rows-subgrid lg:[grid-row:span_var(--rows)]";
const ROW_CELL =
  "flex min-h-14 items-center gap-2.5 border-t border-line-strong py-3 text-sm";

// The copy reads its numbers from the quota package so the page can't drift
// from what the server enforces.
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
  };
  const rowValues = (plan: PlanKey) =>
    ROW_KEYS.map((key) => {
      const value: RowValue = copy.rows[key][plan];
      return typeof value === "string" ? fill(value, values) : value;
    });
  const paid = (id: SeatPlanId) => {
    const plan = getSeatPlan(id);
    const planCopy = copy[id];
    const yearly = (seatPriceUsd(seats, cycle, id) * 12).toLocaleString(
      "en-US",
    );
    return (
      <PlanColumn
        highlighted={RECOMMENDED_SEAT_PLAN_ID === id}
        badge={"badge" in planCopy ? planCopy.badge : undefined}
        name={planCopy.name}
        description={planCopy.description}
        price={`$${annual ? plan.priceAnnualUsdPerMonth : plan.priceMonthlyUsd}`}
        priceKey={`${cycle}-${id}`}
        period={planCopy.period}
        note={
          annual
            ? fill(planCopy.noteAnnual, {
                yearly,
                seats,
                members: seats === 1 ? copy.member : copy.members,
              })
            : planCopy.noteMonthly
        }
        cells={rowValues(id)}
        cta={{
          label: planCopy.cta,
          href: teamHref,
          onClick: () => track("upgrade_signup_opened", { plan: id }),
        }}
      />
    );
  };

  return (
    <div
      className={cn(
        FRAME_CELLS,
        "gap-y-px md:grid-cols-3 lg:grid-cols-4 lg:gap-y-0",
      )}
      style={{ "--rows": HEADER_ROWS + ROW_KEYS.length } as CSSProperties}
    >
      <BillingColumn
        seats={seats}
        onSeatsChange={(n) => {
          setSeats(n);
          onSeatsChange?.(n);
        }}
        cycle={cycle}
        onCycleChange={setCycle}
      />
      <PlanColumn
        name={copy.free.name}
        description={copy.free.description}
        price="$0"
        cells={rowValues("free")}
        cta={{
          label: copy.free.cta,
          href: lh("/download"),
          onClick: () =>
            track("marketing_cta_clicked", { location: "pricing_free" }),
        }}
      />
      {paid("light")}
      {paid("pro")}
    </div>
  );
}

function BillingColumn({
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
  const m = useMessages();
  const copy = m.pricing.controls;
  const labelId = useId();
  const cycles: { key: Cycle; label: string; trailing?: ReactNode }[] = [
    {
      key: "annual",
      label: copy.annually,
      trailing: (
        <span className="rounded-full bg-tint-strong px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-fg">
          {fill(copy.save, { percent: SEAT_ANNUAL_SAVING_PERCENT })}
        </span>
      ),
    },
    { key: "monthly", label: copy.monthly },
  ];

  return (
    <div className={cn(COLUMN, "bg-canvas md:col-span-3 lg:col-span-1")}>
      <div className="pb-5">
        <h3 id={labelId} className="text-lg font-medium tracking-[-0.025em]">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          {copy.note}
        </p>
      </div>
      <div className="pb-6 lg:row-span-2">
        <div className="border-t border-line-strong py-3">
          <SeatsField seats={seats} onChange={onSeatsChange} compact />
        </div>
        <RadioGroup
          value={cycle}
          onValueChange={(v) => onCycleChange(v as Cycle)}
          aria-labelledby={labelId}
          className="gap-0"
        >
          {cycles.map((option) => (
            <RadioGroupPrimitive.Item
              key={option.key}
              value={option.key}
              className="group flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-line-strong text-sm text-fg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:text-fg"
            >
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-fg/40 group-data-[state=checked]:border-fg">
                <span className="size-2.5 scale-0 rounded-full bg-fg transition-transform group-data-[state=checked]:scale-100 motion-reduce:transition-none" />
              </span>
              {option.label}
              <span className="ml-auto">{option.trailing}</span>
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroup>
      </div>
      {ROW_KEYS.map((key) => {
        const Icon = ROW_ICONS[key];
        return (
          <div key={key} className={cn(ROW_CELL, "hidden lg:flex")}>
            <Icon size={16} className="shrink-0 text-fg-muted" />
            <span>{m.pricing.plans.rows[key].label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PlanColumn({
  name,
  badge,
  description,
  price,
  priceKey,
  period,
  note,
  cells,
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
  cells: readonly RowValue[];
  cta: { label: string; href: string; onClick: () => void };
  highlighted?: boolean;
}) {
  const copy = useMessages().pricing.plans;
  return (
    <div className={cn(COLUMN, highlighted ? "bg-emphasis" : "bg-canvas")}>
      <div className="pb-5">
        <div className="flex min-h-7 items-center justify-between gap-2">
          <h3 className="text-lg font-medium tracking-[-0.025em]">{name}</h3>
          {badge && (
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-fg">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          {description}
        </p>
      </div>
      <p className="pb-5 text-4xl font-medium tracking-[-0.04em]">
        <span key={priceKey} className="animate-storage-pop inline-block">
          {price}
        </span>
        {period && (
          <span className="ms-1.5 text-lg font-normal tracking-normal text-fg-muted">
            {period}
          </span>
        )}
      </p>
      <div className="pb-6">
        <Link
          href={cta.href}
          onClick={cta.onClick}
          className={cn(
            highlighted ? PILL_SOLID : PILL_OUTLINE,
            "w-full px-3 text-sm",
          )}
        >
          {cta.label}
        </Link>
        {note && (
          <p className="mt-3 text-center text-[13px] leading-snug text-fg-muted">
            {note}
          </p>
        )}
      </div>
      {cells.map((value, i) => (
        <div key={ROW_KEYS[i]} className={ROW_CELL}>
          <span className="flex-1 text-fg-muted lg:hidden">
            {copy.rows[ROW_KEYS[i]!].label}
          </span>
          {value === false ? (
            <Minus
              size={16}
              aria-label={copy.notIncluded}
              className="shrink-0 text-fg-subtle"
            />
          ) : (
            <Check size={16} className="shrink-0 text-fg" aria-hidden />
          )}
          {value === true && (
            <span className="sr-only lg:not-sr-only">{copy.included}</span>
          )}
          {typeof value === "string" && <span>{value}</span>}
        </div>
      ))}
    </div>
  );
}
