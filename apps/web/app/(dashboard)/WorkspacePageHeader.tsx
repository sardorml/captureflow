import type { ReactNode } from "react";
import { SplitLoaded } from "@/components/dev/split-loaded";

// The workspace's name as an eyebrow over the page title: these pages act on
// one workspace, and the switcher can be out of view in the drawer.
export function WorkspacePageHeader({
  workspaceName,
  title,
  actions,
}: {
  workspaceName: ReactNode;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <SplitLoaded name="page" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg-muted">{workspaceName}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-panel ring-1 ring-line">
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h2>
        <p className="mt-1 text-base text-fg-muted">{description}</p>
      </div>
      <div className="divide-y divide-line border-t border-line px-6 [&>*]:py-6">
        {children}
      </div>
    </section>
  );
}
