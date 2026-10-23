"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Captions,
  ChevronDown,
  RotateCcw,
  Scissors,
  Undo2,
} from "lucide-react";
import { Button, Spinner } from "@heroui/react";
import {
  resetTranscriptEditsAction,
  saveTranscriptEditsAction,
} from "@/app/actions";
import { formatTimestamp } from "@/lib/format";
import { addCut, removeCut, type RecordingCut } from "@/lib/recording/cuts";
import { activeSegmentId, isSegmentCut } from "@/lib/recording/transcript";
import type {
  RecordingTranscript,
  TranscriptSegment,
} from "@/lib/recording/types";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  initialTranscript: RecordingTranscript | null;
  initialHasEdits: boolean;
  cuts: RecordingCut[];
  onCutsChange: (cuts: RecordingCut[]) => void;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
  onSelectionChange: (span: RecordingCut | null) => void;
};

type Selection = { anchorId: string; headId: string };

/*
 * The wide right column. Click a line to select it and move the playhead,
 * shift-click to extend, Delete to cut the selection out of playback,
 * double-click to fix the text. Hidden on narrow viewports so the player
 * and tool rail keep room.
 */
export function EditorTranscriptPanel({
  slug,
  initialTranscript,
  initialHasEdits,
  cuts,
  onCutsChange,
  onSeek,
  getCurrentMs,
  onSelectionChange,
}: Props) {
  const [open, setOpen] = useState(true);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [hasEdits, setHasEdits] = useState(initialHasEdits);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [pending, startTransition] = useTransition();

  const segments = useMemo(() => transcript?.segments ?? [], [transcript]);

  useEffect(() => {
    const id = window.setInterval(() => setCurrentMs(getCurrentMs()), 500);
    return () => window.clearInterval(id);
  }, [getCurrentMs]);

  const selectedRange = useMemo(() => {
    if (!selection) return null;
    const a = segments.findIndex((s) => s.id === selection.anchorId);
    const h = segments.findIndex((s) => s.id === selection.headId);
    if (a < 0 || h < 0) return null;
    return { from: Math.min(a, h), to: Math.max(a, h) };
  }, [segments, selection]);

  const selectionSpan = useMemo((): RecordingCut | null => {
    if (!selectedRange) return null;
    const picked = segments.slice(selectedRange.from, selectedRange.to + 1);
    return {
      startMs: picked[0]!.startMs,
      endMs: Math.max(...picked.map((s) => s.endMs)),
    };
  }, [segments, selectedRange]);

  useEffect(() => {
    onSelectionChange(selectionSpan);
  }, [selectionSpan, onSelectionChange]);

  // Once a selection has been cut (from here or the timeline) it has done its job.
  useEffect(() => {
    if (!selectedRange) return;
    const picked = segments.slice(selectedRange.from, selectedRange.to + 1);
    if (picked.some((s) => isSegmentCut(s, cuts))) setSelection(null);
  }, [cuts, segments, selectedRange]);

  const activeId = activeSegmentId(segments, currentMs);

  const onRowClick = (
    segment: TranscriptSegment,
    e: ReactMouseEvent<HTMLElement>,
  ): void => {
    if (e.shiftKey && selection) {
      setSelection({ anchorId: selection.anchorId, headId: segment.id });
    } else {
      setSelection({ anchorId: segment.id, headId: segment.id });
    }
    onSeek(segment.startMs);
  };

  const startEditing = (segment: TranscriptSegment): void => {
    setEditingId(segment.id);
    setDraft(segment.text);
    setError(null);
  };

  const commitEdit = (): void => {
    if (!transcript || editingId === null) return;
    const id = editingId;
    setEditingId(null);
    const text = draft.replace(/\s+/g, " ").trim();
    const current = transcript.segments.find((s) => s.id === id);
    if (!current || current.text === text) return;
    const previous = transcript;
    const optimistic: RecordingTranscript = {
      ...transcript,
      segments: transcript.segments
        .map((s) => (s.id === id ? { ...s, text, words: undefined } : s))
        .filter((s) => s.text.length > 0),
    };
    setTranscript(optimistic);
    setError(null);
    startTransition(async () => {
      const res = await saveTranscriptEditsAction(slug, {
        segments: optimistic.segments.map((s) => ({ id: s.id, text: s.text })),
      });
      if (res.error || !res.transcript) {
        setTranscript(previous);
        setError(res.error ?? "Could not save");
        return;
      }
      setTranscript(res.transcript);
      setHasEdits(true);
    });
  };

  const resetEdits = (): void => {
    setError(null);
    startTransition(async () => {
      const res = await resetTranscriptEditsAction(slug);
      if (res.error || !res.transcript) {
        setError(res.error ?? "Could not reset");
        return;
      }
      setTranscript(res.transcript);
      setHasEdits(false);
    });
  };

  const deleteSelection = (): void => {
    if (!selectionSpan) return;
    onCutsChange(addCut(cuts, selectionSpan));
  };

  const restore = (segment: TranscriptSegment): void => {
    onCutsChange(
      removeCut(cuts, { startMs: segment.startMs, endMs: segment.endMs }),
    );
  };

  const onDraftKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingId(null);
    }
  };

  const selectedCount = selectedRange
    ? selectedRange.to - selectedRange.from + 1
    : 0;

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto bg-canvas-2 p-4 lg:flex">
      <section className="flex min-h-0 flex-col rounded-3xl bg-panel p-4">
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
            {hasEdits ? (
              <span className="rounded-full bg-tint px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-fg-subtle">
                Edited
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-fg-subtle transition-transform",
              !open && "-rotate-90",
            )}
          />
        </button>

        {open && !transcript ? (
          <div
            id="transcript-body"
            className="mt-3 flex flex-col items-center gap-1 py-4 text-center"
          >
            <Captions className="h-6 w-6 text-fg-subtle" />
            <p className="text-sm font-medium text-fg">
              No transcript available
            </p>
            <p className="text-xs text-fg-muted">
              The Chrome extension writes one while you record with the
              microphone on.
            </p>
          </div>
        ) : null}

        {open && transcript ? (
          <div id="transcript-body" className="mt-3 flex min-h-0 flex-col">
            <div className="flex min-h-8 items-center justify-between gap-2">
              {selectedCount > 0 ? (
                <Button
                  variant="danger-soft"
                  size="sm"
                  onPress={deleteSelection}
                >
                  <Scissors className="h-3.5 w-3.5" />
                  Delete{" "}
                  {selectedCount === 1 ? "line" : `${selectedCount} lines`}
                </Button>
              ) : (
                <p className="text-[11px] leading-snug text-fg-subtle">
                  Click a line to select, shift-click to extend, double-click to
                  fix the text.
                </p>
              )}
              {hasEdits ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={resetEdits}
                  isDisabled={pending}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              ) : null}
            </div>
            {error ? (
              <p className="mt-2 rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger">
                {error}
              </p>
            ) : null}
            <ol className="mt-2 space-y-0.5">
              {segments.map((segment, index) => {
                const isCut = isSegmentCut(segment, cuts);
                const isSelected =
                  !!selectedRange &&
                  index >= selectedRange.from &&
                  index <= selectedRange.to;
                const isActive = segment.id === activeId;
                if (editingId === segment.id) {
                  return (
                    <li key={segment.id} className="rounded-md bg-field p-2">
                      <textarea
                        autoFocus
                        value={draft}
                        rows={Math.max(2, Math.ceil(draft.length / 36))}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onDraftKeyDown}
                        onBlur={commitEdit}
                        aria-label="Edit transcript line"
                        className="block w-full resize-none bg-transparent text-sm leading-relaxed text-fg focus:outline-none"
                      />
                    </li>
                  );
                }
                return (
                  <li key={segment.id} className="group relative">
                    <button
                      type="button"
                      onClick={(e) => onRowClick(segment, e)}
                      onDoubleClick={() => {
                        if (!isCut) startEditing(segment);
                      }}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                        isSelected
                          ? "bg-accent/20 text-fg"
                          : isActive
                            ? "bg-tint text-fg"
                            : "text-fg-muted hover:bg-tint",
                        isCut &&
                          "text-fg-subtle line-through decoration-danger/60",
                      )}
                    >
                      <span className="shrink-0 pt-0.5 font-mono text-[11px] text-fg-subtle">
                        {formatTimestamp(segment.startMs)}
                      </span>
                      <span className="text-sm leading-relaxed">
                        {segment.text}
                      </span>
                    </button>
                    {isCut ? (
                      <button
                        type="button"
                        onClick={() => restore(segment)}
                        className="absolute right-1 top-1 hidden items-center gap-1 rounded-md bg-panel px-1.5 py-0.5 text-[11px] text-fg-muted shadow-sm hover:text-fg group-hover:flex"
                      >
                        <Undo2 className="h-3 w-3" />
                        Restore
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {pending ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-fg-subtle">
                <Spinner size="sm" />
                Saving…
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </aside>
  );
}
