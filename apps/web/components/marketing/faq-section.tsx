"use client";

import { Accordion } from "@heroui/react";
import { Col, Row } from "./layout";
import { Paragraph, Title, Link as TypoLink } from "./typography";
import { FAQ_ITEMS, LAUNCH_STAGE } from "@/lib/marketing/constants";
import {
  MarketingSection,
  SECTION_TITLE_STYLE,
  type SectionProps,
} from "./_shared";
import { useMessages } from "./i18n-provider";

export function FaqSection({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();

  return (
    <MarketingSection id="faq">
      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Title
            level={headingLevel}
            style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}
          >
            {m.faq.heading}
          </Title>
        </Col>
        <Col xs={24} md={16}>
          <Accordion>
            {FAQ_ITEMS.map((_item, index) => {
              const showWaitlistLink =
                index === FAQ_ITEMS.length - 1 && LAUNCH_STAGE === "waitlist";
              const paragraphs = m.faq.items[index].answer.split("\n\n");
              return (
                <Accordion.Item key={index} id={String(index)}>
                  <Accordion.Heading>
                    {/* 16/28 is the answer's own size and leading; HeroUI's
                        trigger ships 14/20, which read as a caption over a
                        paragraph a size larger. Weight stays the trigger's. */}
                    <Accordion.Trigger className="text-base leading-7">
                      {m.faq.items[index].question}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      {paragraphs.map((para, i) => {
                        const isLast = i === paragraphs.length - 1;
                        return (
                          <Paragraph
                            key={i}
                            style={{ marginBottom: isLast ? 0 : 12 }}
                          >
                            {para}
                            {isLast && showWaitlistLink ? (
                              <>
                                {" "}
                                <TypoLink href="#waitlist">
                                  {m.faq.waitlistLink}
                                </TypoLink>
                                .
                              </>
                            ) : null}
                          </Paragraph>
                        );
                      })}
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Col>
      </Row>
    </MarketingSection>
  );
}
