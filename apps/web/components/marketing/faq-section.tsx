'use client';

import { SmoothAccordion } from '@/components/ui/smooth-accordion';
import { FAQ_ITEMS, LAUNCH_STAGE } from '@/lib/marketing/constants';
import { useMessages } from './i18n-provider';

export function FaqSection() {
  const m = useMessages();
  return (
    <section id="faq" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
            {m.faq.heading}
          </h2>
          <div>
            <SmoothAccordion
              items={FAQ_ITEMS.map((item, index) => {
                const showWaitlistLink =
                  index === FAQ_ITEMS.length - 1 && LAUNCH_STAGE === 'waitlist';
                const paragraphs = m.faq.items[index].answer.split('\n\n');
                return {
                  id: index,
                  title: m.faq.items[index].question,
                  content: (
                    <div className="space-y-3">
                      {paragraphs.map((para, i) => {
                        const isLast = i === paragraphs.length - 1;
                        return (
                          <p key={i}>
                            {para}
                            {isLast && showWaitlistLink && (
                              <>
                                {' '}
                                <a
                                  href="#waitlist"
                                  className="text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-700"
                                >
                                  {m.faq.waitlistLink}
                                </a>
                                .
                              </>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  ),
                };
              })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
