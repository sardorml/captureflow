"use client";

import { useState } from "react";
import { Captions, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The wide right column. Loom keeps it for the transcript only; ours is a
// placeholder until transcripts are generated. Hidden on narrow viewports so
// the player + tool rail keep room.
export function EditorTranscriptPanel() {
  const [open, setOpen] = useState(true);
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-canvas-2 p-4 lg:flex">
      <section className="rounded-lg border border-line bg-canvas p-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="transcript-body"
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            <Captions className="h-4 w-4" />
            Transcript
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-fg-subtle transition-transform",
              !open && "-rotate-90",
            )}
          />
        </button>
        {open ? (
          <div
            id="transcript-body"
            className="mt-3 flex flex-col items-center gap-1 py-4 text-center"
          >
            <Captions className="h-6 w-6 text-fg-subtle" />
            <p className="text-sm font-medium text-fg">
              No transcript available
            </p>
            <p className="text-xs text-fg-muted">
              Transcripts aren&apos;t generated for this recording yet.
            </p>
          </div>
        ) : null}
      </section>
    </aside>
  );
}
