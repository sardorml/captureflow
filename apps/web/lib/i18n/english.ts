import { MESSAGES, type Messages } from "@/lib/marketing/messages";
import { DEFAULT_LOCALE, type Locale } from "./config";

export type I18n = { locale: Locale; messages: Messages };

export const ENGLISH: I18n = { locale: DEFAULT_LOCALE, messages: MESSAGES };
