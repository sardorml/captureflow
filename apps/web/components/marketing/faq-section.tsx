"use client";

import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS, LAUNCH_STAGE } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
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

// Indexes into FAQ_ITEMS, in display order.
const ORDER = [0, 2, 5, 3, 4, 1] as const;

export function FaqSection({
  hideHeading = false,
  headingLevel = 2,
}: SectionProps & { hideHeading?: boolean } = {}) {
  const m = useMessages();

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
      <div className={FRAME_CELLS}>
        <div className={FRAME_CELL}>
          {/* Every answer stays in the HTML: the page's FAQ schema repeats them. */}
          <Accordion type="single" collapsible>
            {ORDER.map((index, position) => {
              const showWaitlistLink =
                index === FAQ_ITEMS.length - 1 && LAUNCH_STAGE === "waitlist";
              const paragraphs = m.faq.items[index].answer.split("\n\n");
              return (
                <AccordionItem
                  key={index}
                  value={String(index)}
                  className="border-b border-line-strong last:border-b-0"
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
                          {para.split("\n").map((line, l, lines) =>
                            lines.length === 1 ? (
                              line
                            ) : (
                              <span
                                key={l}
                                className={
                                  l === 0
                                    ? "block font-medium text-fg"
                                    : "mt-1 block"
                                }
                              >
                                {line}
                              </span>
                            ),
                          )}
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
            })}
          </Accordion>
        </div>
      </div>
    </FrameSection>
  );
}
