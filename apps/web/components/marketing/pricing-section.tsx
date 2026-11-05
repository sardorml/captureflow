"use client";

import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import type { SectionProps } from "./_shared";
import { FrameHeader, FrameSection, PillLink } from "./frame";
import { PlanCards } from "./plan-cards";
import { PlanTable } from "./plan-table";

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
  if (!CURRENT_STAGE.showPricingSection) return null;
  return (
    <>
      <FrameSection id="pricing">
        {!hideHeading && (
          <FrameHeader
            title={m.pricing.heading}
            subtitle={m.pricing.subheading}
            level={headingLevel}
            action={
              showTable ? undefined : (
                <PillLink href={lh("/pricing")}>{m.pricing.cta}</PillLink>
              )
            }
          />
        )}
        <PlanCards />
      </FrameSection>
      {showTable && (
        <FrameSection>
          <PlanTable />
        </FrameSection>
      )}
    </>
  );
}
