"use client";

import { Globe, Lock, Users } from "lucide-react";
import { Select } from "antd";

export type Visibility = "public" | "workspace" | "private";

type Props = {
  value: Visibility;
  disabled?: boolean;
  onChange: (next: Visibility) => void;
  allowPublic?: boolean;
};

function icon(value: Visibility) {
  if (value === "public") return <Globe size={14} />;
  if (value === "workspace") return <Users size={14} />;
  return <Lock size={14} />;
}

export function VisibilitySelect({
  value,
  disabled,
  onChange,
  allowPublic = true,
}: Props) {
  // Already-public legacy rows stay selectable so the owner can flip them.
  const showPublic = allowPublic || value === "public";
  const options = [
    ...(showPublic
      ? [{ value: "public", label: "Public", icon: icon("public") }]
      : []),
    { value: "workspace", label: "Workspace", icon: icon("workspace") },
    { value: "private", label: "Private", icon: icon("private") },
  ];
  return (
    <Select<Visibility>
      size="small"
      variant="filled"
      value={value}
      disabled={disabled}
      onChange={(next) => onChange(next)}
      aria-label="Visibility"
      style={{ minWidth: 130 }}
      options={options.map((o) => ({
        value: o.value,
        label: (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {o.icon}
            {o.label}
          </span>
        ),
      }))}
    />
  );
}
