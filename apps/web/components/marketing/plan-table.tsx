"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { FREE_TIER, RECOMMENDED_SEAT_PLAN_ID } from "@captureflow/quota";
import { TEAM_CHECKOUT_URL } from "@/lib/marketing/constants";
import { FrameHeader, PILL_OUTLINE, PILL_SOLID } from "./frame";
import { track } from "@/lib/marketing/track";
import type { Messages } from "@/lib/marketing/messages";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type Cell = Messages["pricing"]["table"]["groups"][number]["rows"][number];
type PlanKey = "free" | "light" | "pro";

const PLANS: PlanKey[] = ["free", "light", "pro"];
const HIGHLIGHTED: PlanKey = RECOMMENDED_SEAT_PLAN_ID;
const GRID = "grid grid-cols-4";

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

// The row-by-row comparison under the plan cards on /pricing. The plan header
// sticks under the marketing nav while the groups scroll past it.
export function PlanTable() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const copy = m.pricing.table;
  const plans = m.pricing.plans;

  const upgradeHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;
  const paidCta = (plan: "light" | "pro") => ({
    label: plans[plan].cta,
    href: TEAM_CHECKOUT_URL || upgradeHref,
    onClick: () => track("upgrade_signup_opened", { plan }),
  });
  const ctas: Record<
    PlanKey,
    { label: string; href: string; onClick: () => void }
  > = {
    free: {
      label: plans.free.cta,
      href: lh("/download"),
      onClick: () =>
        track("marketing_cta_clicked", { location: "pricing_table_free" }),
    },
    light: paidCta("light"),
    pro: paidCta("pro"),
  };

  const values = {
    recordings: FREE_TIER.recordingsPerPerson,
    minutes: Math.round(FREE_TIER.maxRecordingMs / 60_000),
  };

  return (
    <>
      <FrameHeader title={copy.heading} subtitle={copy.subtitle} />
      <div className="overflow-x-auto md:overflow-visible">
        <div className="min-w-160">
          <div
            className={cn(
              "z-10 border-t border-line-strong bg-canvas md:sticky md:top-14",
              GRID,
            )}
          >
            <div />
            {PLANS.map((key) => {
              const highlighted = key === HIGHLIGHTED;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between gap-2 border-l border-line-strong px-5 py-3",
                    highlighted && "bg-emphasis",
                  )}
                >
                  <span className="text-base font-medium tracking-[-0.025em] whitespace-nowrap">
                    {plans[key].name}
                  </span>
                  <Link
                    href={ctas[key].href}
                    onClick={ctas[key].onClick}
                    className={cn(
                      highlighted ? PILL_SOLID : PILL_OUTLINE,
                      "hidden h-8 px-3 text-xs lg:inline-flex",
                    )}
                  >
                    {ctas[key].label}
                  </Link>
                </div>
              );
            })}
          </div>

          {copy.groups.map((group) => (
            <section key={group.title}>
              <div className={cn("border-t border-line-strong", GRID)}>
                <h3 className="px-5 pt-8 pb-3 text-lg font-medium tracking-[-0.025em] text-fg-strong">
                  {group.title}
                </h3>
                {PLANS.map((key) => (
                  <div
                    key={key}
                    className={cn(
                      "border-l border-line-strong",
                      key === HIGHLIGHTED && "bg-emphasis",
                    )}
                  />
                ))}
              </div>
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className={cn("border-t border-line-strong", GRID)}
                >
                  <div className="flex items-center px-5 py-3.5 text-sm text-fg">
                    {row.label}
                  </div>
                  {PLANS.map((key) => (
                    <PlanCell
                      key={key}
                      value={row[key]}
                      values={values}
                      highlighted={key === HIGHLIGHTED}
                    />
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function PlanCell({
  value,
  values,
  highlighted,
}: {
  value: Cell[PlanKey];
  values: Record<string, string | number>;
  highlighted: boolean;
}) {
  const label = useMessages().pricing.plans.notIncluded;
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-l border-line-strong px-5 py-3.5 text-sm text-fg",
        highlighted && "bg-emphasis",
      )}
    >
      {value === false ? (
        <Minus
          size={16}
          aria-label={label}
          className="shrink-0 text-fg-subtle"
        />
      ) : (
        <Check size={16} aria-hidden className="shrink-0" />
      )}
      {typeof value === "string" && fill(value, values)}
    </div>
  );
}
