"use client";

import { useEffect, useMemo, useState } from "react";
import { Captions, Check, Copy, Pencil } from "lucide-react";
import { Input, Spinner, TextField } from "@heroui/react";
import { formatTimestamp } from "@/lib/format";
import type { RecordingCut } from "@/lib/recording/cuts";
import { activeSegmentId, isSegmentCut } from "@/lib/recording/transcript";
import type {
  RecordingTranscript,
  TranscriptResponse,
} from "@/lib/recording/types";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  initialTranscript: RecordingTranscript | null;
  cuts: RecordingCut[];
  createdAt: number;
  isOwner: boolean;
  editUrl: string;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
};

// The recorder posts the transcript right after the upload finishes, so a
// just-shared link polls briefly instead of showing nothing.
const FRESH_WINDOW_MS = 3 * 60_000;
const POLL_INTERVAL_MS = 3_000;
const POLL_FOR_MS = 90_000;

export function TranscriptPanel({
  slug,
  initialTranscript,
  cuts,
  createdAt,
  isOwner,
  editUrl,
  onSeek,
  getCurrentMs,
}: Props) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [waiting, setWaiting] = useState(
    () =>
      initialTranscript === null && Date.now() - createdAt < FRESH_WINDOW_MS,
  );
  const [query, setQuery] = useState("");
  const [currentMs, setCurrentMs] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    const deadline = Date.now() + POLL_FOR_MS;
    let cancelled = false;
    const tick = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/r/transcript/${slug}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as TranscriptResponse;
          if (!cancelled && data.transcript) {
            setTranscript(data.transcript);
            setWaiting(false);
            return;
          }
        }
      } catch {
        // retry on the next tick
      }
      if (!cancelled && Date.now() > deadline) setWaiting(false);
    };
    void tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [waiting, slug]);

  useEffect(() => {
    const id = window.setInterval(() => setCurrentMs(getCurrentMs()), 500);
    return () => window.clearInterval(id);
  }, [getCurrentMs]);

  const visible = useMemo(
    () =>
      transcript
        ? transcript.segments.filter((s) => !isSegmentCut(s, cuts))
        : [],
    [transcript, cuts],
  );
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? visible.filter((s) => s.text.toLowerCase().includes(needle))
    : visible;
  const activeId = activeSegmentId(visible, currentMs);

  const copyAll = async (): Promise<void> => {
    const text = visible
      .map((s) => `${formatTimestamp(s.startMs)} ${s.text}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context / permissions); nothing to show.
    }
  };

  const heading = (
    <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
      <Captions className="h-4 w-4 text-blue-400" />
      Transcript
    </h2>
  );

  if (!transcript) {
    if (waiting) {
      return (
        <section className="mt-8">
          {heading}
          <p className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
            <Spinner size="sm" />
            Preparing transcript…
          </p>
        </section>
      );
    }
    if (!isOwner) return null;
    return (
      <section className="mt-8">
        {heading}
        <p className="mt-2 text-sm text-fg-muted">
          No transcript for this recording. The extension writes one while you
          record with the microphone on in Google Chrome. Brave blocks Chrome's
          speech recognition, so recordings made there have none.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        {heading}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void copyAll()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          {isOwner ? (
            <a
              href={editUrl}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </a>
          ) : null}
        </div>
      </div>
      <TextField
        aria-label="Search transcript"
        value={query}
        onChange={setQuery}
        className="mt-3"
        fullWidth
      >
        <Input placeholder="Search transcript" />
      </TextField>
      <ol className="mt-2 max-h-96 space-y-0.5 overflow-y-auto">
        {shown.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSeek(s.startMs)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                  active
                    ? "bg-accent/15 text-fg"
                    : "text-fg-muted hover:bg-tint",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 pt-0.5 font-mono text-xs",
                    active ? "text-fg" : "text-fg-subtle",
                  )}
                >
                  {formatTimestamp(s.startMs)}
                </span>
                <span className="text-sm leading-relaxed">{s.text}</span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 ? (
          <li className="px-2 py-1.5 text-sm text-fg-subtle">No matches.</li>
        ) : null}
      </ol>
    </section>
  );
}
