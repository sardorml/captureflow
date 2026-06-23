"use client";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MONTHLY_PRICE,
  MONTHLY_SUBSCRIPTION_CHECKOUT_URL,
} from "@/lib/marketing/constants";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";

export function ManagedCard() {
  const m = useMessages();
  const copy = m.pricing.monthly;

  const baseHref = MONTHLY_SUBSCRIPTION_CHECKOUT_URL
    ? `${MONTHLY_SUBSCRIPTION_CHECKOUT_URL}?utm_source=site&utm_medium=pricing&utm_content=managed`
    : "#pricing";

  // PostHog distinct_id isn't available server-side at render, so append it at click time.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("checkout_opened", { plan: "managed" });
    if (!MONTHLY_SUBSCRIPTION_CHECKOUT_URL) return;
    const distinctId = getPosthogDistinctId();
    if (!distinctId) return;
    try {
      const url = new URL(e.currentTarget.href);
      url.searchParams.set("checkout[custom][ph_distinct_id]", distinctId);
      e.currentTarget.href = url.toString();
    } catch {
      // Malformed URL — keep the plain href rather than block the click.
    }
  };

  return (
    <div className="rounded-xl bg-neutral-900 p-12 text-white">
      {/* min-h-8 matches the Free card's badge row so both columns stay aligned. */}
      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-1.5">
        <Badge className="bg-white/10 text-white hover:bg-white/10 gap-1 text-xs">
          <Icon name="workspace_premium" size={14} fill />
          {copy.badgePro}
        </Badge>
      </div>

      <h3 className="text-2xl font-bold text-white sm:text-3xl">
        {copy.title}
      </h3>
      <p className="mt-1 text-sm text-neutral-400 sm:text-base">
        {copy.subtitle}
      </p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white tabular-nums sm:text-5xl">
          ${MONTHLY_PRICE}
        </span>
        <span className="font-mono text-xs text-neutral-400 sm:text-sm">
          {copy.period}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{copy.note}</p>

      <a
        href={baseHref}
        onClick={handleCheckoutClick}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-7 text-sm font-semibold text-neutral-900 transition-colors hover:bg-white/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
      >
        {copy.cta}
      </a>
      <p className="mt-3 text-center text-xs text-neutral-400">
        {m.pricing.guarantee}
      </p>

      <Separator className="my-5 bg-white/10" />
      <ul className="space-y-3.5">
        {[
          m.pricing.highlights.allFeatures,
          m.pricing.highlights.shareableLinks,
          m.pricing.highlights.teamSeats,
        ].map((label) => (
          <li
            key={label}
            className="flex items-center gap-3 text-sm sm:text-base"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-white/15">
              <Icon name="check" size={14} className="text-white" />
            </span>
            <span className="text-white">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
