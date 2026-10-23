"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ListVideo, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  isOwner: boolean;
  initialSummary: string;
  initialChapters: Chapter[];
  onSeek: (ms: number) => void;
  getCurrentMs?: () => number;
  onChaptersChange?: (chapters: Chapter[]) => void;
};

type Chapter = { id: string; ms: number; title: string };

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function parseTimestamp(raw: string): number | null {
  const parts = raw.trim().split(":");
  if (parts.length < 1 || parts.length > 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  let total = 0;
  if (nums.length === 3) total = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else if (nums.length === 2) total = nums[0] * 60 + nums[1];
  else total = nums[0];
  return total * 1000;
}

export function SummaryChapters({
  slug,
  isOwner,
  initialSummary,
  initialChapters,
  onSeek,
  getCurrentMs,
  onChaptersChange,
}: Props) {
  const [summary, setSummary] = useState<string>(initialSummary);
  const [summaryEditing, setSummaryEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<string>("");

  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [chaptersEditing, setChaptersEditing] = useState(false);
  const [chaptersDraft, setChaptersDraft] = useState<string>("");
  const [currentMs, setCurrentMs] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const summaryTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const persistAll = useCallback(
    async (nextSummary: string, nextChapters: Chapter[]) => {
      try {
        const res = await fetch(`/api/r/summary-chapters/${slug}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            summary: nextSummary,
            chapters: nextChapters,
          }),
        });
        if (!res.ok) {
          setSaveError("Could not save. Try again.");
          return;
        }
        setSaveError(null);
      } catch {
        setSaveError("Could not save. Try again.");
      }
    },
    [slug],
  );

  useEffect(() => {
    if (!getCurrentMs) return;
    const id = window.setInterval(() => {
      setCurrentMs(getCurrentMs());
    }, 500);
    return () => window.clearInterval(id);
  }, [getCurrentMs]);

  const activeChapterId = useMemo(() => {
    if (chapters.length === 0) return null;
    let active = chapters[0];
    for (const c of chapters) {
      if (c.ms <= currentMs) active = c;
      else break;
    }
    return active.id;
  }, [chapters, currentMs]);

  const persistSummary = useCallback(
    (next: string) => {
      setSummary(next);
      void persistAll(next, chapters);
    },
    [persistAll, chapters],
  );

  const persistChapters = useCallback(
    (next: Chapter[]) => {
      const sorted = [...next].sort((a, b) => a.ms - b.ms);
      setChapters(sorted);
      onChaptersChange?.(sorted);
      void persistAll(summary, sorted);
    },
    [persistAll, summary, onChaptersChange],
  );

  const onAddChapter = () => {
    const ms = getCurrentMs?.() ?? 0;
    persistChapters([
      ...chapters,
      { id: newId(), ms, title: `Chapter ${chapters.length + 1}` },
    ]);
  };

  const removeChapter = (id: string) => {
    persistChapters(chapters.filter((c) => c.id !== id));
  };

  const startChaptersEdit = () => {
    setChaptersDraft(
      chapters.map((c) => `${formatTimestamp(c.ms)} ${c.title}`).join("\n"),
    );
    setChaptersEditing(true);
  };

  const commitChaptersEdit = () => {
    const lines = chaptersDraft.split(/\r?\n/);
    const next: Chapter[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = /^(\S+)\s+(.+)$/.exec(trimmed);
      if (!match) continue;
      const ms = parseTimestamp(match[1]);
      if (ms == null) continue;
      next.push({ id: newId(), ms, title: match[2].trim() });
    }
    persistChapters(next);
    setChaptersEditing(false);
  };

  const startSummaryEdit = () => {
    setSummaryDraft(summary);
    setSummaryEditing(true);
    window.setTimeout(() => summaryTextareaRef.current?.focus(), 0);
  };

  const commitSummaryEdit = () => {
    persistSummary(summaryDraft.trim());
    setSummaryEditing(false);
  };

  const hasSummary = summary.trim().length > 0;
  const hasChapters = chapters.length > 0;

  if (!isOwner && !hasSummary && !hasChapters) return null;
  const showSummary = isOwner || hasSummary;
  const showChapters = isOwner || hasChapters;

  return (
    <div className="mt-8 space-y-4">
      {saveError && isOwner && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 ring-1 ring-red-500/20 dark:text-red-300">
          {saveError}
        </p>
      )}
      <div
        className={cn(
          "grid gap-4",
          showSummary &&
            showChapters &&
            "xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        )}
      >
        {showSummary && (
          <Card
            icon={<Sparkles className="size-4" />}
            title="Summary"
            subtitle="What this recording covers"
            actions={
              isOwner && !summaryEditing ? (
                <Button variant="ghost" size="sm" onPress={startSummaryEdit}>
                  <Pencil className="size-3.5" />
                  {hasSummary ? "Edit" : "Add"}
                </Button>
              ) : null
            }
          >
            {summaryEditing ? (
              <EditBox
                onCancel={() => setSummaryEditing(false)}
                onSave={commitSummaryEdit}
              >
                <textarea
                  ref={summaryTextareaRef}
                  value={summaryDraft}
                  onChange={(e) => setSummaryDraft(e.target.value)}
                  rows={5}
                  placeholder="What happens in this recording?"
                  className="block w-full resize-none bg-transparent text-[15px] leading-7 text-fg placeholder:text-fg-subtle focus:outline-none"
                />
              </EditBox>
            ) : hasSummary ? (
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-fg">
                {summary}
              </p>
            ) : (
              <EmptyState
                text={
                  isOwner ? "Tell viewers what to expect." : "No summary yet."
                }
                action={isOwner ? "Add a summary" : undefined}
                onAction={startSummaryEdit}
              />
            )}
          </Card>
        )}

        {showChapters && (
          <Card
            icon={<ListVideo className="size-4" />}
            title="Chapters"
            subtitle={
              hasChapters
                ? `${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"} · click to jump`
                : "Jump points along the recording"
            }
            actions={
              isOwner && !chaptersEditing ? (
                <>
                  <Button variant="ghost" size="sm" onPress={onAddChapter}>
                    <Plus className="size-3.5" />
                    Add at playhead
                  </Button>
                  {hasChapters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={startChaptersEdit}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  )}
                </>
              ) : null
            }
          >
            {chaptersEditing ? (
              <EditBox
                hint={
                  <>
                    One chapter per line, as <code>M:SS Title</code> or{" "}
                    <code>H:MM:SS Title</code>.
                  </>
                }
                onCancel={() => setChaptersEditing(false)}
                onSave={commitChaptersEdit}
              >
                <textarea
                  value={chaptersDraft}
                  onChange={(e) => setChaptersDraft(e.target.value)}
                  rows={Math.max(4, chaptersDraft.split("\n").length)}
                  placeholder={"0:00 Intro\n0:30 Demo\n1:20 Wrap-up"}
                  className="block w-full resize-none bg-transparent font-mono text-sm leading-6 text-fg placeholder:text-fg-subtle focus:outline-none"
                />
              </EditBox>
            ) : hasChapters ? (
              <ol className="relative -mx-2 before:absolute before:top-3 before:bottom-3 before:left-[23px] before:w-px before:bg-line-strong">
                {chapters.map((c, i) => {
                  const active = c.id === activeChapterId;
                  return (
                    <li key={c.id} className="relative">
                      <div
                        className={cn(
                          "group flex items-center gap-1 rounded-xl pr-1 transition-colors",
                          active ? "bg-accent-bg/10" : "hover:bg-tint",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSeek(c.ms)}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2 pl-2 pr-1 text-left"
                        >
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-[box-shadow,background-color,color]",
                              active
                                ? "bg-accent-bg text-white ring-4 ring-accent-bg/20"
                                : "bg-tint-strong text-fg-muted ring-4 ring-panel group-hover:bg-tint-strong",
                            )}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm font-medium",
                              active ? "text-fg-strong" : "text-fg",
                            )}
                          >
                            {c.title}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
                              active
                                ? "bg-accent-bg/15 text-accent-strong"
                                : "bg-tint text-fg-subtle",
                            )}
                          >
                            {formatTimestamp(c.ms)}
                          </span>
                        </button>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => removeChapter(c.id)}
                            aria-label="Remove chapter"
                            className="rounded-lg p-1.5 text-fg-subtle opacity-0 transition-opacity hover:bg-tint-strong hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyState
                text={
                  isOwner
                    ? "Pause where a new topic starts, then add a chapter at the playhead."
                    : "No chapters yet."
                }
                action={isOwner ? "Add at playhead" : undefined}
                onAction={onAddChapter}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  subtitle,
  actions,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-panel p-5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-bg/10 text-accent-strong ring-1 ring-accent-bg/15">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-5 text-fg-strong">
              {title}
            </h2>
            <p className="mt-0.5 truncate text-xs text-fg-subtle">{subtitle}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EditBox({
  hint,
  onCancel,
  onSave,
  children,
}: {
  hint?: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl bg-field p-3 ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-accent-ring">
      {children}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fg-subtle">{hint}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onPress={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  text,
  action,
  onAction,
}: {
  text: string;
  action?: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center">
      <p className="text-sm text-fg-subtle">{text}</p>
      {action ? (
        <Button variant="secondary" size="sm" onPress={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}
