'use client';

import type { ReactNode } from 'react';
import { MESSAGES, type Messages } from '@/lib/marketing/messages';

// Single-locale (English) i18n shim. The landing ships English only, so these
// hooks return the static catalog and an identity href mapper, letting marketing
// components keep their `m.*` / `lh()` call sites unchanged with no locale
// machinery behind them.

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

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
