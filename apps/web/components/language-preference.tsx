"use client";

import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/lib/i18n/config";
import { parseLanguageChoice, rememberLanguage } from "@/lib/i18n/preference";
import { useAppLocale, useAppMessages } from "./app-i18n-provider";

// Saves the choice in a cookie and re-renders the page in the new language.
export function LanguagePreference({ className }: { className?: string }) {
  const router = useRouter();
  const { locale } = useAppLocale();
  const label = useAppMessages().common.language;

  const choose = (value: string) => {
    const next = parseLanguageChoice(value);
    if (!next || next === locale) return;
    rememberLanguage(next);
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={choose}>
      <SelectTrigger aria-label={label} className={className}>
        <span className="flex items-center gap-2">
          <Globe className="text-muted-foreground" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
