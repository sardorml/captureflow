'use client';

import { Check, Globe, Lock, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

// Shared "Public / Workspace / Private" radio cards used by every
// surface that lets the user change a share or snap's visibility:
// the share viewer, snap viewer, and dashboard.
//
// Keeping the markup + colour treatment in one place means the three
// surfaces can't drift on hover/selected styling or copy. Theme-aware
// token classes drive the active state so light mode stays readable
// (the inline copies previously rendered blue-100 text on a
// blue-500/15 background — invisible against a white card).

export type Visibility = 'public' | 'workspace' | 'private';

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: 'Public',
  workspace: 'Workspace',
  private: 'Private',
};

export const VISIBILITY_DESCRIPTIONS: Record<Visibility, string> = {
  public: 'Anyone with the link can view',
  workspace: 'Only signed-in workspace members can view',
  private: 'Only you can view',
};

type PickerProps = {
  value: Visibility;
  onChange: (next: Visibility) => void;
  // Toggles visibility of the Public option. Used by surfaces that
  // know the workspace policy disallows public links — they still want
  // to show "Public" as the current selection if the row was uploaded
  // before the policy changed, otherwise it should be hidden entirely.
  showPublic?: boolean;
  // Toggles the Workspace option. Legacy anonymous uploads have no
  // workspace and shouldn't see the option.
  showWorkspace?: boolean;
  // Appended to the workspace option's label ("Workspace · Acme").
  workspaceName?: string | null;
  disabled?: boolean;
  className?: string;
};

export function VisibilityPicker({
  value,
  onChange,
  showPublic = true,
  showWorkspace = true,
  workspaceName,
  disabled,
  className,
}: PickerProps) {
  const renderPublic = showPublic || value === 'public';
  const renderWorkspace = showWorkspace || value === 'workspace';
  return (
    <fieldset
      disabled={disabled}
      aria-label="Visibility"
      className={cn(
        'grid gap-1.5 rounded-lg border border-line-strong bg-canvas-2 p-3',
        className
      )}
    >
      {renderPublic && (
        <Option
          value="public"
          current={value}
          onChange={onChange}
          icon={<Globe className="h-4 w-4" />}
        />
      )}
      {renderWorkspace && (
        <Option
          value="workspace"
          current={value}
          onChange={onChange}
          icon={<Users className="h-4 w-4" />}
          label={workspaceName ? `Workspace · ${workspaceName}` : undefined}
        />
      )}
      <Option
        value="private"
        current={value}
        onChange={onChange}
        icon={<Lock className="h-4 w-4" />}
      />
    </fieldset>
  );
}

// Read-only single-row variant for visitors who are not the owner
// (the dialog still surfaces the current visibility so they understand
// why they can or can't access).
export function ReadonlyVisibilityRow({ value }: { value: Visibility }) {
  const Icon =
    value === 'public' ? Globe : value === 'workspace' ? Users : Lock;
  return (
    <div className="flex items-center gap-3 px-2.5 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-overlay text-fg-muted">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-fg">
          {VISIBILITY_LABELS[value]}
        </p>
        <p className="text-xs text-fg-muted">
          {VISIBILITY_DESCRIPTIONS[value]}
        </p>
      </div>
    </div>
  );
}

function Option({
  value,
  current,
  onChange,
  icon,
  label,
}: {
  value: Visibility;
  current: Visibility;
  onChange: (next: Visibility) => void;
  icon: ReactNode;
  label?: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
        active
          ? 'bg-accent-soft text-accent ring-1 ring-accent-ring'
          : 'text-fg hover:bg-overlay'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          active ? 'bg-accent-soft text-accent' : 'bg-overlay text-fg-muted'
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">
          {label ?? VISIBILITY_LABELS[value]}
        </span>
        <span
          className={cn(
            'block text-xs',
            active ? 'text-accent opacity-80' : 'text-fg-muted'
          )}
        >
          {VISIBILITY_DESCRIPTIONS[value]}
        </span>
      </span>
      {active && <Check className="mt-1 h-4 w-4 text-accent" />}
    </button>
  );
}
