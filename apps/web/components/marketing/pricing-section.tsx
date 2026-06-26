"use client";

import { Col, Row } from "antd";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { useMessages } from "./i18n-provider";
import { MarketingSection, SectionHeading } from "./_shared";
import { FreeCard } from "./free-card";
import { ManagedCard } from "./managed-card";

type PricingSectionProps = {
  hideHeading?: boolean;
};

export function PricingSection({
  hideHeading = false,
}: PricingSectionProps = {}) {
  const m = useMessages();
  if (!CURRENT_STAGE.showPricingSection) return null;
  return (
    <MarketingSection id="pricing">
      {!hideHeading && (
        <SectionHeading
          title={CURRENT_STAGE.pricingHeading ?? m.pricing.heading}
          subtitle={CURRENT_STAGE.pricingSubheading ?? m.pricing.subheading}
        />
      )}
      <div style={{ maxWidth: 860, marginInline: "auto" }}>
        <Row gutter={[24, 24]} justify="center" align="stretch">
          <Col xs={24} md={12}>
            <FreeCard />
          </Col>
          <Col xs={24} md={12}>
            <ManagedCard />
          </Col>
        </Row>
      </div>
    </MarketingSection>
  );
}
