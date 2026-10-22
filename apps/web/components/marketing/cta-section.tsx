"use client";

import NextLink from "next/link";
import { buttonVariants } from "@heroui/react";
import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { MarketingSection } from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { WaitlistForm } from "./waitlist-form";

export function CtaSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <MarketingSection id="waitlist">
      <div className="mx-auto flex max-w-215 flex-col items-center gap-6 rounded-3xl border border-line bg-panel p-6 text-center sm:p-8 md:flex-row md:justify-between md:text-left">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-fg sm:text-4xl">
            {CURRENT_STAGE.ctaHeadline || m.cta.headline}
          </h2>
          <p className="mt-2 max-w-110 text-base leading-relaxed text-balance text-fg-muted">
            {CURRENT_STAGE.ctaSubtitle || m.cta.subtitle}
          </p>
        </div>
        {CURRENT_STAGE.showCtaBuyButton ? (
          <NextLink
            href={lh("/download")}
            onClick={() => track("marketing_cta_clicked", { location: "cta" })}
            className={buttonVariants({
              variant: "primary",
              size: "lg",
              className:
                "h-14 w-full shrink-0 rounded-full px-8 text-lg font-semibold md:w-auto",
            })}
          >
            {CURRENT_STAGE.ctaButtonLabel || m.cta.button}
          </NextLink>
        ) : (
          <WaitlistForm />
        )}
      </div>
    </MarketingSection>
  );
}
