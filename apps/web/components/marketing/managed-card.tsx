"use client";

import {
  MONTHLY_PRICE,
  MONTHLY_SUBSCRIPTION_CHECKOUT_URL,
} from "@/lib/marketing/constants";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";
import { PlanCard } from "./plan-card";

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
    <PlanCard
      highlighted
      badges={[
        { label: copy.badgePro, color: "blue" },
        { label: copy.badgeCycle },
      ]}
      name={copy.title}
      tagline={copy.subtitle}
      price={`$${MONTHLY_PRICE}`}
      period={copy.period}
      note={copy.note}
      cta={{
        label: copy.cta,
        href: baseHref,
        primary: true,
        target: "_blank",
        onClick: handleCheckoutClick,
      }}
      guarantee={m.pricing.guarantee}
      features={[
        m.pricing.highlights.allFeatures,
        m.pricing.highlights.shareableLinks,
        m.pricing.highlights.teamSeats,
      ]}
    />
  );
}
