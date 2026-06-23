"use client";

import CtaButton from "@/components/ui/cta-button";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { WaitlistForm } from "./waitlist-form";

export function CtaSection() {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <section id="waitlist" className="scroll-mt-24 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-card px-8 py-14 text-center">
          <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
            {m.cta.headline}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
            {m.cta.subtitle}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            {CURRENT_STAGE.showCtaBuyButton ? (
              <CtaButton size="lg" asChild className="rounded-xl">
                <a
                  href={lh("/download")}
                  onClick={() =>
                    track("marketing_cta_clicked", { location: "footer-cta" })
                  }
                >
                  {m.cta.button}
                </a>
              </CtaButton>
            ) : (
              <WaitlistForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
