"use client";

import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { useMessages } from "./i18n-provider";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { FreeCard } from "./free-card";
import { ManagedCard } from "./managed-card";

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
          eyebrow={m.pricing.eyebrow}
          title={CURRENT_STAGE.pricingHeading ?? m.pricing.heading}
          subtitle={CURRENT_STAGE.pricingSubheading ?? m.pricing.subheading}
          level={headingLevel}
        />
      )}
      {/* Subgrid so the two cards share row tracks: both gradient panels get the
          taller one's height, and both feature lists start at the same y. */}
      <div className="mx-auto grid max-w-215 gap-6 md:grid-cols-2 md:grid-rows-[auto_1fr_auto]">
        <FreeCard />
        <ManagedCard />
      </div>
    </MarketingSection>
  );
}
