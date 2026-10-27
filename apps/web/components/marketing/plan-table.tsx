"use client";

import Link from "next/link";
import { Check, Sparkle } from "lucide-react";
import { FREE_TIER, RECOMMENDED_SEAT_PLAN_ID } from "@captureflow/quota";
import { TEAM_CHECKOUT_URL } from "@/lib/marketing/constants";
import { GRADIENT_BORDER } from "./plan-cards";
import { track } from "@/lib/marketing/track";
import type { Messages } from "@/lib/marketing/messages";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type Cell = Messages["pricing"]["table"]["groups"][number]["rows"][number];
type PlanKey = "free" | "light" | "pro" | "enterprise";

const PLANS: PlanKey[] = ["free", "light", "pro", "enterprise"];
const HIGHLIGHTED: PlanKey = RECOMMENDED_SEAT_PLAN_ID;
const GRID =
  "grid-cols-[minmax(150px,1.3fr)_repeat(4,minmax(130px,1fr))] md:grid-cols-[minmax(190px,1.3fr)_repeat(4,minmax(140px,1fr))]";

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
    enterprise: {
      label: plans.enterprise.cta,
      href: lh("/enterprise"),
      onClick: () =>
        track("marketing_cta_clicked", {
          location: "pricing_table_enterprise",
        }),
    },
  };

  const values = {
    recordings: FREE_TIER.recordingsPerPerson,
    minutes: Math.round(FREE_TIER.maxRecordingMs / 60_000),
  };

  return (
    <div className="mt-20">
      <h3 className="mb-8 text-center text-3xl font-bold tracking-[-0.02em] text-fg md:text-4xl">
        {copy.heading}
      </h3>
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:overflow-visible md:px-0">
        <div className="min-w-200">
          <div
            className={cn(
              "z-10 grid border-b border-line bg-canvas py-3 md:sticky md:top-20",
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
                    "mx-1 rounded-2xl",
                    highlighted
                      ? cn("p-0.5", GRADIENT_BORDER)
                      : "border border-line bg-panel",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-full items-center justify-between gap-2 px-3 py-2.5 text-fg",
                      highlighted &&
                        "rounded-[14px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))]",
                    )}
                  >
                    <span className="flex items-center gap-1 text-base font-semibold tracking-[-0.01em] whitespace-nowrap">
                      {plans[key].name}
                      {highlighted && (
                        <Sparkle
                          size={12}
                          className="shrink-0 fill-current text-fg"
                        />
                      )}
                    </span>
                    <Link
                      href={ctas[key].href}
                      onClick={ctas[key].onClick}
                      className={cn(
                        "hidden h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none lg:inline-flex",
                        highlighted
                          ? "bg-accent text-white hover:bg-accent/90"
                          : "bg-accent/10 text-fg hover:bg-accent/20",
                      )}
                    >
                      {ctas[key].label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {copy.groups.map((group) => (
              <section
                key={group.title}
                className="overflow-hidden rounded-2xl border border-line bg-panel"
              >
                <h4 className="border-b border-line px-6 py-5 text-lg font-semibold text-fg">
                  {group.title}
                </h4>
                {group.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className={cn(
                      "grid",
                      GRID,
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <div className="px-6 py-3.5 text-[15px] text-fg">
                      {row.label}
                    </div>
                    {PLANS.map((key) => (
                      <PlanCell key={key} value={row[key]} values={values} />
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCell({
  value,
  values,
}: {
  value: Cell[PlanKey];
  values: Record<string, string | number>;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border-l border-line px-3 py-3.5 text-center text-[15px] text-fg",
        value === false && "bg-tint/40",
      )}
    >
      {value === true ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-accent text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      ) : value === false ? null : (
        fill(value, values)
      )}
    </div>
  );
}
