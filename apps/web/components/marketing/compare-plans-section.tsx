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

// Tick colour for the Managed column — same green as the other column's ticks.
const COMIC_TICK_COLOR = '#2e8b50';

// Managed-column cell treatment — flat, no outline stroke or extrusion shadow.
// Colour is applied per-cell on top of this.
const COMIC_STYLE: React.CSSProperties = {};

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

        <div className="relative mt-10">
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
                            comic={col.key === 'monthly'}
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
      </div>
    </section>
  );
}

function Cell({
  value,
  localizedValue,
  includedAria,
  notIncludedAria,
  comic = false,
}: {
  value: boolean | string;
  localizedValue: string;
  includedAria: string;
  notIncludedAria: string;
  comic?: boolean;
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
  // on a generic <span>, which many screen readers ignore.
  if (value) {
    if (comic) {
      return (
        <span
          className="flex size-7 items-center justify-center"
          style={{ color: COMIC_TICK_COLOR }}
        >
          <Icon name="check" size={24} weight={700} style={COMIC_STYLE} />
          <span className="sr-only">{includedAria}</span>
        </span>
      );
    }
    return (
      <span className="flex size-5 items-center justify-center text-[#3aa655]">
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
