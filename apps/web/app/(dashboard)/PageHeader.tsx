import type { ReactNode } from "react";
import { Video } from "lucide-react";

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
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium tracking-tight text-neutral-500">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {(actions || showRecord) && (
        <div className="flex items-center gap-2">
          {actions}
          {showRecord && (
            <a
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500"
              href="captureflow://record"
            >
              <Video className="h-4 w-4" />
              New recording
            </a>
          )}
        </div>
      )}
    </header>
  );
}
