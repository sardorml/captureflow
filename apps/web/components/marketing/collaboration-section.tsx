"use client";

import { Paragraph, Text } from "./typography";
import { Col, Row } from "./layout";
import { MarketingSection, SectionHeading } from "./_shared";
import { FeatureLoop, type FeatureLoopName } from "./feature-loop";
import { useMessages } from "./i18n-provider";

type CategoryKind = "share" | "screenshot" | "workspaces";

// `id` is the anchor the nav's #share / #screenshot / #workspaces links land on.
const CATEGORIES = [
  { id: "share", kind: "share", loop: "recordings" },
  { id: "screenshot", kind: "screenshot", loop: "screenshots" },
  { id: "workspaces", kind: "workspaces", loop: "teams" },
] as const satisfies readonly {
  id: string;
  kind: CategoryKind;
  loop: FeatureLoopName;
}[];

const LOOP_MAX_WIDTH = 600;

export function CollaborationSection() {
  return (
    <>
      {CATEGORIES.map((cat, i) => (
        <CategorySection key={cat.id} cat={cat} flip={i % 2 === 1} />
      ))}
    </>
  );
}

/*
 * One standalone section per capability, each with its own #anchor and header.
 * The loop side alternates so the three don't read as one column.
 */
function CategorySection({
  cat,
  flip,
}: {
  cat: (typeof CATEGORIES)[number];
  flip: boolean;
}) {
  const m = useMessages();
  const copy = m.collaboration.categories[cat.kind];
  const { feature } = copy;

  return (
    <MarketingSection id={cat.id} style={{ scrollMarginTop: 96 }}>
      <SectionHeading title={copy.title} subtitle={copy.subtitle} />
      <Row gutter={[64, 40]} align="middle">
        <Col xs={{ span: 24, order: 2 }} lg={{ span: 10, order: flip ? 1 : 2 }}>
          <Text strong style={{ fontSize: 25, lineHeight: 1.3 }}>
            {feature.title}
          </Text>
          <Paragraph
            type="secondary"
            style={{
              maxWidth: 496,
              margin: "12px 0 0",
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            {feature.body}
          </Paragraph>
        </Col>
        <Col xs={{ span: 24, order: 1 }} lg={{ span: 14, order: flip ? 2 : 1 }}>
          <div style={{ maxWidth: LOOP_MAX_WIDTH, marginInline: "auto" }}>
            <FeatureLoop name={cat.loop} />
          </div>
        </Col>
      </Row>
    </MarketingSection>
  );
}
