"use client";

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rememberLanguage } from "@/lib/i18n/preference";
import { useLanguageOptions } from "./i18n-provider";

// Remembers the choice, so it outranks the visitor's location from then on.
export function LanguageSelect({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const options = useLanguageOptions();
  const current = options.find((option) => option.current);

  const choose = (code: string) => {
    const option = options.find((o) => o.code === code);
    if (!option) return;
    rememberLanguage(option.code);
    window.location.assign(option.href);
  };

  return (
    <Select value={current?.code} onValueChange={choose}>
      <SelectTrigger aria-label={label} className={className}>
        <span className="flex items-center gap-2">
          <Globe className="text-fg-muted" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" side="top" align="end">
        {options.map((option) => (
          <SelectItem key={option.code} value={option.code} lang={option.lang}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
