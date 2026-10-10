"use client";

import { PageShell } from "./page-shell";
import { Paragraph, Text, Title } from "./typography";
import { Flex } from "./layout";
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";

export type LegalSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export function LegalPage({
  title,
  lastUpdated,
  sections,
  contact,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  contact: string;
}) {
  return (
    <PageShell
      maxWidth={760}
      title={title}
      subtitle={`Last updated ${lastUpdated}`}
    >
      <Flex vertical gap={36} style={{ paddingBottom: 72 }}>
        {sections.map((section) => (
          <Flex key={section.heading} vertical gap={12}>
            <Title level={2}>{section.heading}</Title>
            {section.body.map((paragraph) => (
              <Paragraph key={paragraph}>{paragraph}</Paragraph>
            ))}
            {section.bullets ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 22,
                  listStyle: "disc",
                  display: "grid",
                  gap: 10,
                }}
              >
                {section.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Text type="secondary">{bullet}</Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </Flex>
        ))}

        <Flex vertical gap={12}>
          <Title level={2}>Contact</Title>
          <Paragraph>
            {contact} {SUPPORT_EMAIL}.
          </Paragraph>
        </Flex>
      </Flex>
    </PageShell>
  );
}
