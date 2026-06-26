"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Col,
  Flex,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { MessageSquarePlus } from "lucide-react";
import { ROADMAP_GROUPS } from "@/lib/marketing/constants";
import {
  MarketingSection,
  SECTION_SUBTITLE_STYLE,
  SECTION_TITLE_STYLE,
} from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const CATEGORY_KEY: Record<string, "ai" | "studio" | "share"> = {
  Core: "ai",
  Record: "studio",
  Share: "share",
};

const CATEGORY_COLOR: Record<string, string> = {
  Core: "blue",
  Record: "gold",
  Share: "magenta",
};

type SelectedTicket = {
  label: string;
  description: string;
  status: string;
  category: string;
};

export function RoadmapSection() {
  const [selected, setSelected] = useState<SelectedTicket | null>(null);
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <MarketingSection id="roadmap">
      {/* Heading margin lives on the wrapping Flex (not <SectionHeading/>) so
          that when the button wraps below the heading on mobile it still gets
          the full section gap before the columns instead of touching them. */}
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 48 }}
      >
        <div style={{ textAlign: "left" }}>
          <Typography.Title
            level={2}
            style={{ ...SECTION_TITLE_STYLE, marginBottom: 12 }}
          >
            {m.roadmap.heading}
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ ...SECTION_SUBTITLE_STYLE, maxWidth: 760, margin: 0 }}
          >
            {m.roadmap.subtitle}
          </Typography.Paragraph>
        </div>
        <Link href={lh("/suggest-feature")}>
          <Button icon={<MessageSquarePlus size={16} />}>
            {m.roadmap.suggestFeature}
          </Button>
        </Link>
      </Flex>

      <Row gutter={[24, 24]}>
        {ROADMAP_GROUPS.map((group, groupIndex) => {
          const groupTitle = m.roadmap.groups[groupIndex].title;
          return (
            <Col key={group.title} xs={24} md={8}>
              <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
                <Typography.Text
                  strong
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {groupTitle}
                </Typography.Text>
                <Tag>{group.badgeLabel}</Tag>
              </Flex>

              <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                {group.items.map((item, itemIndex) => {
                  const localizedItem =
                    m.roadmap.groups[groupIndex].items[itemIndex];
                  const categoryLabel =
                    m.roadmap.categories[CATEGORY_KEY[item.category]];
                  return (
                    <Card
                      key={item.label}
                      size="small"
                      hoverable
                      onClick={() =>
                        setSelected({
                          label: localizedItem.label,
                          description: localizedItem.description,
                          status: groupTitle,
                          category: item.category,
                        })
                      }
                    >
                      <Flex align="center" justify="space-between" gap={8}>
                        <Typography.Text strong>
                          {localizedItem.label}
                        </Typography.Text>
                        <Tag
                          color={CATEGORY_COLOR[item.category]}
                          style={{ marginInlineEnd: 0 }}
                        >
                          {categoryLabel}
                        </Tag>
                      </Flex>
                    </Card>
                  );
                })}
              </Space>
            </Col>
          );
        })}
      </Row>

      <Modal
        open={selected !== null}
        onCancel={() => setSelected(null)}
        footer={null}
        title={selected?.label}
        destroyOnHidden
      >
        {selected ? (
          <>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
              {selected.status} ·{" "}
              {m.roadmap.categories[CATEGORY_KEY[selected.category]]}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {selected.description}
            </Typography.Paragraph>
          </>
        ) : null}
      </Modal>
    </MarketingSection>
  );
}
