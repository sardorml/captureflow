"use client";

import type { ReactNode } from "react";
import { ArrowLeft, History, Redo2, Smile, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableTitle } from "@/app/_components/EditableTitle";
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

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "Edits save automatically",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save",
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
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to recording"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* The same rename control as the share page's header, so the title
            reads and edits the same way on both. */}
        <div className="min-w-0 flex-1 px-3">
          <EditableTitle
            slug={slug}
            title={title.trim() || "Untitled recording"}
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
          <TooltipContent>Version history (coming soon)</TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-tint hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <Button onClick={onFinish} className="ml-1">
          Finish
        </Button>
      </div>
    </header>
  );
}
