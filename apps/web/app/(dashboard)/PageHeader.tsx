import type { ReactNode } from "react";
import { RecordButton } from "./RecordButton";

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: ReactNode;
  showRecord?: boolean;
};

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  actions,
  showRecord = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium tracking-tight text-fg-subtle">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>}
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
