"use client";

import { ListBox, Select } from "@heroui/react";

// React Aria mirrors the listbox into a hidden native <select name={name}>, so
// this drops into a plain form action with nothing extra to wire up.
export function OptionSelect({
  name,
  label,
  defaultValue,
  options,
  className,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly { id: string; label: string }[];
  className?: string;
}) {
  return (
    <Select name={name} defaultSelectedKey={defaultValue} aria-label={label}>
      <Select.Trigger className={className ?? "min-w-[140px]"}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
