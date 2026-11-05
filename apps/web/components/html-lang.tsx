"use client";

import { useEffect } from "react";
import { DEFAULT_LANG } from "@/lib/i18n/config";

/*
 * The root layout is static and shared with the app, so it always says
 * lang="en". The worker rewrites the attribute in a translated page's HTML;
 * this keeps it right across client-side navigation, in both directions.
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = DEFAULT_LANG;
    };
  }, [lang]);
  return null;
}
