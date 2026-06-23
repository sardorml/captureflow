"use client";

import { useLocalizedHref, useMessages } from "./i18n-provider";

export function SectionHeader({
  title,
  children,
  textClassName = "max-w-sm",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  textClassName?: string;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className={textClassName}>
        <h2 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px] lg:text-[40px]">
          {title}
        </h2>
        <p className="mt-3 text-base font-normal leading-[1.4] tracking-[-0.01em] text-[#090c14]">
          {children}
        </p>
      </div>
      <a
        href={lh("/download")}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center self-start rounded-lg bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:self-auto"
      >
        {m.sectionHeader.cta}
      </a>
    </div>
  );
}
