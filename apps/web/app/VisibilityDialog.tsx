"use client";

import {
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import {
  SmoothDialog,
  SmoothDialogContent,
  SmoothDialogTitle,
  SmoothDialogTrigger,
  VisibilityPicker,
} from "@captureflow/ui";

export type Visibility = "public" | "workspace" | "private";

type Props = {
  value: Visibility;
  disabled?: boolean;
  onChange: (next: Visibility) => Promise<void> | void;
  allowPublic?: boolean;
  workspaceName?: string | null;
  // Rendered inside SmoothDialogTrigger asChild — must accept a forwarded ref.
  trigger: ReactNode;
};

export function VisibilityDialog({
  value,
  disabled,
  onChange,
  allowPublic = true,
  workspaceName,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const showPublic = allowPublic || value === "public";

  const pick = (next: Visibility) => {
    if (next === value) return;
    startTransition(async () => {
      await onChange(next);
    });
  };

  /*
   * Radix's asChild Slot injects a generated useId the client can't reproduce
   * 1:1, so wiring the trigger during SSR breaks hydration (and Fast Refresh).
   * Render the bare trigger until mounted, then swap in the live dialog.
   */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return <>{trigger}</>;

  return (
    <SmoothDialog open={open} onOpenChange={setOpen}>
      <SmoothDialogTrigger asChild disabled={disabled}>
        {trigger}
      </SmoothDialogTrigger>
      <SmoothDialogContent className="sm:max-w-md">
        <SmoothDialogTitle className="flex items-center gap-2">
          Visibility
          {pending && (
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-blue-600 dark:text-blue-300">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              Updating…
            </span>
          )}
        </SmoothDialogTitle>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          General access
        </p>
        <div className="mt-3">
          <VisibilityPicker
            value={value}
            onChange={pick}
            showPublic={showPublic}
            workspaceName={workspaceName}
            disabled={pending || disabled}
          />
        </div>
      </SmoothDialogContent>
    </SmoothDialog>
  );
}
