"use client";

import { useRef, type ReactNode } from "react";
import NextLink from "next/link";
import { GlyphField } from "@/components/ui/glyph-field";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TwoTone } from "./frame";
import { HERO_TITLE } from "./hero-section";
import { useLocalizedHref, useMessages } from "./i18n-provider";

export function PageHero({
  page,
  action,
}: {
  page: "features" | "pricing" | "faq" | "chromeExtension";
  action?: ReactNode;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const textRef = useRef<HTMLDivElement>(null);
  const { label, word, title, subtitle } = m.pageHeroes[page];

  return (
    <section className="relative isolate overflow-hidden">
      <GlyphField
        word={word}
        clearRef={textRef}
        className="absolute inset-0 -z-10 text-accent-bg"
      />
      <div className="flex flex-col items-center px-6 pt-16 pb-8 text-center sm:pt-[90px] sm:pb-14">
        <div ref={textRef} className="flex flex-col items-center pb-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList className="justify-center text-[13px] leading-5 text-fg-muted">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-fg">
                  <NextLink href={lh("/")}>{m.pageHeroes.home}</NextLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-fg">{label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={HERO_TITLE}>{title}</h1>
          <p className="mt-6 max-w-[720px] text-lg leading-7 text-balance sm:text-xl">
            <TwoTone text={subtitle} />
          </p>
        </div>
        {action && <div className="-mt-4 mb-12">{action}</div>}
      </div>
    </section>
  );
}
