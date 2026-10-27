"use client";

import { Input, Label, Radio, RadioGroup, TextField } from "@heroui/react";
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
  return (
    <TextField
      type="number"
      value={String(seats)}
      onChange={(v) => {
        const n = Number.parseInt(v, 10);
        onChange(Number.isFinite(n) ? Math.min(MAX_SEATS, Math.max(1, n)) : 1);
      }}
      className={cn("flex flex-row items-center gap-3", LANDING_FORM_FIELDS)}
    >
      <Label className="text-base font-semibold text-fg">{copy.teamSize}</Label>
      <Input
        min={1}
        max={MAX_SEATS}
        inputMode="numeric"
        autoComplete="off"
        className="w-24 text-center tabular-nums"
      />
      <span className="text-base text-fg-muted">{copy.members}</span>
    </TextField>
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
  return (
    <RadioGroup
      value={value}
      onChange={(v) => onChange(v as T)}
      orientation="horizontal"
      className="flex-row items-center gap-3"
    >
      <Label className="text-base font-semibold text-fg">{label}</Label>
      {options.map((o) => (
        <Radio key={o.key} value={o.key}>
          {({ isSelected }) => (
            <Radio.Content className="flex cursor-pointer items-center gap-2 text-base text-fg">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border-2 transition-colors motion-reduce:transition-none",
                  isSelected ? "border-accent" : "border-fg/60",
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full bg-accent transition-transform motion-reduce:transition-none",
                    isSelected ? "scale-100" : "scale-0",
                  )}
                />
              </span>
              {o.label}
            </Radio.Content>
          )}
        </Radio>
      ))}
      {trailing}
    </RadioGroup>
  );
}
