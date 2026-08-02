"use client";

import { Accordion } from "@heroui/react";
import { Col, Row } from "./layout";
import { Paragraph, Title, Link as TypoLink } from "./typography";
import { FAQ_ITEMS, LAUNCH_STAGE } from "@/lib/marketing/constants";
import { MarketingSection, SECTION_TITLE_STYLE } from "./_shared";
import { useMessages } from "./i18n-provider";

export function FaqSection() {
  const m = useMessages();

  return (
    <MarketingSection id="faq">
      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Title level={2} style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}>
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
                    <Accordion.Trigger>
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
