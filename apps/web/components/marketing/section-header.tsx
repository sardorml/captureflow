"use client";

import type { ReactNode } from "react";
import { Button, Flex, Typography } from "antd";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const { Title, Paragraph } = Typography;

export function SectionHeader({
  title,
  children,
  textClassName,
}: {
  title: ReactNode;
  children: ReactNode;
  textClassName?: string;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <Flex
      gap={24}
      vertical
      className="sm:flex-row sm:items-center sm:justify-between"
    >
      <div className={textClassName ?? "max-w-sm"}>
        <Title level={2} style={{ marginBottom: 12 }}>
          {title}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {children}
        </Paragraph>
      </div>
      <Button
        type="primary"
        href={lh("/download")}
        className="self-start sm:self-auto"
      >
        {m.sectionHeader.cta}
      </Button>
    </Flex>
  );
}
