'use client';

import { Check, Globe, Lock, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

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
  // Still renders when the current value is already 'public' (row uploaded before policy changed) so the selection stays visible.
  showPublic?: boolean;
  showWorkspace?: boolean;
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
