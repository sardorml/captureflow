"use client";

import { useState } from "react";
import Link from "next/link";
import { Cloud, HardDrive, Users } from "lucide-react";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";

export function ManagedCard() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const copy = m.pricing.monthly;

  // Checkout requires an account: the lemon-webhook attaches the purchase by
  // the signed-in user_id, so anonymous checkouts can strand a paid
  // subscription. Funnel through signup into the dashboard upgrade modal.
  const signupHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;

  // Opens on the recommended tier; the headline price and CTA both follow the
  // switch, so the number shown is always the one Get started buys.
  const [storageGb, setStorageGb] = useState(
    (MANAGED_TIERS.find((t) => t.tag === "recommended") ?? MANAGED_TIERS[0])
      .storageGb,
  );
  const selected =
    MANAGED_TIERS.find((t) => t.storageGb === storageGb) ?? MANAGED_TIERS[0];

  const highlights = [
    { icon: Cloud, label: m.pricing.highlights.allFeatures },
    {
      icon: HardDrive,
      label: m.pricing.highlights.shareableLinks.replace(
        "{storage}",
        String(selected.storageGb),
      ),
    },
    { icon: Users, label: m.pricing.highlights.teamSeats },
  ];

  return (
    /* Mirrors PlanCard's shell: outer card, inset gradient panel, list below. */
    <div className="grid rounded-2xl border border-line bg-panel-2 p-2 md:row-span-3 md:grid-rows-subgrid">
      <div className="relative flex flex-col overflow-hidden rounded-xl bg-[radial-gradient(120%_100%_at_15%_0%,#2f5bd8_0%,#1b2f73_55%,#131c38_100%)] p-5">
        {/* The size switch rides the badge row, which was otherwise empty, so
            it costs the panel no extra height. */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
              <Cloud size={14} />
            </span>
            <span className="text-sm font-medium text-white/80">
              {copy.badgePro}
            </span>
          </span>

          <div
            role="radiogroup"
            aria-label={copy.title}
            className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 p-0.5"
          >
            {MANAGED_TIERS.map((tier) => {
              const on = tier.storageGb === storageGb;
              return (
                <button
                  key={tier.storageGb}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setStorageGb(tier.storageGb)}
                  className={[
                    "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                    on
                      ? "bg-white text-neutral-900"
                      : "text-white/70 hover:text-white",
                  ].join(" ")}
                >
                  {tier.storageGb} GB
                </button>
              );
            })}
          </div>
        </div>

        <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white">
          {copy.title}
        </h3>
        <p className="mt-1 max-w-72 text-sm leading-snug text-white/70">
          {copy.subtitle}
        </p>

        <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-white">
          ${selected.price}
          <span className="ms-1 align-baseline text-base font-normal text-white/70">
            {copy.period}
          </span>
        </p>
        <p className="mt-1.5 mb-5 text-sm text-white/60">{copy.note}</p>

        <Link
          href={signupHref}
          onClick={() =>
            track("upgrade_signup_opened", {
              plan: "managed",
              storage_gb: selected.storageGb,
            })
          }
          className="mt-auto flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-white text-sm font-medium text-neutral-900 transition-colors hover:bg-white/90 motion-reduce:transition-none"
        >
          {copy.cta}
        </Link>
      </div>

      <ul className="flex flex-1 list-none flex-col gap-2.5 px-3 pt-5 pb-4">
        {highlights.map((h) => (
          <li key={h.label} className="flex items-center gap-3">
            <span className="shrink-0 text-fg-subtle">
              <h.icon size={16} />
            </span>
            <span className="text-sm text-fg-muted">{h.label}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-3 pt-3 pb-1">
        <p className="text-sm text-fg-muted">{m.pricing.managedGuarantee}</p>
      </div>
    </div>
  );
}
