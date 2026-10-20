"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cloud,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Users,
  LayoutGrid,
} from "lucide-react";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import type { Messages } from "@/lib/marketing/messages";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const INCLUDE_ICONS = [
  Cloud,
  Link2,
  ImageIcon,
  MessageSquare,
  LayoutGrid,
  Users,
];

export function ManagedCard() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const copy = m.pricing.managed;

  // Checkout requires an account: the lemon-webhook attaches the purchase by
  // the signed-in user_id, so anonymous checkouts can strand a paid
  // subscription. Funnel through signup into the dashboard upgrade modal.
  const upgradeHref = `${lh("/login")}?mode=signup&next=${encodeURIComponent(
    "/recordings?upgrade=1",
  )}`;

  const freeMb = ACCOUNT_LIMITS.totalStorageBytes / (1024 * 1024);
  const options = [
    { storageGb: 0, label: `${freeMb} MB`, price: "0" },
    ...MANAGED_TIERS,
  ];
  const [storageGb, setStorageGb] = useState(0);
  const selected = options.find((o) => o.storageGb === storageGb)!;
  const isFree = selected.storageGb === 0;

  return (
    <div className="grid gap-2 rounded-2xl bg-panel p-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="flex flex-col rounded-xl bg-[#2563eb] p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
            <Cloud size={14} />
          </span>
          <span className="text-sm font-medium text-white/80">
            {copy.badge}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white">
          {copy.title}
        </h3>

        <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-white">
          <span
            key={selected.price}
            className="animate-storage-pop inline-block"
          >
            ${selected.price}
          </span>
          <span className="ms-1 align-baseline text-base font-normal text-white/70">
            {copy.period}
          </span>
        </p>
        <p className="mt-1.5 text-sm text-white/60">
          {isFree ? copy.freeNote : copy.paidNote}
        </p>

        <div
          role="radiogroup"
          aria-label={copy.tiersLabel}
          className="mt-5 mb-5 grid gap-1"
        >
          {options.map((o) => {
            const isOn = o.storageGb === storageGb;
            return (
              <button
                key={o.storageGb}
                type="button"
                role="radio"
                aria-checked={isOn}
                onClick={() => setStorageGb(o.storageGb)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                  isOn
                    ? "bg-white/20 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border",
                      isOn ? "border-white bg-white" : "border-white/50",
                    )}
                  >
                    {isOn ? (
                      <span className="size-1.5 rounded-full bg-[#2563eb]" />
                    ) : null}
                  </span>
                  <span className="font-medium">{o.label}</span>
                  {o.storageGb === 0 ? (
                    <span className="rounded-full bg-white/15 px-1.5 py-px text-[11px] font-medium">
                      {copy.freeLabel}
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums">
                  {o.storageGb === 0 ? "$0" : `$${o.price}/mo`}
                </span>
              </button>
            );
          })}
        </div>

        <Link
          href={isFree ? lh("/download") : upgradeHref}
          onClick={() =>
            isFree
              ? track("marketing_cta_clicked", { location: "pricing_free" })
              : track("upgrade_signup_opened", {
                  plan: "managed",
                  storage_gb: selected.storageGb,
                })
          }
          className="mt-auto flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-white text-sm font-medium text-[#161615] transition-colors hover:bg-white/90 motion-reduce:transition-none"
        >
          {isFree ? copy.ctaFree : copy.ctaPaid}
        </Link>
      </div>

      <ManagedIncludes copy={copy} />
    </div>
  );
}

export function ManagedIncludes({
  copy,
}: {
  copy: Messages["pricing"]["managed"];
}) {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <p className="text-sm font-medium text-fg">{copy.includesHeading}</p>
      <ul className="mt-4 flex list-none flex-col gap-3.5">
        {copy.includes.map((label, i) => {
          const Icon = INCLUDE_ICONS[i] ?? Cloud;
          return (
            <li key={label} className="flex items-center gap-3">
              <span className="shrink-0 text-fg-subtle">
                <Icon size={16} />
              </span>
              <span className="text-sm text-fg-muted">{label}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto border-t border-line pt-4 text-sm text-fg-muted max-md:mt-6">
        {copy.footnote}
      </p>
    </div>
  );
}
