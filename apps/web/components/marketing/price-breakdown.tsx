"use client";

import {
  LOOM_PLANS,
  getCaptureflowMonthly,
  getLoomMonthly,
  getYearlySavings,
  ourPlanFor,
  type LoomPlan,
} from "@/lib/marketing/loom-comparison";
import { cn } from "@/lib/utils";
import { OURS_BG } from "./compare-table";
import { useMessages } from "./i18n-provider";

export const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });

export function PriceBreakdown({
  plan,
  seats,
  className,
}: {
  plan: LoomPlan;
  seats: number;
  className?: string;
}) {
  const copy = useMessages().pricing.compare;
  const { label: planLabel, perSeat } = LOOM_PLANS.find((p) => p.id === plan)!;
  const ours = ourPlanFor(plan);
  const loom = getLoomMonthly(plan, seats);
  const savings = usd(Math.round(getYearlySavings(plan, seats)));
  const fill = (s: string) =>
    s
      .replace("{plan}", planLabel)
      .replace("{seats}", String(seats))
      .replace("{perSeat}", usd(perSeat))
      .replace("{ourPlan}", ours.name)
      .replace("{ourPerSeat}", usd(ours.priceMonthlyUsd))
      .replace("{savings}", savings);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <CostRow
          label={fill(copy.loomRow)}
          detail={fill(copy.loomDetail)}
          monthly={loom}
        />
        <CostRow
          label={fill(copy.captureflowRow)}
          detail={fill(copy.captureflowDetail)}
          monthly={getCaptureflowMonthly(plan, seats)}
          isOurs
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-6 py-4">
          <span className="text-[15px] font-semibold text-fg">
            {copy.saveLabel}
          </span>
          <span
            key={savings}
            className="animate-storage-pop inline-block text-2xl font-bold tracking-[-0.02em] whitespace-nowrap text-accent-strong tabular-nums"
          >
            {fill(copy.saveValue)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-fg-muted">{fill(copy.caption)}</p>
    </div>
  );
}

function CostRow({
  label,
  detail,
  monthly,
  isOurs,
}: {
  label: string;
  detail: string;
  monthly: number;
  isOurs?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-4",
        isOurs ? cn("border-t border-line", OURS_BG) : "",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "text-[15px] font-semibold",
            isOurs ? "text-fg" : "text-fg-muted",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-sm text-fg-muted">{detail}</p>
      </div>
      <span className="flex shrink-0 items-baseline">
        <span
          key={monthly}
          className={cn(
            "animate-storage-pop inline-block text-2xl font-bold tracking-[-0.02em] tabular-nums",
            isOurs ? "text-fg" : "text-fg-muted line-through decoration-2",
          )}
        >
          {usd(monthly)}
        </span>
        <span className="ms-1 text-sm font-medium text-fg-muted">/mo</span>
      </span>
    </div>
  );
}
