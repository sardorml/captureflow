import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// `.marketing-root` scopes the landing's light palette + Inter typeface (see
// app/marketing.css) to the marketing subtree so the dashboard's token theme is
// never touched. The landing is English-only and always light/LTR.
//
// `overflow-x-clip` contains decorative elements wider than a narrow viewport so
// mobile never gets a horizontal scroll; `clip` (not `hidden`) keeps the fixed
// nav and vertical sticky behavior working.
export function MarketingShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn('marketing-root overflow-x-clip', className)}
      data-theme="light"
      dir="ltr"
      lang="en"
    >
      {children}
    </div>
  );
}
