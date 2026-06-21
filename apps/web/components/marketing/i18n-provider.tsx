'use client';

import type { ReactNode } from 'react';
import { MESSAGES, type Messages } from '@/lib/marketing/messages';

// Single-locale (English) stand-in for Framely's full i18n system. CaptureFlow's
// landing ships English only, so these hooks return the static catalog and an
// identity href mapper. The marketing components keep their `m.*` / `lh()` call
// sites unchanged — there's just no locale machinery, RTL flipping, or message
// fetching behind them.

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// The active marketing copy. Always the English catalog.
export function useMessages(): Messages {
  return MESSAGES;
}

// No locale prefixes on this site, so hrefs pass through unchanged.
export function useLocalizedHref(): (href: string) => string {
  return (href: string) => href;
}

// Always English; kept so call sites (MarketingShell, nav) compile unchanged.
export function useLocale(): string {
  return 'en';
}
