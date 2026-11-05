"use server";

import { cookies } from "next/headers";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  parseLanguageChoice,
} from "@/lib/i18n/preference";

/*
 * Set from the server, not document.cookie, so the router drops every page it
 * has prefetched: an English address fetched before the change still holds a
 * redirect to the old language, and router.refresh() keeps those.
 */
export async function chooseLanguageAction(
  value: string,
): Promise<{ error: string | null }> {
  const locale = parseLanguageChoice(value);
  if (!locale) return { error: "Unknown language." };
  (await cookies()).set(LANGUAGE_COOKIE, locale, {
    path: "/",
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return { error: null };
}
