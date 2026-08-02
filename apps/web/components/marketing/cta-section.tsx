"use client";

import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { Button, Card } from "./ui";
import { TOKENS } from "./tokens";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import {
  MarketingSection,
  SECTION_TITLE_STYLE,
  SECTION_SUBTITLE_STYLE,
  Eyebrow,
} from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { WaitlistForm } from "./waitlist-form";

export function CtaSection() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const token = TOKENS;

  return (
    <MarketingSection id="waitlist">
      <Card
        style={{
          background: token.colorFillTertiary,
          borderRadius: token.borderRadiusLG,
          textAlign: "center",
        }}
        styles={{ body: { padding: "clamp(40px, 6vw, 56px) 32px" } }}
      >
        <Flex vertical align="center" gap={token.marginLG}>
          <div>
            <Eyebrow>{m.cta.eyebrow}</Eyebrow>
            <Title
              align="center"
              level={2}
              style={{ ...SECTION_TITLE_STYLE, marginBottom: 12 }}
            >
              {CURRENT_STAGE.ctaHeadline || m.cta.headline}
            </Title>
            <Paragraph
              align="center"
              type="secondary"
              style={{
                ...SECTION_SUBTITLE_STYLE,
                maxWidth: 480,
                marginInline: "auto",
              }}
            >
              {CURRENT_STAGE.ctaSubtitle || m.cta.subtitle}
            </Paragraph>
          </div>
          {CURRENT_STAGE.showCtaBuyButton ? (
            <Button
              type="primary"
              size="large"
              href={lh("/download")}
              onClick={() =>
                track("marketing_cta_clicked", { location: "cta" })
              }
            >
              {CURRENT_STAGE.ctaButtonLabel || m.cta.button}
            </Button>
          ) : (
            <WaitlistForm />
          )}
        </Flex>
      </Card>
    </MarketingSection>
  );
}
