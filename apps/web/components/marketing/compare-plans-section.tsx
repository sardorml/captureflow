"use client";

import type { ReactNode } from "react";
import { Table, theme, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Check, Minus } from "lucide-react";
import {
  type CompareCell,
  COMPARE_SECTIONS,
  CURRENT_STAGE,
} from "@/lib/marketing/constants";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";

type CellData = { raw: CompareCell; text: string };

// One row per feature, plus a spanning "section" row before each group so the
// whole comparison is ONE table with ONE header (not a header per section).
type CompareRow =
  | { key: string; section: true; label: string }
  | {
      key: string;
      section?: false;
      label: string;
      free: CellData;
      monthly: CellData;
    };

export function ComparePlansSection() {
  const m = useMessages();
  const { token } = theme.useToken();
  if (!CURRENT_STAGE.showPricingSection) return null;
  const compare = m.pricing.compare;

  // Booleans render a centered icon with the a11y label on the wrapper (NOT a
  // separate text node, which would shift the icon off-center). width:100% +
  // center keeps the glyph dead-centre in the column.
  const renderCell = (cell?: CellData): ReactNode => {
    if (!cell) return null;
    if (typeof cell.raw === "string") return cell.text;
    const included = cell.raw === true;
    return (
      <span
        role="img"
        aria-label={included ? compare.includedAria : compare.notIncludedAria}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {included ? (
          <Check size={16} color={token.colorSuccess} aria-hidden />
        ) : (
          <Minus size={16} color={token.colorTextQuaternary} aria-hidden />
        )}
      </span>
    );
  };

  const dataSource: CompareRow[] = [];
  COMPARE_SECTIONS.forEach((section, sectionIndex) => {
    const localized = compare.sections[sectionIndex];
    dataSource.push({
      key: `section-${sectionIndex}`,
      section: true,
      label: localized.title,
    });
    section.rows.forEach((row, i) => {
      dataSource.push({
        key: `row-${sectionIndex}-${i}`,
        label: localized.rows[i].label,
        free: { raw: row.free, text: localized.rows[i].free },
        monthly: { raw: row.monthly, text: localized.rows[i].pro },
      });
    });
  });

  const columns: ColumnsType<CompareRow> = [
    {
      title: compare.featureColumn,
      dataIndex: "label",
      width: "44%",
      onCell: (record) =>
        record.section
          ? { colSpan: 3, style: { background: token.colorFillSecondary } }
          : {},
      render: (label: string, record) =>
        record.section ? (
          <Typography.Text strong>{label}</Typography.Text>
        ) : (
          label
        ),
    },
    {
      title: compare.freeColumn,
      dataIndex: "free",
      align: "center",
      width: "28%",
      onCell: (record) => (record.section ? { colSpan: 0 } : {}),
      render: (cell: CellData) => renderCell(cell),
    },
    {
      // Managed is the recommended plan — emphasized via the header label.
      title: (
        <span style={{ color: token.colorPrimary }}>{compare.proColumn}</span>
      ),
      dataIndex: "monthly",
      align: "center",
      width: "28%",
      onCell: (record) => (record.section ? { colSpan: 0 } : {}),
      render: (cell: CellData) => renderCell(cell),
    },
  ];

  return (
    <MarketingSection>
      <SectionHeading title={compare.heading} subtitle={compare.subtitle} />
      <div style={{ maxWidth: 960, marginInline: "auto" }}>
        <Table<CompareRow>
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          size="middle"
          tableLayout="fixed"
          scroll={{ x: 560 }}
        />
      </div>
    </MarketingSection>
  );
}
