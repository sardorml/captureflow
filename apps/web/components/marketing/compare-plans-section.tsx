"use client";

import type { CSSProperties, ReactNode } from "react";
import { Tag, theme, Typography } from "antd";
import { Check, Minus } from "lucide-react";
import {
  type CompareCell,
  COMPARE_SECTIONS,
  CURRENT_STAGE,
} from "@/lib/marketing/constants";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";

type CellData = { raw: CompareCell; text: string };

type Row =
  | { key: string; section: true; label: string }
  | {
      key: string;
      section?: false;
      label: string;
      free: CellData;
      monthly: CellData;
      first: boolean;
      last: boolean;
    };

const COLS = "1.6fr 1fr 1fr";

export function ComparePlansSection() {
  const m = useMessages();
  const { token } = theme.useToken();
  if (!CURRENT_STAGE.showPricingSection) return null;
  const compare = m.pricing.compare;

  const renderCell = (cell: CellData): ReactNode => {
    if (typeof cell.raw === "string") {
      return (
        <Typography.Text style={{ color: token.colorTextSecondary }}>
          {cell.text}
        </Typography.Text>
      );
    }
    const included = cell.raw === true;
    return (
      <span
        role="img"
        aria-label={included ? compare.includedAria : compare.notIncludedAria}
        style={{ display: "inline-flex" }}
      >
        {included ? (
          <Check
            size={18}
            strokeWidth={2.5}
            color={token.colorPrimary}
            aria-hidden
          />
        ) : (
          <Minus size={18} color={token.colorTextQuaternary} aria-hidden />
        )}
      </span>
    );
  };

  const rows: Row[] = [];
  COMPARE_SECTIONS.forEach((section, sectionIndex) => {
    const localized = compare.sections[sectionIndex];
    rows.push({
      key: `section-${sectionIndex}`,
      section: true,
      label: localized.title,
    });
    section.rows.forEach((row, i) => {
      rows.push({
        key: `row-${sectionIndex}-${i}`,
        label: localized.rows[i].label,
        free: { raw: row.free, text: localized.rows[i].free },
        monthly: { raw: row.monthly, text: localized.rows[i].pro },
        first: i === 0,
        last:
          sectionIndex === COMPARE_SECTIONS.length - 1 &&
          i === section.rows.length - 1,
      });
    });
  });

  // The managed column reads as one continuous tinted card: every row paints
  // the third cell, and only the header/last cells round their corners.
  const managedBg = token.colorPrimaryBg;
  const gridRow: CSSProperties = {
    display: "grid",
    gridTemplateColumns: COLS,
    alignItems: "center",
  };
  const valueCell: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    alignItems: "center",
    padding: "14px 16px",
  };

  return (
    <MarketingSection>
      <SectionHeading title={compare.heading} subtitle={compare.subtitle} />
      <div style={{ maxWidth: 960, marginInline: "auto", overflowX: "auto" }}>
        <div
          role="table"
          aria-label={compare.heading}
          style={{ minWidth: 560 }}
        >
          <div role="row" style={gridRow}>
            <div role="columnheader" aria-label={compare.featureColumn} />
            <div
              role="columnheader"
              style={{ ...valueCell, padding: "18px 16px" }}
            >
              <Typography.Text
                strong
                style={{ color: token.colorTextSecondary }}
              >
                {compare.freeColumn}
              </Typography.Text>
            </div>
            <div
              role="columnheader"
              style={{
                ...valueCell,
                padding: "18px 16px",
                gap: 8,
                background: managedBg,
                borderTopLeftRadius: token.borderRadiusLG,
                borderTopRightRadius: token.borderRadiusLG,
              }}
            >
              <Typography.Text strong>{compare.proColumn}</Typography.Text>
              <Tag color="blue" variant="filled" style={{ margin: 0 }}>
                {compare.proBadge}
              </Tag>
            </div>
          </div>

          {rows.map((row) =>
            row.section ? (
              <div role="row" key={row.key} style={gridRow}>
                <div
                  role="cell"
                  style={{ padding: "28px 16px 10px", alignSelf: "stretch" }}
                >
                  <Typography.Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: token.colorTextTertiary,
                    }}
                  >
                    {row.label}
                  </Typography.Text>
                </div>
                <div role="cell" style={{ alignSelf: "stretch" }} />
                <div
                  role="cell"
                  style={{ alignSelf: "stretch", background: managedBg }}
                />
              </div>
            ) : (
              <div role="row" key={row.key} style={gridRow}>
                <div
                  role="cell"
                  style={{
                    padding: "14px 16px",
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    borderTop: row.first
                      ? "none"
                      : `1px solid ${token.colorSplit}`,
                  }}
                >
                  <Typography.Text>{row.label}</Typography.Text>
                </div>
                <div
                  role="cell"
                  style={{
                    ...valueCell,
                    borderTop: row.first
                      ? "none"
                      : `1px solid ${token.colorSplit}`,
                  }}
                >
                  {renderCell(row.free)}
                </div>
                <div
                  role="cell"
                  style={{
                    ...valueCell,
                    background: managedBg,
                    borderTop: row.first
                      ? "none"
                      : `1px solid ${token.colorSplit}`,
                    borderBottomLeftRadius: row.last ? token.borderRadiusLG : 0,
                    borderBottomRightRadius: row.last
                      ? token.borderRadiusLG
                      : 0,
                  }}
                >
                  {renderCell(row.monthly)}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </MarketingSection>
  );
}
