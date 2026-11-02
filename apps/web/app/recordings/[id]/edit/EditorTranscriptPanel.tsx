"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { Captions, RotateCcw, Scissors, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  resetTranscriptEditsAction,
  saveTranscriptEditsAction,
} from "@/app/actions";
import { formatTimestamp } from "@/lib/format";
import { addCut, removeCut, type RecordingCut } from "@/lib/recording/cuts";
import {
  isWordCut,
  isWordInSpan,
  segmentWords,
} from "@/lib/recording/transcript";
import type {
  RecordingTranscript,
  TranscriptSegment,
  TranscriptStatus,
  TranscriptWord,
} from "@/lib/recording/types";
import { cn } from "@/lib/utils";

export type EditorTranscriptPanelProps = {
  slug: string;
  initialTranscript: RecordingTranscript | null;
  transcriptStatus: TranscriptStatus;
  initialHasEdits: boolean;
  cuts: RecordingCut[];
  focusMs: number | null;
  hoverWordAtRef: RefObject<((ms: number | null) => void) | null>;
  onCutsChange: (cuts: RecordingCut[]) => void;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
  isPlaying: () => boolean;
  selection: RecordingCut | null;
  onSelectionChange: (span: RecordingCut | null) => void;
  // Fires once the server holds a new transcript text, so the player can
  // fetch fresh captions.
  onTranscriptSaved?: () => void;
};

type Line = {
  segment: TranscriptSegment;
  words: TranscriptWord[];
  firstWord: number;
};

const PLAYHEAD_POLL_MS = 80;
// The red word holds across a short pause, then lets go in a longer silence.
const WORD_HOLD_MS = 400;
const HOVER_STEP_MS = 16;
const HOVER_FLASH_MS = 100;
// Words per step are the distance over this, so a long leap still lands fast.
const HOVER_CATCH_UP_STEPS = 5;
// Back on a clip this soon after a gap, the walk carries on from where it was.
const HOVER_RESUME_MS = 400;
const DRAG_SCROLL_EDGE_PX = 32;
const DRAG_SCROLL_STEP_PX = 16;

function spanOf(words: readonly TranscriptWord[]): RecordingCut {
  const startMs = Math.min(...words.map((w) => w.startMs));
  const endMs = Math.max(...words.map((w) => w.endMs));
  // A word Whisper gave no length still has to be selectable.
  return { startMs, endMs: Math.max(endMs, startMs + 1) };
}

function sameSpan(a: RecordingCut | null, b: RecordingCut): boolean {
  return a?.startMs === b.startMs && a.endMs === b.endMs;
}

/*
 * The transcript tab of the inspector. Click a word or drag across words to
 * select them and move the playhead, shift-click to extend, click a line's
 * time to take the whole line, Delete to cut the selection out of playback,
 * double-click to fix the text.
 */
export function EditorTranscriptPanel({
  slug,
  initialTranscript,
  transcriptStatus,
  initialHasEdits,
  cuts,
  focusMs,
  hoverWordAtRef,
  onCutsChange,
  onSeek,
  getCurrentMs,
  isPlaying,
  selection,
  onSelectionChange,
  onTranscriptSaved,
}: EditorTranscriptPanelProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [hasEdits, setHasEdits] = useState(initialHasEdits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timelineHoverWord, setTimelineHoverWord] = useState<number | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const anchorRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const timelineHoverActiveRef = useRef(false);
  const endDragRef = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo((): Line[] => {
    let firstWord = 0;
    return (transcript?.segments ?? []).map((segment) => {
      const words = segmentWords(segment);
      const line = { segment, words, firstWord };
      firstWord += words.length;
      return line;
    });
  }, [transcript]);
  const allWords = useMemo(() => lines.flatMap((l) => l.words), [lines]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaying(isPlaying());
      const ms = getCurrentMs();
      const index = allWords.findLastIndex((w) => w.startMs <= ms);
      const word = allWords[index];
      setCurrentWord(
        word && ms < Math.max(word.endMs, word.startMs) + WORD_HOLD_MS
          ? index
          : null,
      );
    }, PLAYHEAD_POLL_MS);
    return () => window.clearInterval(id);
  }, [getCurrentMs, isPlaying, allWords]);

  useEffect(() => {
    if (currentWord === null || draggingRef.current) return;
    if (timelineHoverActiveRef.current) return;
    listRef.current
      ?.querySelector(`[data-word="${currentWord}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [currentWord]);

  useEffect(() => () => endDragRef.current?.(), []);

  useEffect(() => {
    if (focusMs === null) return;
    const index = allWords.findIndex((w) => w.endMs > focusMs);
    if (index < 0) return;
    listRef.current
      ?.querySelector(`[data-word="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusMs, allWords]);

  // A fast pointer lands words apart, so the highlight walks there word by word.
  // It finishes the walk across a deleted gap rather than restarting past it.
  useEffect(() => {
    let walkTo: number | null = null;
    let shown: number | null = null;
    let leaving = false;
    let raf = 0;
    let lastStepAt = 0;
    let lastShown: number | null = null;
    let lastShownAt = 0;
    const show = (index: number | null): void => {
      shown = index;
      setTimelineHoverWord(index);
      if (index === null) return;
      lastShown = index;
      lastShownAt = performance.now();
      listRef.current
        ?.querySelector(`[data-word="${index}"]`)
        ?.scrollIntoView({ block: "nearest" });
    };
    // A word passed mid-frame still lights up, without a render for each one.
    const flash = (index: number): void => {
      listRef.current
        ?.querySelector(`[data-word="${index}"]:not([data-word-cut])`)
        ?.animate(
          [
            { backgroundColor: "var(--cf-word-hover)" },
            { backgroundColor: "transparent" },
          ],
          HOVER_FLASH_MS,
        );
    };
    const walk = (now: number): void => {
      raf = 0;
      if (shown === null || walkTo === null) return;
      if (shown === walkTo) {
        if (leaving) show(null);
        return;
      }
      if (now - lastStepAt >= HOVER_STEP_MS) {
        lastStepAt = now;
        const away = walkTo - shown;
        const stride = Math.ceil(Math.abs(away) / HOVER_CATCH_UP_STEPS);
        const direction = Math.sign(away);
        for (let i = 1; i < stride; i++) flash(shown + direction * i);
        show(shown + direction * stride);
      }
      raf = requestAnimationFrame(walk);
    };
    hoverWordAtRef.current = (ms) => {
      timelineHoverActiveRef.current = ms !== null;
      // The pointer is on a clip even between words, so take the closest one.
      let index: number | null = null;
      if (ms !== null) {
        let closest = Number.POSITIVE_INFINITY;
        allWords.forEach((word, i) => {
          if (isWordCut(word, cuts)) return;
          const away = Math.max(word.startMs - ms, ms - word.endMs, 0);
          if (away < closest) {
            closest = away;
            index = i;
          }
        });
      }
      leaving = index === null;
      // A change of cuts restarts this effect, which forgets the word still lit.
      if (index === null && shown === null) setTimelineHoverWord(null);
      if (index !== null) {
        walkTo = index;
        if (shown === null) {
          const recent = performance.now() - lastShownAt < HOVER_RESUME_MS;
          show(recent && lastShown !== null ? lastShown : index);
        }
      }
      if (!raf && shown !== null) raf = requestAnimationFrame(walk);
    };
    return () => {
      cancelAnimationFrame(raf);
      hoverWordAtRef.current = null;
    };
  }, [allWords, cuts, hoverWordAtRef]);

  const selectWords = (a: number, b: number): void => {
    onSelectionChange(
      spanOf(allWords.slice(Math.min(a, b), Math.max(a, b) + 1)),
    );
  };

  const onWordPointerDown = (
    e: ReactPointerEvent<HTMLElement>,
    index: number,
  ): void => {
    if (e.button !== 0) return;
    const word = allWords[index]!;
    const wasOnlyThisWord = sameSpan(selection, spanOf([word]));
    const extending = e.shiftKey && selection && anchorRef.current !== null;
    const anchor = extending ? anchorRef.current! : index;
    anchorRef.current = anchor;
    selectWords(anchor, index);
    draggingRef.current = true;
    let head = index;
    let moved = false;

    const move = (ev: PointerEvent): void => {
      const list = listRef.current;
      if (list) {
        const { top, bottom } = list.getBoundingClientRect();
        if (ev.clientY < top + DRAG_SCROLL_EDGE_PX) {
          list.scrollBy(0, -DRAG_SCROLL_STEP_PX);
        } else if (ev.clientY > bottom - DRAG_SCROLL_EDGE_PX) {
          list.scrollBy(0, DRAG_SCROLL_STEP_PX);
        }
      }
      const over = document
        .elementFromPoint(ev.clientX, ev.clientY)
        ?.closest<HTMLElement>("[data-word]");
      const next = over ? Number(over.dataset.word) : head;
      if (next === head) return;
      head = next;
      moved = true;
      selectWords(anchor, head);
    };
    const end = (): void => {
      draggingRef.current = false;
      endDragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", end);
    };
    const up = (): void => {
      end();
      // A second click on the only selected word lets it go.
      if (!moved && !extending && wasOnlyThisWord) {
        onSelectionChange(null);
        return;
      }
      onSeek(allWords[Math.min(anchor, head)]!.startMs);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", end);
    endDragRef.current = end;
  };

  const onTimeClick = (line: Line, e: ReactMouseEvent<HTMLElement>): void => {
    const last = line.firstWord + line.words.length - 1;
    if (e.shiftKey && selection && anchorRef.current !== null) {
      selectWords(anchorRef.current, last);
    } else if (sameSpan(selection, spanOf(line.words))) {
      onSelectionChange(null);
      return;
    } else {
      anchorRef.current = line.firstWord;
      selectWords(line.firstWord, last);
    }
    onSeek(line.segment.startMs);
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
    if (!selection) return;
    onCutsChange(addCut(cuts, selection));
    onSelectionChange(null);
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

  const selectedCount = selection
    ? allWords.filter((w) => isWordInSpan(w, selection)).length
    : 0;

  if (!transcript) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
        {transcriptStatus === "pending" ? (
          <Spinner />
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
            <Button variant="destructive" size="sm" onClick={deleteSelection}>
              <Scissors className="h-3.5 w-3.5" />
              Delete {selectedCount === 1 ? "word" : `${selectedCount} words`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange(null)}
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        ) : (
          <p className="text-[11px] leading-snug text-fg-subtle">
            Click a word or drag across words to select, double-click to fix the
            text.
          </p>
        )}
        {hasEdits ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEdits}
            disabled={pending}
            className="shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset edits
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mx-4 mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ol className="space-y-2">
          {lines.map((line) => {
            const { segment, words, firstWord } = line;
            if (editingId === segment.id) {
              return (
                <li key={segment.id} className="rounded-md bg-input/30 p-2">
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
            const cutCount = words.filter((w) => isWordCut(w, cuts)).length;
            return (
              <li
                key={segment.id}
                className="group relative flex items-start gap-3 px-2.5 py-1"
              >
                <button
                  type="button"
                  onClick={(e) => onTimeClick(line, e)}
                  aria-label={`Select the line at ${formatTimestamp(segment.startMs)}`}
                  className="w-8 shrink-0 pt-[3px] text-left text-xs text-fg-subtle tabular-nums transition-colors hover:text-fg"
                >
                  {formatTimestamp(segment.startMs)}
                </button>
                <p
                  onDoubleClick={() => {
                    if (cutCount < words.length) startEditing(segment);
                  }}
                  className="min-w-0 flex-1 cursor-text text-[15px] leading-relaxed text-fg select-none"
                >
                  {words.map((word, i) => {
                    const isSelected =
                      !!selection && isWordInSpan(word, selection);
                    const isCut = isWordCut(word, cuts);
                    const isCurrent = !isCut && currentWord === firstWord + i;
                    const isHoveredWord =
                      !isCut && timelineHoverWord === firstWord + i;
                    return (
                      <span key={i}>
                        {i > 0 ? " " : null}
                        <span
                          data-word={firstWord + i}
                          data-word-selected={isSelected ? "" : undefined}
                          data-word-cut={isCut ? "" : undefined}
                          data-word-current={isCurrent ? "" : undefined}
                          data-word-hovered={isHoveredWord ? "" : undefined}
                          onPointerDown={(e) =>
                            onWordPointerDown(e, firstWord + i)
                          }
                          className={cn(
                            "relative -mx-[2px] rounded-[3px] px-[2px]",
                            // Hit area past the highlight, so near a word counts.
                            "before:absolute before:-inset-1 before:content-['']",
                            isCut &&
                              "text-fg-subtle line-through decoration-destructive",
                            isCurrent && playing
                              ? "bg-destructive text-white"
                              : isSelected
                                ? "bg-word-selected"
                                : isCurrent
                                  ? "bg-destructive text-white"
                                  : isHoveredWord
                                    ? "bg-word-hover"
                                    : "transition-colors duration-75 hover:bg-word-hover",
                          )}
                        >
                          {word.text}
                        </span>
                      </span>
                    );
                  })}
                </p>
                {cutCount > 0 ? (
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
          <Spinner />
          Saving…
        </p>
      ) : null}
    </div>
  );
}
