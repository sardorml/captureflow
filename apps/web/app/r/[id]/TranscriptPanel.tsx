"use client";

import { useEffect, useMemo, useState } from "react";
import { Captions, Check, Copy, Pencil, Search } from "lucide-react";
import {
  Button,
  Input,
  Spinner,
  TextField,
  buttonVariants,
} from "@heroui/react";
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
  transcript: RecordingTranscript | null;
  status: TranscriptStatus;
  onSettled: (
    transcript: RecordingTranscript | null,
    status: TranscriptStatus,
  ) => void;
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
  transcript,
  status,
  onSettled,
  cuts,
  isOwner,
  editUrl,
  onSeek,
  getCurrentMs,
}: Props) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
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
            onSettled(data.transcript, data.status);
            return;
          }
        }
      } catch {
        // retry on the next tick
      }
      if (!cancelled && Date.now() > deadline) onSettled(null, "failed");
    };
    void tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [status, slug, onSettled]);

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

  const toggleSearch = (): void => {
    setSearching((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onPress={() => void copyAll()}>
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
        {isOwner ? (
          <a
            href={editUrl}
            className={buttonVariants({ size: "sm", variant: "secondary" })}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </a>
        ) : null}
        <Button
          size="sm"
          variant={searching ? "primary" : "secondary"}
          onPress={toggleSearch}
          aria-pressed={searching}
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </Button>
      </div>
      {searching ? (
        <TextField
          aria-label="Search transcript"
          value={query}
          onChange={setQuery}
          className="mt-3"
          fullWidth
          autoFocus
        >
          <Input placeholder="Search transcript" />
        </TextField>
      ) : null}
      <ol className="mt-4 max-h-[60vh] flex-1 space-y-1 overflow-y-auto lg:max-h-none lg:min-h-0">
        {shown.map((s) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSeek(s.startMs)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-accent/40 bg-accent/10"
                    : "border-transparent hover:bg-tint",
                )}
              >
                <span className="w-9 shrink-0 pt-0.5 text-xs text-accent tabular-nums">
                  {formatTimestamp(s.startMs)}
                </span>
                <span className="text-sm leading-relaxed text-fg">
                  {s.text}
                </span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 ? (
          <li className="px-3 py-2.5 text-sm text-fg-subtle">No matches.</li>
        ) : null}
      </ol>
    </div>
  );
}
