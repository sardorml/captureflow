"use client";

import { ListBox, Select } from "@heroui/react";

// React Aria mirrors the listbox into a hidden native <select name={name}>, so
// this drops into a plain form action with nothing extra to wire up.
export function RoleSelect({
  name,
  label,
  defaultRole,
  roles,
}: {
  name: string;
  label: string;
  defaultRole: string;
  roles: readonly string[];
}) {
  return (
    <Select name={name} defaultSelectedKey={defaultRole} aria-label={label}>
      <Select.Trigger className="min-w-[124px]">
        <Select.Value />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {roles.map((role) => (
            <ListBox.Item key={role} id={role} textValue={role}>
              {role}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

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
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
