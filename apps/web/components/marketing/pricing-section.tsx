"use client";

import { Building2 } from "lucide-react";
import { CURRENT_STAGE, SUPPORT_EMAIL, X_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { ManagedCard } from "./managed-card";
import { GitHubIcon } from "./platform-logos";
import { PricingStrip } from "./pricing-strip";

type PricingSectionProps = SectionProps & {
  hideHeading?: boolean;
};

export function PricingSection({
  hideHeading = false,
  headingLevel = 2,
}: PricingSectionProps = {}) {
  const m = useMessages();
  if (!CURRENT_STAGE.showPricingSection) return null;
  return (
    <MarketingSection id="pricing">
      {!hideHeading && (
        <SectionHeading
          title={CURRENT_STAGE.pricingHeading ?? m.pricing.heading}
          subtitle={CURRENT_STAGE.pricingSubheading ?? m.pricing.subheading}
          level={headingLevel}
        />
      )}
      <div className="mx-auto max-w-215">
        <ManagedCard />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <PricingStrip
            icon={<Building2 size={28} />}
            name={m.pricing.enterprise.name}
            price={m.pricing.enterprise.price}
            body={m.pricing.enterprise.body}
            cta={{
              label: m.pricing.enterprise.cta,
              href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(m.pricing.enterprise.subject)}`,
              onClick: () =>
                track("marketing_cta_clicked", {
                  location: "pricing_enterprise",
                }),
            }}
          />
          <PricingStrip
            icon={<GitHubIcon size={30} />}
            name={m.pricing.selfHost.name}
            price={m.pricing.selfHost.price}
            body={m.pricing.selfHost.body}
            cta={{
              label: m.pricing.selfHost.cta,
              href: X_URL,
              isExternal: true,
              onClick: () => track("source_opened", { from: "pricing_free" }),
            }}
          />
        </div>
      </div>
    </MarketingSection>
  );
}
