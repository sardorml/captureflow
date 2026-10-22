"use client";

import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { LOOM_PLANS } from "@/lib/marketing/loom-comparison";
import { MarketingSection, SectionHeading } from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { PriceBreakdown, usd } from "./price-breakdown";

const SEATS = 10;

export function CompareSection() {
  const copy = useMessages().pricing.compare;
  const lh = useLocalizedHref();
  const body = copy.body.replace("{perSeat}", usd(LOOM_PLANS[0]!.perSeat));

  const [titleBefore, titleAfter] = copy.title.split("{loom}");

  return (
    <MarketingSection id="compare">
      <SectionHeading
        title={
          <>
            {copy.heading}{" "}
            <span className="inline-block -rotate-1 rounded-2xl bg-fg px-3 pb-1 text-canvas">
              {copy.headingMuted}
            </span>
          </>
        }
        subtitle={copy.subheading}
      />
      <NextLink
        href={lh("/alternatives/loom")}
        className="group mx-auto grid max-w-215 grid-cols-[minmax(0,1fr)] gap-6 rounded-2xl border border-line bg-panel p-5 transition-colors hover:bg-panel-2 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center"
      >
        <div>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-fg">
            {titleBefore}
            <span className="mx-0.5 inline-block -rotate-1 rounded-lg bg-fg px-2 py-0.5 text-canvas">
              {copy.loom}
            </span>
            {titleAfter}
          </p>
          <p className="mt-3 text-base leading-relaxed text-fg/85">
            {body.split("**").map((part, i) =>
              i % 2 ? (
                <strong key={i} className="font-semibold text-fg">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg">
            {copy.link}
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
        </div>

        <PriceBreakdown plan="business" seats={SEATS} />
      </NextLink>
    </MarketingSection>
  );
}
