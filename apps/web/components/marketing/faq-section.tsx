"use client";

import { Col, Collapse, Row, Typography } from "antd";
import { FAQ_ITEMS, LAUNCH_STAGE } from "@/lib/marketing/constants";
import { MarketingSection, SECTION_TITLE_STYLE } from "./_shared";
import { useMessages } from "./i18n-provider";

export function FaqSection() {
  const m = useMessages();

  const items = FAQ_ITEMS.map((_item, index) => {
    const showWaitlistLink =
      index === FAQ_ITEMS.length - 1 && LAUNCH_STAGE === "waitlist";
    const paragraphs = m.faq.items[index].answer.split("\n\n");
    return {
      key: String(index),
      label: m.faq.items[index].question,
      children: paragraphs.map((para, i) => {
        const isLast = i === paragraphs.length - 1;
        return (
          <Typography.Paragraph
            key={i}
            style={{ marginBottom: isLast ? 0 : 12 }}
          >
            {para}
            {isLast && showWaitlistLink ? (
              <>
                {" "}
                <Typography.Link href="#waitlist">
                  {m.faq.waitlistLink}
                </Typography.Link>
                .
              </>
            ) : null}
          </Typography.Paragraph>
        );
      }),
    };
  });

  return (
    <MarketingSection id="faq">
      <Row gutter={[32, 32]}>
        <Col xs={24} md={8}>
          <Typography.Title
            level={2}
            style={{ ...SECTION_TITLE_STYLE, marginTop: 0 }}
          >
            {m.faq.heading}
          </Typography.Title>
        </Col>
        <Col xs={24} md={16}>
          <Collapse accordion items={items} />
        </Col>
      </Row>
    </MarketingSection>
  );
}
