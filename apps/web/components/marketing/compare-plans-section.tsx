'use client';

import { Icon } from '@/components/ui/icon';
import { COMPARE_SECTIONS, CURRENT_STAGE } from '@/lib/marketing/constants';
import { useMessages } from './i18n-provider';

// Compare-plans matrix that sits right under the pricing cards. Sticky
// three-column header echoes the card headers above; rows are grouped into
// sections (Recording / Share & Snap) so the reader can scan categories rather
// than one long list.

const COLUMNS = [
  { key: 'free' as const, label: 'Self-Hosted', accent: 'text-neutral-600' },
  {
    key: 'monthly' as const,
    label: 'CaptureFlow Managed',
    accent: 'text-neutral-900',
  },
];

// Tick colour — one green for BOTH plan columns so the Managed column's ticks
// don't read darker/heavier than Self-Hosted's (the column highlight already
// distinguishes the plans).
const TICK_COLOR = '#3aa655';

// Section-label treatment (Recording / Share & Snap) — bold Inter, sized to
// match the column. Section labels only: the plan-column headers now render as
// plain semibold text (no bold-Inter, no blue).
const PRO_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontWeight: 700,
};

export function ComparePlansSection() {
  const m = useMessages();
  if (!CURRENT_STAGE.showPricingSection) return null;
  const compare = m.pricing.compare;
  const columnLabels: Record<(typeof COLUMNS)[number]['key'], string> = {
    free: compare.freeColumn,
    monthly: compare.proColumn,
  };
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
          {compare.heading}
        </h2>
        <p className="mt-3 text-center text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
          {compare.subtitle}
        </p>

        {/* Desktop / tablet: the three-column matrix. Hidden on phones, where
            the narrow value columns wrap badly — a stacked layout renders
            instead (below). */}
        <div className="relative mt-10 hidden sm:block">
          {/* Managed-column highlight — a grid overlay using the exact same
              template + padding as the rows, so its third cell lines up
              perfectly with the CaptureFlow Managed column. Sits behind the
              content (which is lifted with `relative`) and spans the full
              height. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid grid-cols-[1.6fr_repeat(2,1fr)] px-2 sm:px-3"
          >
            <div />
            <div />
            <div className="rounded-2xl bg-blue-200" />
          </div>

          {/* The matrix stays a CSS grid for layout (the Managed-column overlay
              depends on it), so table semantics are supplied via ARIA roles:
              table > rowgroup > row > columnheader/rowheader/cell, with an
              sr-only caption naming the whole thing. */}
          <p id="compare-plans-caption" className="sr-only">
            {compare.heading}
          </p>
          <div
            className="relative"
            role="table"
            aria-labelledby="compare-plans-caption"
          >
            {/* Header row — fixed plan columns; the left column is just a
              spacer so the section labels below have something to sit
              under. Minimal style: no fill, just a divider underneath. */}
            <div
              role="row"
              className="grid grid-cols-[1.6fr_repeat(2,1fr)] border-b border-black/10 px-2 py-4 text-sm sm:px-3 sm:py-5"
            >
              <div
                role="columnheader"
                className="font-semibold text-neutral-900"
              >
                {compare.featureColumn}
              </div>
              {COLUMNS.map((col) => (
                // Both plan headers render the same — plain semibold text. The
                // Managed column no longer gets the bold-Inter blue treatment,
                // so the two headers read evenly (it keeps its darker accent +
                // the blue highlight band behind the column).
                <div
                  key={col.key}
                  role="columnheader"
                  className={`text-center font-semibold ${col.accent}`}
                >
                  {columnLabels[col.key]}
                </div>
              ))}
            </div>

            {COMPARE_SECTIONS.map((section, sectionIndex) => (
              <div key={section.title} role="rowgroup">
                <div
                  role="row"
                  className="grid grid-cols-[1.6fr_repeat(2,1fr)] px-2 pt-6 pb-2 sm:px-3"
                >
                  {/* Section label — Managed-title treatment, dark, sized to
                      match the Managed column values. Spans the full row; the
                      grid spacer is layout-only. */}
                  <div
                    role="rowheader"
                    aria-colspan={3}
                    className="inline-block text-base tracking-wide text-neutral-900"
                    style={PRO_TITLE_STYLE}
                  >
                    {compare.sections[sectionIndex].title}
                  </div>
                  <div className="col-span-2" aria-hidden />
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    role="row"
                    className={`grid grid-cols-[1.6fr_repeat(2,1fr)] items-center px-2 py-3.5 text-sm sm:px-3 ${
                      i !== section.rows.length - 1
                        ? 'border-b border-black/5'
                        : ''
                    }`}
                  >
                    <div role="rowheader" className="pr-4 text-neutral-900">
                      {compare.sections[sectionIndex].rows[i].label}
                    </div>
                    {COLUMNS.map((col) => {
                      const value = row[col.key];
                      const localizedValue =
                        compare.sections[sectionIndex].rows[i][
                          col.key === 'free' ? 'free' : 'pro'
                        ];
                      return (
                        <div
                          key={col.key}
                          role="cell"
                          className="flex items-center justify-center"
                        >
                          <Cell
                            value={value}
                            localizedValue={localizedValue}
                            includedAria={compare.includedAria}
                            notIncludedAria={compare.notIncludedAria}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked per-feature layout. Each feature is a heading with
            the two plans listed on their own full-width rows, so values never
            get squeezed into a narrow column. The Managed row keeps the blue
            highlight to echo the column above. */}
        <div className="mt-8 sm:hidden">
          {COMPARE_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title} className="mb-8 last:mb-0">
              <h3
                className="mb-3 text-base tracking-wide text-neutral-900"
                style={PRO_TITLE_STYLE}
              >
                {compare.sections[sectionIndex].title}
              </h3>
              <div className="flex flex-col gap-5">
                {section.rows.map((row, i) => (
                  <div key={row.label}>
                    <div className="mb-2 text-sm font-semibold text-neutral-900">
                      {compare.sections[sectionIndex].rows[i].label}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <MobileRow
                        plan={compare.freeColumn}
                        value={row.free}
                        localizedValue={
                          compare.sections[sectionIndex].rows[i].free
                        }
                        includedAria={compare.includedAria}
                        notIncludedAria={compare.notIncludedAria}
                      />
                      <MobileRow
                        plan={compare.proColumn}
                        value={row.monthly}
                        localizedValue={
                          compare.sections[sectionIndex].rows[i].pro
                        }
                        includedAria={compare.includedAria}
                        notIncludedAria={compare.notIncludedAria}
                        highlight
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// One plan's value for a feature on the mobile layout: plan name on the left,
// value (text, check, or dash) right-aligned. `highlight` paints the Managed
// row to match the highlighted column on wider screens.
function MobileRow({
  plan,
  value,
  localizedValue,
  includedAria,
  notIncludedAria,
  highlight = false,
}: {
  plan: string;
  value: boolean | string;
  localizedValue: string;
  includedAria: string;
  notIncludedAria: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
        highlight ? 'bg-blue-100' : 'bg-neutral-100'
      }`}
    >
      <span
        className={`shrink-0 text-xs font-medium ${
          highlight ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        {plan}
      </span>
      {typeof value === 'string' ? (
        <span className="text-right text-sm font-semibold text-neutral-900">
          {localizedValue}
        </span>
      ) : value ? (
        <span
          className="flex size-5 items-center justify-center"
          style={{ color: TICK_COLOR }}
        >
          <Icon name="check" size={18} weight={700} />
          <span className="sr-only">{includedAria}</span>
        </span>
      ) : (
        <span className="text-neutral-500">
          <span aria-hidden>—</span>
          <span className="sr-only">{notIncludedAria}</span>
        </span>
      )}
    </div>
  );
}

function Cell({
  value,
  localizedValue,
  includedAria,
  notIncludedAria,
}: {
  value: boolean | string;
  localizedValue: string;
  includedAria: string;
  notIncludedAria: string;
}) {
  if (typeof value === 'string') {
    // Both columns render string values at the same normal weight — the paid
    // column no longer gets the bold "Pro" treatment, so the table reads evenly.
    return (
      <span className="text-center text-sm font-medium text-neutral-900">
        {localizedValue}
      </span>
    );
  }
  // Check/dash glyphs are visual-only (the Icon renders aria-hidden), so each
  // cell carries an sr-only text alternative — more reliable than aria-label
  // on a generic <span>, which many screen readers ignore. Both columns use the
  // same tick so the Managed column doesn't read darker/heavier.
  if (value) {
    return (
      <span
        className="flex size-5 items-center justify-center"
        style={{ color: TICK_COLOR }}
      >
        <Icon name="check" size={16} />
        <span className="sr-only">{includedAria}</span>
      </span>
    );
  }
  return (
    <span className="text-neutral-600">
      <span aria-hidden>—</span>
      <span className="sr-only">{notIncludedAria}</span>
    </span>
  );
}
