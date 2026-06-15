'use client';

import {
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from 'react';
import {
  SmoothDialog,
  SmoothDialogContent,
  SmoothDialogTitle,
  SmoothDialogTrigger,
  VisibilityPicker,
} from '@captureflow/ui';

// Dashboard visibility picker — modal flavour. Mirrors the share
// viewer's ShareActions dialog so the "Public / Workspace / Private"
// choice reads identically wherever a user changes it. The trigger
// element is the row's existing chip; clicking it opens the modal,
// the radio cards drive `onChange`, and the dialog stays open while
// the server transition runs so the user sees the affordance settle.

export type Visibility = 'public' | 'workspace' | 'private';

type Props = {
  value: Visibility;
  disabled?: boolean;
  // Fires when the user picks a new option. Caller owns the server
  // round-trip; we surface the optimistic value back via the chip's
  // own `value` prop on the next render.
  onChange: (next: Visibility) => Promise<void> | void;
  allowPublic?: boolean;
  // Optional workspace name appended to the workspace option's label
  // ("Workspace · Acme"). When omitted, the bare label is used.
  workspaceName?: string | null;
  // The chip / button that opens the dialog. Rendered inside
  // SmoothDialogTrigger asChild — must accept a forwarded ref and
  // click handler.
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
  const showPublic = allowPublic || value === 'public';

  const pick = (next: Visibility) => {
    if (next === value) return;
    startTransition(async () => {
      await onChange(next);
    });
  };

  // The trigger chip is authored by the caller (often a Server Component) and
  // handed to Radix's `asChild` Slot, which injects aria/data attributes + a
  // generated id on the client. Rendering it wired-up during SSR produces a
  // useId the client can't reproduce 1:1, so hydration fails (and a failed
  // hydration disables Fast Refresh). Render the bare trigger until mounted,
  // then swap in the live dialog so server and first client render match.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
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
