"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS, LAUNCH_STAGE } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Paragraph, Link as TypoLink } from "./typography";
import type { SectionProps } from "./_shared";
import {
  FRAME_CELL,
  FRAME_CELLS,
  FrameHeader,
  FrameSection,
  PillLink,
} from "./frame";
import { useMessages } from "./i18n-provider";

// Indexes into FAQ_ITEMS.
const CATEGORIES = [
  { label: "Hosting", items: [0, 1, 4] },
  { label: "Plans and storage", items: [2, 3] },
] as const;

export function FaqSection({
  hideHeading = false,
  headingLevel = 2,
}: SectionProps & { hideHeading?: boolean } = {}) {
  const m = useMessages();
  const [picked, setPicked] = useState(0);

  return (
    <FrameSection id="faq">
      {!hideHeading && (
        <FrameHeader
          title={m.faq.heading}
          subtitle={m.faq.subtitle}
          level={headingLevel}
          action={<PillLink href={DOCS_URL}>{m.faq.cta}</PillLink>}
        />
      )}
      <div className={cn(FRAME_CELLS, "md:grid-cols-[1fr_3fr]")}>
        <div className={cn(FRAME_CELL, "flex flex-col")}>
          {CATEGORIES.map((category, i) => (
            <button
              key={category.label}
              type="button"
              aria-pressed={i === picked}
              onClick={() => setPicked(i)}
              className={cn(
                "flex h-12 items-center justify-between border-b border-line-strong px-6 text-left text-sm transition-colors motion-reduce:transition-none",
                i === picked
                  ? "bg-tint font-medium text-fg"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {category.label}
              <span className="text-xs text-fg-subtle tabular-nums">
                {category.items.length}
              </span>
            </button>
          ))}
        </div>
        <div className={FRAME_CELL}>
          {/* Every answer stays in the HTML: the page's FAQ schema repeats them. */}
          <Accordion type="single" collapsible>
            {CATEGORIES.map((category, c) =>
              category.items.map((index, position) => {
                const showWaitlistLink =
                  index === FAQ_ITEMS.length - 1 && LAUNCH_STAGE === "waitlist";
                const paragraphs = m.faq.items[index].answer.split("\n\n");
                return (
                  <AccordionItem
                    key={index}
                    value={String(index)}
                    className={cn(
                      "border-b border-line-strong last:border-b-0",
                      c !== picked && "hidden",
                    )}
                  >
                    <AccordionTrigger className="items-center gap-5 rounded-none px-6 py-5 text-base leading-6 font-medium text-fg hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden!">
                      <span className="font-mono text-xs text-fg-subtle tabular-nums">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">
                        {m.faq.items[index].question}
                      </span>
                      <Plus
                        size={16}
                        className="shrink-0 text-fg-muted transition-transform group-aria-expanded/accordion-trigger:rotate-45 motion-reduce:transition-none"
                      />
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 md:pl-[60px]">
                      {paragraphs.map((para, i) => {
                        const isLast = i === paragraphs.length - 1;
                        return (
                          <Paragraph
                            key={i}
                            className="text-[15px] leading-relaxed text-fg-muted"
                            style={{ marginBottom: isLast ? 0 : 12 }}
                          >
                            {para}
                            {isLast && showWaitlistLink ? (
                              <>
                                {" "}
                                <TypoLink href="#waitlist">
                                  {m.faq.waitlistLink}
                                </TypoLink>
                                .
                              </>
                            ) : null}
                          </Paragraph>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                );
              }),
            )}
          </Accordion>
        </div>
      </div>
    </FrameSection>
  );
}
