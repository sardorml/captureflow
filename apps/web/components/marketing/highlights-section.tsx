"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingSection, SectionHeading, type SectionProps } from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";

export function HighlightsSection({ headingLevel = 2 }: SectionProps = {}) {
  const copy = useMessages().highlights;
  const lh = useLocalizedHref();
  return (
    <MarketingSection id="highlights">
      <SectionHeading title={copy.heading} level={headingLevel} />
      <ul className="mx-auto grid max-w-3xl list-none gap-x-12 gap-y-6 sm:grid-cols-2">
        {copy.items.map((item) => (
          <li key={item} className="flex items-center gap-4 text-lg text-fg">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-bg text-white">
              <Check size={20} strokeWidth={2.25} />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-12 text-center">
        <Link
          href={lh("/pricing")}
          className="text-base font-semibold text-fg underline underline-offset-4 transition-colors hover:text-fg/70 motion-reduce:transition-none"
        >
          {copy.cta}
        </Link>
      </div>
    </MarketingSection>
  );
}
