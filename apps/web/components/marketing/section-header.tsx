'use client';

import { useLocalizedHref, useMessages } from './i18n-provider';

// Shared section header — title + subtitle left-aligned with a CTA button
// pinned to the right (CapCut's section-header rhythm). The button is the
// dark CapCut-style pill (matches the nav's primary Download treatment), flat
// with no shadow. On narrow screens the button drops below the text. Spans
// the parent's full content width, so it must sit inside a `max-w-7xl`
// container.
export function SectionHeader({
  title,
  children,
  textClassName = 'max-w-sm',
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  // Width (and any other) classes for the title+subtitle block. Defaults to
  // `max-w-sm`; widen it per-section when a longer subtitle needs more room.
  textClassName?: string;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className={textClassName}>
        <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
          {title}
        </h2>
        <p className="mt-3 text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
          {children}
        </p>
      </div>
      <a
        href={lh('/download')}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center self-start rounded-lg bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:self-auto"
      >
        {m.sectionHeader.cta}
      </a>
    </div>
  );
}
