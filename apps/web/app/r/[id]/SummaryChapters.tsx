"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListVideo, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "antd";
import { formatTimestamp } from "@/lib/format";

type Props = {
  slug: string;
  isOwner: boolean;
  initialSummary: string;
  initialChapters: Chapter[];
  onSeek: (ms: number) => void;
  getCurrentMs?: () => number;
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
      void persistAll(summary, sorted);
    },
    [persistAll, summary],
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

  return (
    <div className="mt-8 space-y-6">
      {saveError && isOwner && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
          {saveError}
        </p>
      )}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-100">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Summary
          </h2>
          {isOwner && !summaryEditing && (
            <button
              type="button"
              onClick={startSummaryEdit}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-overlay hover:text-neutral-200"
            >
              <Pencil className="h-3.5 w-3.5" />
              {hasSummary ? "Edit" : "Add"}
            </button>
          )}
        </div>
        {summaryEditing ? (
          <div className="mt-3 space-y-2 rounded-lg border border-line-strong bg-neutral-950 p-3">
            <textarea
              ref={summaryTextareaRef}
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              rows={4}
              placeholder="Add a summary…"
              className="block w-full resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={() => setSummaryEditing(false)}>
                Cancel
              </Button>
              <Button type="primary" size="small" onClick={commitSummaryEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : hasSummary ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
            {summary}
          </p>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">
            {isOwner ? "Add a summary…" : "No summary yet."}
          </p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-100">
            <ListVideo className="h-4 w-4 text-blue-400" />
            Chapters
          </h2>
          {isOwner && !chaptersEditing && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onAddChapter}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-overlay hover:text-neutral-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add at playhead
              </button>
              {hasChapters && (
                <button
                  type="button"
                  onClick={startChaptersEdit}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-overlay hover:text-neutral-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
        {chaptersEditing ? (
          <div className="mt-3 space-y-2 rounded-lg border border-line-strong bg-neutral-950 p-3">
            <textarea
              value={chaptersDraft}
              onChange={(e) => setChaptersDraft(e.target.value)}
              rows={Math.max(3, chaptersDraft.split("\n").length)}
              placeholder={"0:00 Intro\n0:30 Demo\n1:20 Wrap-up"}
              className="block w-full resize-none bg-transparent font-mono text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
            <p className="text-[11px] text-neutral-500">
              One chapter per line. Format: <code>M:SS Title</code> or
              <code> H:MM:SS Title</code>.
            </p>
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={() => setChaptersEditing(false)}>
                Cancel
              </Button>
              <Button type="primary" size="small" onClick={commitChaptersEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : hasChapters ? (
          <ol className="mt-2 space-y-0.5">
            {chapters.map((c) => {
              const active = c.id === activeChapterId;
              return (
                <li key={c.id}>
                  <div
                    className={
                      "group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors " +
                      (active
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-100"
                        : "text-neutral-300 hover:bg-overlay")
                    }
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(c.ms)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={
                          "shrink-0 font-mono text-xs " +
                          (active
                            ? "text-blue-700 dark:text-blue-200"
                            : "text-neutral-500")
                        }
                      >
                        {formatTimestamp(c.ms)}
                      </span>
                      <span className="min-w-0 truncate text-sm">
                        {c.title}
                      </span>
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => removeChapter(c.id)}
                        aria-label="Remove chapter"
                        className="rounded p-1 text-neutral-500 opacity-0 transition-opacity hover:bg-overlay hover:text-red-300 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">
            {isOwner
              ? "No chapters yet — add one at the playhead."
              : "No chapters yet."}
          </p>
        )}
      </section>
    </div>
  );
}
