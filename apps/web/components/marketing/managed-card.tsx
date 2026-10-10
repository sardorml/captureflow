"use client";

import { useState } from "react";
import Link from "next/link";
import { Cloud, HardDrive, Users } from "lucide-react";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
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
  const upgradeHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;
  const freeHref = lh("/download");

  // Opens on the free account; picking a size swaps the price and CTA to that
  // tier, so the number shown is always the one the button buys.
  const [storageGb, setStorageGb] = useState<number | null>(null);
  const selected = MANAGED_TIERS.find((t) => t.storageGb === storageGb);
  const freeMb = ACCOUNT_LIMITS.totalStorageBytes / (1024 * 1024);

  const storage = selected ? `${selected.storageGb} GB` : `${freeMb} MB`;
  const [storageBefore, storageAfter] =
    m.pricing.highlights.shareableLinks.split("{storage}");

  // Keyed on the amount so a switch remounts it and replays the pop.
  const highlights = [
    { key: "features", icon: Cloud, label: m.pricing.highlights.allFeatures },
    {
      key: "storage",
      icon: HardDrive,
      label: (
        <>
          {storageBefore}
          <span
            key={storage}
            className="animate-storage-pop inline-block font-semibold text-fg"
          >
            {storage}
          </span>
          {storageAfter}
        </>
      ),
    },
    { key: "team", icon: Users, label: m.pricing.highlights.teamSeats },
  ];

  return (
    /* Mirrors PlanCard's shell: outer card, inset panel, list below. */
    <div className="grid rounded-2xl bg-panel p-2 md:row-span-3 md:grid-rows-subgrid">
      <div className="relative flex flex-col overflow-hidden rounded-xl bg-accent-bg p-5">
        {/* The size switch rides the badge row, which was otherwise empty, so
            it costs the panel no extra height. */}
        <div className="flex h-7 items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
              <Cloud size={14} />
            </span>
            <span className="hidden text-sm font-medium text-white/80 sm:inline">
              {copy.badgePro}
            </span>
          </span>

          <div
            role="radiogroup"
            aria-label={copy.title}
            className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 p-0.5"
          >
            {[null, ...MANAGED_TIERS.map((t) => t.storageGb)].map((gb) => {
              const on = gb === storageGb;
              return (
                <button
                  key={gb ?? "free"}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setStorageGb(gb)}
                  className={[
                    "cursor-pointer rounded-full px-2 py-1 text-xs sm:px-2.5 font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                    on
                      ? "bg-white text-neutral-900"
                      : "text-white/70 hover:text-white",
                  ].join(" ")}
                >
                  {gb === null ? copy.freeLabel : `${gb} GB`}
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
          ${selected ? selected.price : "0"}
          <span className="ms-1 align-baseline text-base font-normal text-white/70">
            {copy.period}
          </span>
        </p>
        <p className="mt-1.5 mb-5 text-sm text-white/60">
          {selected ? copy.note : copy.freeNote}
        </p>

        <Link
          href={selected ? upgradeHref : freeHref}
          onClick={() =>
            selected
              ? track("upgrade_signup_opened", {
                  plan: "managed",
                  storage_gb: selected.storageGb,
                })
              : track("marketing_cta_clicked", { location: "pricing_free" })
          }
          className="mt-auto flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-white text-sm font-medium text-neutral-900 transition-colors hover:bg-white/90 motion-reduce:transition-none"
        >
          {copy.cta}
        </Link>
      </div>

      <ul className="flex flex-1 list-none flex-col gap-2.5 px-3 pt-5 pb-4">
        {highlights.map((h) => (
          <li key={h.key} className="flex items-center gap-3">
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
