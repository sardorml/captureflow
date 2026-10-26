import type { ReactNode } from "react";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { RecordButton } from "./RecordButton";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showRecord?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  showRecord = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      {/* Every dashboard page opens with this header, so it marks the page
          content as streamed in. */}
      <SplitLoaded name="page" />
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-base text-fg-muted">{subtitle}</p>}
      </div>
      {(actions || showRecord) && (
        <div className="flex items-center gap-2">
          {actions}
          {/* Recording needs the desktop app or the extension, so the button
              has nothing to offer a phone. */}
          {showRecord && (
            <div className="hidden md:block">
              <RecordButton label="New recording" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
