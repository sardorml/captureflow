"use client";

import { CURRENT_STAGE } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { FrameSection, PillLink, TwoTone } from "./frame";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { WaitlistForm } from "./waitlist-form";

export function CtaSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <FrameSection id="waitlist">
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <h2 className="text-[clamp(2.5rem,1.75rem+3vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.05em] text-balance text-fg-strong">
          {m.cta.headline}
        </h2>
        <p className="mt-5 max-w-[560px] text-lg leading-7 text-balance">
          <TwoTone text={m.cta.subtitle} />
        </p>
        <div className="mt-8">
          {CURRENT_STAGE.showCtaBuyButton ? (
            <PillLink
              href={lh("/download")}
              onClick={() =>
                track("marketing_cta_clicked", { location: "cta" })
              }
            >
              {m.cta.button}
            </PillLink>
          ) : (
            <WaitlistForm />
          )}
        </div>
      </div>
    </FrameSection>
  );
}
