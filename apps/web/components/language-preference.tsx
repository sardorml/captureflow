"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chooseLanguageAction } from "@/app/choose-language-action";
import { LANGUAGE_OPTIONS } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useAppLocale, useAppMessages } from "./app-i18n-provider";

// Saves the choice in a cookie and re-renders the page in the new language.
export function LanguagePreference({ className }: { className?: string }) {
  const { locale } = useAppLocale();
  const label = useAppMessages().common.language;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const choose = (value: string) => {
    if (value === locale) return;
    startTransition(async () => {
      const res = await chooseLanguageAction(value);
      setError(res.error);
    });
  };

  return (
    <Select value={locale} onValueChange={choose} disabled={pending}>
      <SelectTrigger
        aria-label={label}
        aria-invalid={error ? true : undefined}
        className={cn(pending && "opacity-70", className)}
      >
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
