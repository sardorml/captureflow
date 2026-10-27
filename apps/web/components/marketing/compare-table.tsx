"use client";

import { Check, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GRADIENT_BORDER } from "./plan-cards";

export type CompareValue = string | boolean;

export const OURS_BG =
  "bg-[color-mix(in_oklab,var(--accent)_6%,var(--cf-panel))]";

export function OursChip({ children }: { children: React.ReactNode }) {
  return (
    <span className={cn("rounded-xl p-0.5", GRADIENT_BORDER)}>
      <span className="flex items-center gap-1 rounded-[10px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))] px-3 py-1.5 whitespace-nowrap">
        {children}
        <Sparkle size={12} className="shrink-0 fill-current" />
      </span>
    </span>
  );
}

export function CompareCell({
  value,
  ours = false,
  pop = false,
  className,
}: {
  value: CompareValue;
  ours?: boolean;
  pop?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border-t border-l border-line px-3 py-3.5 text-center text-[15px] text-fg tabular-nums",
        ours ? OURS_BG : value === false && "bg-tint/40",
        ours && value === false && "opacity-60",
        className,
      )}
    >
      {value === true ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      ) : value === false ? null : (
        <span
          key={value}
          className={cn(pop && "animate-storage-pop inline-block")}
        >
          {value}
        </span>
      )}
    </div>
  );
}
