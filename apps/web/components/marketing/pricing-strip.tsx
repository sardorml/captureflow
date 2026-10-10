"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type PricingStripProps = {
  icon: ReactNode;
  name: string;
  price: string;
  body: string;
  cta: {
    label: string;
    href: string;
    isExternal?: boolean;
    onClick: () => void;
  };
};

export function PricingStrip({
  icon,
  name,
  price,
  body,
  cta,
}: PricingStripProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-panel p-5">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-fg text-canvas">
          {icon}
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-fg">
            {name}
            <span className="rounded-full bg-panel-2 px-2 py-0.5 text-xs font-medium text-fg">
              {price}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-fg/80">{body}</p>
        </div>
      </div>
      <a
        href={cta.href}
        target={cta.isExternal ? "_blank" : undefined}
        rel={cta.isExternal ? "noopener noreferrer" : undefined}
        onClick={cta.onClick}
        className="group ms-[58px] mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-fg underline-offset-4 hover:underline"
      >
        {cta.label}
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
    </div>
  );
}
