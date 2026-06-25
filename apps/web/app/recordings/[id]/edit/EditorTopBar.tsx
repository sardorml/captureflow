"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, History, Pencil, Redo2, Smile, Undo2 } from "lucide-react";
import { Button, Spin, Tooltip } from "antd";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "./use-editor-config";

type Props = {
  title: string;
  onRename: (next: string) => Promise<string | null>;
  onBack: () => void;
  onFinish: () => void;
  status: SaveStatus;
  saveError: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "Edits save automatically",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save",
};

export function EditorTopBar({
  title,
  onRename,
  onBack,
  onFinish,
  status,
  saveError,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wasEditing = useRef(false);

  // Return focus to the rename trigger when leaving the inline editor (commit,
  // cancel, or failure), so keyboard users aren't dropped onto <body>.
  useEffect(() => {
    if (wasEditing.current && !editing) triggerRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const commit = async (): Promise<void> => {
    const next = draft.trim();
    if (next === title.trim()) {
      setEditing(false);
      return;
    }
    setPending(true);
    setError(null);
    const err = await onRename(next);
    setPending(false);
    if (err) {
      setError(err);
      return;
    }
    setEditing(false);
  };

  const statusNode: ReactNode = (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "mr-1 flex items-center gap-1.5 text-xs",
        status === "error" ? "text-danger" : "text-fg-muted",
      )}
    >
      {status === "saving" ? (
        <Spin size="small" />
      ) : (
        <Smile className="h-4 w-4" aria-hidden />
      )}
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas-2 px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to recording"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {editing ? (
          <form
            className="flex min-w-0 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              void commit();
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => void commit()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDraft(title);
                  setEditing(false);
                  setError(null);
                }
              }}
              maxLength={200}
              placeholder="Untitled recording"
              disabled={pending}
              className="w-[28rem] max-w-[50vw] rounded-md border border-line bg-canvas px-2 py-1 text-sm text-fg focus:border-line-strong focus:outline-none disabled:opacity-50"
            />
          </form>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setDraft(title);
              setEditing(true);
            }}
            className="group flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-overlay"
            title="Rename"
          >
            <span className="truncate text-sm font-medium text-fg">
              {title.trim() || "Untitled recording"}
            </span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        {error && (
          <span role="alert" className="text-xs text-danger">
            {error}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {status === "error" && saveError ? (
          <Tooltip title={saveError}>{statusNode}</Tooltip>
        ) : (
          statusNode
        )}
        <Tooltip title="Version history (coming soon)">
          <span className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md text-fg-subtle opacity-50">
            <History className="h-4 w-4" />
          </span>
        </Tooltip>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <Button type="primary" onClick={onFinish} className="ml-1">
          Finish
        </Button>
      </div>
    </header>
  );
}
