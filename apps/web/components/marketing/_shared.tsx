"use client";

import type { CSSProperties, ReactNode } from "react";
import { Typography } from "antd";

// Shared layout + type primitives so every marketing section keeps one rhythm: a
// wide centered column (matching the Ant Design homepage), consistent vertical
// padding, and ONE heading/subtitle scale used everywhere (sections that can't
// use <SectionHeading/> import the style constants directly so sizes never drift).

export const MARKETING_MAX_WIDTH = 1200;

// Canonical section title/subtitle sizes. Title is fluid (clamp) so it reads big
// and bold like the antd homepage while staying responsive.
export const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(1.875rem, 1.1rem + 2.6vw, 2.75rem)",
  fontWeight: 700,
  lineHeight: 1.15,
  margin: 0,
};

export const SECTION_SUBTITLE_STYLE: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.6,
  margin: 0,
};

export function MarketingSection({
  id,
  children,
  narrow = false,
  style,
}: {
  id?: string;
  children: ReactNode;
  narrow?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        width: "100%",
        maxWidth: narrow ? 880 : MARKETING_MAX_WIDTH,
        marginInline: "auto",
        paddingBlock: "clamp(48px, 8vw, 96px)",
        paddingInline: 24,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div style={{ textAlign: align, marginBottom: 48 }}>
      <Typography.Title
        level={2}
        style={{ ...SECTION_TITLE_STYLE, marginBottom: subtitle ? 12 : 0 }}
      >
        {title}
      </Typography.Title>
      {subtitle ? (
        <Typography.Paragraph
          type="secondary"
          style={{
            ...SECTION_SUBTITLE_STYLE,
            maxWidth: 760,
            marginInline: align === "center" ? "auto" : 0,
          }}
        >
          {subtitle}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}
