"use client";

import { useId } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";

export const LANDING_FORM_FIELDS =
  "[&_:is([data-slot=input],[data-slot=textarea])]:bg-panel-2 [&_:is([data-slot=input],[data-slot=textarea]):hover]:bg-[color-mix(in_oklab,var(--cf-panel-2),var(--cf-fg)_4%)] [&_:is([data-slot=input],[data-slot=textarea]):focus-visible]:bg-panel-2";

export function PillChoice({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  const labelId = useId();
  return (
    <RadioGroup
      name={name}
      orientation="horizontal"
      aria-labelledby={labelId}
      className="flex flex-col items-start gap-0"
    >
      <Label id={labelId}>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option}
            value={option}
            className="cursor-pointer rounded-full border border-line-strong px-3 py-1.5 text-sm text-fg-muted transition-colors outline-none hover:bg-tint hover:text-fg focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none data-[state=checked]:border-primary data-[state=checked]:bg-tint data-[state=checked]:text-fg"
          >
            {option}
          </RadioGroupPrimitive.Item>
        ))}
      </div>
    </RadioGroup>
  );
}
