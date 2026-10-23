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
  TranscriptStatus,
} from "@/lib/recording/types";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  initialTranscript: RecordingTranscript | null;
  initialStatus: TranscriptStatus;
  cuts: RecordingCut[];
  isOwner: boolean;
  editUrl: string;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
};

// Whisper takes about a third of the recording's length; a just-shared link
// polls until the job settles instead of showing nothing.
const POLL_INTERVAL_MS = 3_000;
const POLL_FOR_MS = 30 * 60_000;

// The sidebar's Transcript tab: fills the column, list scrolls on its own.
export function TranscriptPanel({
  slug,
  initialTranscript,
  initialStatus,
  cuts,
  isOwner,
  editUrl,
  onSeek,
  getCurrentMs,
}: Props) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState("");
  const [currentMs, setCurrentMs] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "pending") return;
    const deadline = Date.now() + POLL_FOR_MS;
    let cancelled = false;
    const tick = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/r/transcript/${slug}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as TranscriptResponse;
          if (!cancelled && data.status !== "pending") {
            setTranscript(data.transcript);
            setStatus(data.status);
            return;
          }
        }
      } catch {
        // retry on the next tick
      }
      if (!cancelled && Date.now() > deadline) setStatus("failed");
    };
    void tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [status, slug]);

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

  if (!transcript) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
          {status === "pending" ? (
            <Spinner size="sm" />
          ) : (
            <Captions className="h-5 w-5" />
          )}
        </div>
        <p className="mt-4 text-base font-semibold text-fg">
          {status === "pending"
            ? "Transcribing…"
            : status === "failed"
              ? "Transcription didn't finish"
              : "No transcript"}
        </p>
        <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
          {status === "pending"
            ? "The transcript shows up here as soon as it's ready."
            : status === "failed"
              ? "Something went wrong while transcribing this recording."
              : isOwner
                ? "Record with the microphone on and one is written for you."
                : "This recording was made without a microphone."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <TextField
          aria-label="Search transcript"
          value={query}
          onChange={setQuery}
          className="min-w-0 flex-1"
          fullWidth
        >
          <Input placeholder="Search transcript" />
        </TextField>
        <button
          type="button"
          onClick={() => void copyAll()}
          title="Copy transcript"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg"
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
            title="Edit transcript"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </a>
        ) : null}
      </div>
      <ol className="mt-3 max-h-[60vh] flex-1 space-y-0.5 overflow-y-auto lg:max-h-none lg:min-h-0">
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
    </div>
  );
}
