import { MESSAGES, type Messages } from "@/lib/marketing/messages";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { USD, type Money } from "./money";

export type I18n = { locale: Locale; messages: Messages; money: Money };

export const ENGLISH: I18n = {
  locale: DEFAULT_LOCALE,
  messages: MESSAGES,
  money: USD,
};
