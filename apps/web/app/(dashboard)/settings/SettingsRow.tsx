import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// One setting: its name and what it does on the left, the control on the
// right. `stacked` drops the control under the text for wide controls.
export function SettingsRow({
  title,
  description,
  stacked = false,
  children,
}: {
  title: string;
  description: ReactNode;
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-6",
        stacked
          ? "flex-col"
          : "flex-wrap items-start justify-between md:flex-nowrap",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1",
          stacked ? "" : "min-w-60 flex-1 md:max-w-sm",
        )}
      >
        <p className="text-base leading-7 font-semibold text-foreground">
          {title}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className={stacked ? "" : "flex w-full flex-col gap-2 md:max-w-96"}>
        {children}
      </div>
    </div>
  );
}
