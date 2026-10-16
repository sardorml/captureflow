"use client";

import { Paragraph, Text } from "./typography";
import { Col, Row } from "./layout";
import { MarketingSection, SectionHeading } from "./_shared";
import type { ComponentType } from "react";
import { EditorScene } from "./editor-scene";
import { FeedbackScene } from "./feedback-scene";
import { TeamsScene } from "./teams-scene";
import { useMessages } from "./i18n-provider";

type CategoryKind = "share" | "feedback" | "workspaces";

// `id` is the anchor each row can be linked to: #share / #feedback / #workspaces.
const CATEGORIES = [
  { id: "share", kind: "share", Scene: EditorScene },
  { id: "feedback", kind: "feedback", Scene: FeedbackScene },
  { id: "workspaces", kind: "workspaces", Scene: TeamsScene },
] as const satisfies readonly {
  id: string;
  kind: CategoryKind;
  Scene: ComponentType;
}[];

const SCENE_MAX_WIDTH = 600;

export function CollaborationSection() {
  const m = useMessages();

  return (
    <MarketingSection id="capabilities" style={{ scrollMarginTop: 96 }}>
      <SectionHeading
        title={m.collaboration.heading}
        subtitle={m.collaboration.subtitle}
      />
      <div className="flex flex-col gap-24">
        {CATEGORIES.map((cat, i) => (
          <CategoryRow key={cat.id} cat={cat} flip={i % 2 === 1} />
        ))}
      </div>
    </MarketingSection>
  );
}

/*
 * One row per capability under the shared heading, each keeping its #anchor.
 * The scene side alternates so the three don't read as one column.
 */
function CategoryRow({
  cat,
  flip,
}: {
  cat: (typeof CATEGORIES)[number];
  flip: boolean;
}) {
  const m = useMessages();
  const { feature } = m.collaboration.categories[cat.kind];

  return (
    <div id={cat.id} style={{ scrollMarginTop: 96 }}>
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
          <div style={{ maxWidth: SCENE_MAX_WIDTH, marginInline: "auto" }}>
            <cat.Scene />
          </div>
        </Col>
      </Row>
    </div>
  );
}
