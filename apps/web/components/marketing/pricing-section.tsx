'use client';

import { CURRENT_STAGE } from '@/lib/marketing/constants';
import { useMessages } from './i18n-provider';
import { FreeCard } from './free-card';
import { ManagedCard } from './managed-card';

type PricingSectionProps = {
  hideHeading?: boolean;
};

export function PricingSection({
  hideHeading = false,
}: PricingSectionProps = {}) {
  const m = useMessages();
  if (!CURRENT_STAGE.showPricingSection) return null;
  return (
    <section id="pricing" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        {!hideHeading && (
          <>
            <h2 className="text-center font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
              {m.pricing.heading}
            </h2>
            <p className="mt-3 text-center text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
              {m.pricing.subheading}
            </p>
          </>
        )}

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          <FreeCard />
          <ManagedCard />
        </div>
      </div>
    </section>
  );
}
