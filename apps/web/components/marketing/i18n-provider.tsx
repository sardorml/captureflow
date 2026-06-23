'use client';

import type { ReactNode } from 'react';
import { MESSAGES, type Messages } from '@/lib/marketing/messages';

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useMessages(): Messages {
  return MESSAGES;
}

export function useLocalizedHref(): (href: string) => string {
  return (href: string) => href;
}

export function useLocale(): string {
  return 'en';
}
