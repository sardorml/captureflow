"use client";

import type { ReactNode } from "react";
import { ArrowLeft, History, Redo2, Smile, Undo2 } from "lucide-react";
import { useAppMessages } from "@/components/app-i18n-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableTitle } from "@/app/_components/EditableTitle";
import { fmt } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "./use-editor-config";

type Props = {
  slug: string;
  title: string;
  onBack: () => void;
  onFinish: () => void;
  status: SaveStatus;
  saveError: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export function EditorTopBar({
  slug,
  title,
  onBack,
  onFinish,
  status,
  saveError,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  const m = useAppMessages();
  const t = m.recordingEditor.topBar;
  const statusLabel: Record<SaveStatus, string> = {
    ...t.status,
    saving: m.common.saving,
  };
  const statusNode: ReactNode = (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "mr-1 flex items-center gap-1.5 text-xs",
        status === "error" ? "text-destructive" : "text-fg-muted",
      )}
    >
      {status === "saving" ? (
        <Spinner />
      ) : (
        <Smile className="h-4 w-4" aria-hidden />
      )}
      <span>{statusLabel[status]}</span>
    </span>
  );

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.back}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* The same rename control as the share page's header, so the title
            reads and edits the same way on both. */}
        <div className="max-w-3xl min-w-0 flex-1 px-3">
          <EditableTitle
            slug={slug}
            title={title.trim() || m.library.recording.untitled}
            canEdit
            sizeClassName="text-xl lg:text-xl"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {status === "error" && saveError ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex" tabIndex={0}>
                {statusNode}
              </span>
            </TooltipTrigger>
            <TooltipContent>{saveError}</TooltipContent>
          </Tooltip>
        ) : (
          statusNode
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex" tabIndex={0}>
              <span className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md text-fg-subtle opacity-50">
                <History className="h-4 w-4" />
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t.versionHistory}</TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={t.undo}
          title={fmt(t.undoShortcut, { key: "⌘Z" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label={t.redo}
          title={fmt(t.redoShortcut, { key: "⇧⌘Z" })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <Button onClick={onFinish} className="ml-1">
          {t.finish}
        </Button>
      </div>
    </header>
  );
}
