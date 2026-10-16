"use client";

import { Paragraph, Text } from "./typography";
import { Col, Row } from "./layout";
import { MarketingSection, SectionHeading } from "./_shared";
import type { ComponentType } from "react";
import { EditorScene } from "./editor-scene";
import { EmbedScene } from "./embed-scene";
import { FeedbackScene } from "./feedback-scene";
import { TeamsScene } from "./teams-scene";
import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type CategoryKind = "share" | "embed" | "feedback" | "workspaces";

// `id` is the anchor each row can be linked to: #share / #embed / #feedback /
// #workspaces.
const CATEGORIES = [
  { id: "share", kind: "share", Scene: EditorScene, href: "install" },
  { id: "embed", kind: "embed", Scene: EmbedScene, href: "install" },
  { id: "feedback", kind: "feedback", Scene: FeedbackScene, href: "/login" },
  {
    id: "workspaces",
    kind: "workspaces",
    Scene: TeamsScene,
    href: "/login?mode=signup",
  },
] as const satisfies readonly {
  id: string;
  kind: CategoryKind;
  Scene: ComponentType;
  href: string;
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
  const lh = useLocalizedHref();
  const { feature } = m.collaboration.categories[cat.kind];
  const href =
    cat.href === "install"
      ? (CHROME_WEBSTORE_URL ?? lh("/download"))
      : lh(cat.href);

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
          <FeatureLink
            href={href}
            label={feature.cta}
            location={`feature_${cat.id}`}
          />
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

function FeatureLink({
  href,
  label,
  location,
}: {
  href: string;
  label: string;
  location: string;
}) {
  const className =
    "group mt-7 inline-flex items-center gap-2 text-[18px] font-semibold text-[#6ea8ff] transition-colors hover:text-[#9cc3ff]";
  const onClick = () => track("marketing_cta_clicked", { location });
  const content = (
    <>
      {label}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </>
  );

  return /^https?:/.test(href) ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <NextLink href={href} className={className} onClick={onClick}>
      {content}
    </NextLink>
  );
}
