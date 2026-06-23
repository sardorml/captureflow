import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * `.marketing-root` scopes the landing's light palette to the marketing subtree
 * (see app/marketing.css) so the dashboard theme is untouched. Use `clip` (not
 * `hidden`) so the fixed nav and vertical sticky behavior keep working.
 */
export function MarketingShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("marketing-root overflow-x-clip", className)}
      data-theme="light"
      dir="ltr"
      lang="en"
    >
      {children}
    </div>
  );
}
