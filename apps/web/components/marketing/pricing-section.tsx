"use client";

import { useState } from "react";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { useMessages } from "./i18n-provider";
import {
  MarketingSection,
  SectionHeading,
  WIDE_RAIL,
  type SectionProps,
} from "./_shared";
import { DEFAULT_SEATS, PlanCards } from "./plan-cards";
import { PlanTable } from "./plan-table";
import { WhyUsSection } from "./why-us-section";

type PricingSectionProps = SectionProps & {
  hideHeading?: boolean;
  showTable?: boolean;
};

export function PricingSection({
  hideHeading = false,
  showTable = false,
  headingLevel = 2,
}: PricingSectionProps = {}) {
  const m = useMessages();
  const [seats, setSeats] = useState(DEFAULT_SEATS);
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
      <div className={WIDE_RAIL}>
        <PlanCards onSeatsChange={setSeats} />
      </div>
      <WhyUsSection seats={seats} />
      {showTable && (
        <div className={WIDE_RAIL}>
          <PlanTable />
        </div>
      )}
    </MarketingSection>
  );
}
