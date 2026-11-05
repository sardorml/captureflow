"use client";

import { Globe, Lock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppMessages } from "@/components/app-i18n-provider";

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
  const copy = useAppMessages().library.visibility;
  // Already-public legacy rows stay selectable so the owner can flip them.
  const showPublic = allowPublic || value === "public";
  const options: Visibility[] = [
    ...(showPublic ? (["public"] as const) : []),
    "workspace",
    "private",
  ];

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => onChange(next as Visibility)}
    >
      <SelectTrigger aria-label={copy.label} className="min-w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            textValue={copy.labels[option]}
          >
            <span className="inline-flex items-center gap-1.5">
              {icon(option)}
              {copy.labels[option]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
