"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Captions, RotateCcw, Scissors, Undo2, X } from "lucide-react";
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
  TranscriptStatus,
} from "@/lib/recording/types";
import { cn } from "@/lib/utils";

export type EditorTranscriptPanelProps = {
  slug: string;
  initialTranscript: RecordingTranscript | null;
  transcriptStatus: TranscriptStatus;
  initialHasEdits: boolean;
  cuts: RecordingCut[];
  onCutsChange: (cuts: RecordingCut[]) => void;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
  // The editor's shared selection; when it moves elsewhere (a timeline
  // segment, or cleared with Escape) the lines here let go too.
  selection: RecordingCut | null;
  onSelectionChange: (span: RecordingCut | null) => void;
  // Fires once the server holds a new transcript text, so the player can
  // fetch fresh captions.
  onTranscriptSaved?: () => void;
};

type Selection = { anchorId: string; headId: string };

/*
 * The transcript tab of the inspector. Click a line to select it and move the
 * playhead, shift-click to extend, Delete to cut the selection out of
 * playback, double-click to fix the text.
 */
export function EditorTranscriptPanel({
  slug,
  initialTranscript,
  transcriptStatus,
  initialHasEdits,
  cuts,
  onCutsChange,
  onSeek,
  getCurrentMs,
  selection: sharedSelection,
  onSelectionChange,
  onTranscriptSaved,
}: EditorTranscriptPanelProps) {
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

  // A clear forced by the shared selection moving elsewhere must not be
  // reported back, or it would wipe the pick that caused it.
  const yieldingRef = useRef(false);
  useEffect(() => {
    if (yieldingRef.current) {
      yieldingRef.current = false;
      return;
    }
    onSelectionChange(selectionSpan);
  }, [selectionSpan, onSelectionChange]);

  // Reacts to the shared selection alone: the parent's state lags one
  // render behind the effect above, so reading the own span through a ref
  // keeps a fresh pick from clearing itself.
  const ownSpanRef = useRef(selectionSpan);
  ownSpanRef.current = selectionSpan;
  useEffect(() => {
    const own = ownSpanRef.current;
    if (!own) return;
    if (
      !sharedSelection ||
      sharedSelection.startMs !== own.startMs ||
      sharedSelection.endMs !== own.endMs
    ) {
      yieldingRef.current = true;
      setSelection(null);
    }
  }, [sharedSelection]);

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
    } else if (
      selection?.anchorId === segment.id &&
      selection.headId === segment.id
    ) {
      // A second click on the only selected line lets it go.
      setSelection(null);
      return;
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
      onTranscriptSaved?.();
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
      onTranscriptSaved?.();
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

  if (!transcript) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
        {transcriptStatus === "pending" ? (
          <Spinner size="sm" />
        ) : (
          <Captions className="h-6 w-6 text-fg-subtle" />
        )}
        <p className="mt-2 text-sm font-medium text-fg">
          {transcriptStatus === "pending"
            ? "Transcribing…"
            : "No transcript available"}
        </p>
        <p className="text-xs text-fg-muted">
          {transcriptStatus === "pending"
            ? "Reload this page in a minute to edit it."
            : transcriptStatus === "failed"
              ? "Transcription didn't finish for this recording."
              : "Record with the microphone on and one is written for you."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-1.5">
        {selectedCount > 0 ? (
          <span className="flex items-center gap-1">
            <Button variant="danger-soft" size="sm" onPress={deleteSelection}>
              <Scissors className="h-3.5 w-3.5" />
              Delete {selectedCount === 1 ? "line" : `${selectedCount} lines`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setSelection(null)}
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        ) : (
          <p className="text-[11px] leading-snug text-fg-subtle">
            Click a line to select, shift-click to extend, double-click to fix
            the text.
          </p>
        )}
        {hasEdits ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={resetEdits}
            isDisabled={pending}
            className="shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset edits
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mx-4 mt-2 rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ol className="space-y-0.5">
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
                    "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                    isSelected
                      ? "bg-accent/20 text-fg"
                      : isActive
                        ? "bg-tint text-fg"
                        : "text-fg-muted hover:bg-tint",
                    isCut && "text-fg-subtle line-through decoration-danger/60",
                  )}
                >
                  <span className="shrink-0 pt-0.5 font-mono text-[11px] text-fg-subtle tabular-nums">
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
                    className="absolute top-1 right-1 hidden items-center gap-1 rounded-md bg-panel px-1.5 py-0.5 text-[11px] text-fg-muted shadow-sm group-hover:flex hover:text-fg"
                  >
                    <Undo2 className="h-3 w-3" />
                    Restore
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
      {pending ? (
        <p className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-2 text-xs text-fg-subtle">
          <Spinner size="sm" />
          Saving…
        </p>
      ) : null}
    </div>
  );
}
