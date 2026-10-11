"use client";

import { Label, Radio, RadioGroup } from "@heroui/react";
import { cn } from "@/lib/utils";

// HeroUI resolves the focus color from --field-focus at :root, so it has to be
// set alongside the background or a focused field drops back to the cool gray.
export const LANDING_FORM_FIELDS =
  "[--field-background:var(--cf-panel-2)] [--field-focus:var(--cf-panel-2)] [--field-hover:color-mix(in_oklab,var(--cf-panel-2),var(--cf-fg)_4%)]";

export function PillChoice({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <RadioGroup
      name={name}
      orientation="horizontal"
      className="flex-col items-start gap-0"
    >
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Radio key={option} value={option}>
            {({ isSelected }) => (
              <Radio.Content
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none",
                  isSelected
                    ? "border-accent bg-tint text-fg"
                    : "border-line-strong text-fg-muted hover:bg-tint hover:text-fg",
                )}
              >
                {option}
              </Radio.Content>
            )}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
