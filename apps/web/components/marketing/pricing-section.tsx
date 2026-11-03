"use client";

import { useState } from "react";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import type { SectionProps } from "./_shared";
import { FrameHeader, FrameSection, PillLink } from "./frame";
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
  const lh = useLocalizedHref();
  const [seats, setSeats] = useState(DEFAULT_SEATS);
  if (!CURRENT_STAGE.showPricingSection) return null;
  return (
    <>
      <FrameSection id="pricing">
        {!hideHeading && (
          <FrameHeader
            title={CURRENT_STAGE.pricingHeading ?? m.pricing.heading}
            subtitle={CURRENT_STAGE.pricingSubheading ?? m.pricing.subheading}
            level={headingLevel}
            action={
              showTable ? undefined : (
                <PillLink href={lh("/pricing")}>{m.pricing.cta}</PillLink>
              )
            }
          />
        )}
        <PlanCards onSeatsChange={setSeats} />
      </FrameSection>
      {!showTable && <WhyUsSection seats={seats} />}
      {showTable && (
        <FrameSection>
          <PlanTable />
        </FrameSection>
      )}
    </>
  );
}
