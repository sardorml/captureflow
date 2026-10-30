"use client";

import { useId } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { LANDING_FORM_FIELDS } from "./form-parts";
import { useMessages } from "./i18n-provider";

export const MAX_SEATS = 9999;

export function SeatsField({
  seats,
  onChange,
}: {
  seats: number;
  onChange: (seats: number) => void;
}) {
  const copy = useMessages().pricing.controls;
  const inputId = useId();
  return (
    <div
      className={cn("flex flex-row items-center gap-3", LANDING_FORM_FIELDS)}
    >
      <Label htmlFor={inputId} className="text-base font-semibold text-fg">
        {copy.teamSize}
      </Label>
      <Input
        id={inputId}
        type="number"
        value={String(seats)}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          onChange(
            Number.isFinite(n) ? Math.min(MAX_SEATS, Math.max(1, n)) : 1,
          );
        }}
        min={1}
        max={MAX_SEATS}
        inputMode="numeric"
        autoComplete="off"
        className="w-24 text-center tabular-nums"
      />
      <span className="text-base text-fg-muted">{copy.members}</span>
    </div>
  );
}

export function RadioChoice<T extends string>({
  label,
  value,
  options,
  onChange,
  trailing,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (value: T) => void;
  trailing?: React.ReactNode;
}) {
  const labelId = useId();
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as T)}
      orientation="horizontal"
      aria-labelledby={labelId}
      className="flex w-auto flex-row flex-wrap items-center gap-3"
    >
      <Label id={labelId} className="text-base font-semibold text-fg">
        {label}
      </Label>
      {options.map((o) => (
        <RadioGroupPrimitive.Item
          key={o.key}
          value={o.key}
          className="group flex cursor-pointer items-center gap-2 rounded-sm text-base text-fg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex size-5 items-center justify-center rounded-full border-2 border-fg/60 transition-colors group-data-[state=checked]:border-primary motion-reduce:transition-none">
            <span className="size-2.5 scale-0 rounded-full bg-primary transition-transform group-data-[state=checked]:scale-100 motion-reduce:transition-none" />
          </span>
          {o.label}
        </RadioGroupPrimitive.Item>
      ))}
      {trailing}
    </RadioGroup>
  );
}
