"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type Ref,
} from "react";
import { MessageSquare } from "lucide-react";
import {
  SharePlayer as BaseSharePlayer,
  type SharePlayerHandle,
} from "../../_components/share";
import type { ShareConfig } from "@/lib/share-config";
import { DEFAULT_REACTIONS } from "@/lib/share/reactions";
import type { AddReactionResponse, ShareReaction } from "@/lib/share/types";

type Props = {
  videoUrl: string;
  posterUrl?: string;
  webcamUrl?: string;
  slug: string;
  initialReactions: ShareReaction[];
  serverDurationMs: number | null;
  serverWidth: number | null;
  serverHeight: number | null;
  config: ShareConfig;
  viewerSignedIn?: boolean;
  onReactionAdded?: (reaction: ShareReaction) => void;
  onSignInRequested?: () => void;
  handleRef?: Ref<SharePlayerHandle | null>;
  onCommentClick?: () => void;
};

// Reactions within this fraction of the timeline collapse into one cluster.
const REACTION_CLUSTER_FRACTION = 0.03;

export function SharePlayer({
  videoUrl,
  posterUrl,
  webcamUrl,
  slug,
  initialReactions,
  serverDurationMs,
  serverWidth,
  serverHeight,
  config,
  viewerSignedIn = false,
  onReactionAdded,
  onSignInRequested,
  handleRef,
  onCommentClick,
}: Props) {
  const playerRef = useRef<SharePlayerHandle | null>(null);

  const setHandle = useCallback(
    /* eslint-disable react-hooks/immutability */
    (handle: SharePlayerHandle | null) => {
      playerRef.current = handle;
      if (typeof handleRef === "function") {
        handleRef(handle);
      } else if (handleRef) {
        (handleRef as MutableRefObject<SharePlayerHandle | null>).current =
          handle;
      }
    },
    /* eslint-enable react-hooks/immutability */
    [handleRef],
  );

  const [reactions, setReactions] = useState<ShareReaction[]>(initialReactions);
  const [pulseEmoji, setPulseEmoji] = useState<string | null>(null);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!pulseEmoji) return;
    const t = setTimeout(() => setPulseEmoji(null), 500);
    return () => clearTimeout(t);
  }, [pulseEmoji]);

  const reactionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
    }
    return counts;
  }, [reactions]);

  const sendReaction = (emoji: string): void => {
    if (!viewerSignedIn) {
      onSignInRequested?.();
      return;
    }
    const tSec = playerRef.current?.getCurrentTime() ?? 0;
    const tMs = Math.max(0, Math.floor(tSec * 1000));
    setPulseEmoji(emoji);

    const optimistic: ShareReaction = {
      id: -Date.now(),
      slug,
      emoji,
      timestampMs: tMs,
      createdAt: Date.now(),
      userId: null,
      userName: null,
      userImage: null,
    };
    setReactions((prev) =>
      [...prev, optimistic].sort((a, b) => a.timestampMs - b.timestampMs),
    );
    setFreshIds((prev) => {
      const next = new Set(prev);
      next.add(optimistic.id);
      return next;
    });
    // Must match the rise animation duration in globals.css.
    window.setTimeout(() => {
      setFreshIds((prev) => {
        if (!prev.has(optimistic.id)) return prev;
        const next = new Set(prev);
        next.delete(optimistic.id);
        return next;
      });
    }, 650);

    void postReaction(slug, emoji, tMs)
      .then((real) => {
        setReactions((prev) =>
          prev.map((r) => (r.id === optimistic.id ? real : r)),
        );
        onReactionAdded?.(real);
      })
      .catch(() => {
        setReactions((prev) => prev.filter((r) => r.id !== optimistic.id));
      });
  };

  return (
    <BaseSharePlayer
      ref={setHandle}
      videoUrl={videoUrl}
      posterUrl={posterUrl}
      webcamUrl={webcamUrl}
      serverDurationMs={serverDurationMs}
      serverWidth={serverWidth}
      serverHeight={serverHeight}
      config={config}
      // 19rem reserves nav + title header + padding + reaction bar; 34rem caps tall viewports.
      landscapeMaxHeightCss="min(34rem, calc(100vh - 19rem))"
      progressOverlay={({ durationSeconds, controlsVisible }) => (
        <ReactionOverlay
          reactions={reactions}
          freshIds={freshIds}
          durationSeconds={durationSeconds}
          controlsVisible={controlsVisible}
        />
      )}
      belowPlayer={
        <div className="mt-8 flex items-center justify-center gap-2">
          <ReactionBar
            onReact={sendReaction}
            pulseEmoji={pulseEmoji}
            counts={reactionCounts}
          />
          {onCommentClick ? (
            <button
              type="button"
              onClick={onCommentClick}
              className="flex h-[60px] items-center gap-2.5 rounded-2xl bg-canvas-2 px-5 text-base font-medium text-fg shadow-md ring-1 ring-line-strong transition-transform duration-100 ease-out hover:-translate-y-0.5"
              aria-label="Leave a comment"
            >
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
              <span className="hidden sm:inline">Comment</span>
            </button>
          ) : null}
        </div>
      }
    />
  );
}

function ReactionOverlay({
  reactions,
  freshIds,
  durationSeconds,
  controlsVisible,
}: {
  reactions: ShareReaction[];
  freshIds: Set<number>;
  durationSeconds: number;
  controlsVisible: boolean;
}) {
  const clusters = useMemo(
    () => clusterReactions(reactions, durationSeconds, freshIds),
    [reactions, durationSeconds, freshIds],
  );
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 px-4 transition-[bottom] duration-200 ${
        controlsVisible ? "bottom-[76px]" : "bottom-[11px]"
      }`}
    >
      <ReactionMarkers clusters={clusters} />
    </div>
  );
}

type ReactionCluster = {
  fraction: number;
  emoji: string;
  count: number;
  isFresh: boolean;
};

function clusterReactions(
  reactions: ShareReaction[],
  durationSeconds: number,
  freshIds: Set<number>,
): ReactionCluster[] {
  if (reactions.length === 0 || durationSeconds <= 0) return [];
  const totalMs = durationSeconds * 1000;
  const windowMs = totalMs * REACTION_CLUSTER_FRACTION;
  const out: ReactionCluster[] = [];
  let bucket: ShareReaction[] = [];

  const flush = (): void => {
    if (bucket.length === 0) return;
    const counts = new Map<string, number>();
    let sumMs = 0;
    let fresh = false;
    for (const r of bucket) {
      counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
      sumMs += r.timestampMs;
      if (freshIds.has(r.id)) fresh = true;
    }
    const meanMs = sumMs / bucket.length;
    let bestEmoji = bucket[0]!.emoji;
    let bestN = 0;
    for (const [e, n] of counts.entries()) {
      if (n > bestN) {
        bestN = n;
        bestEmoji = e;
      }
    }
    out.push({
      fraction: Math.max(0, Math.min(1, meanMs / totalMs)),
      emoji: bestEmoji,
      count: bucket.length,
      isFresh: fresh,
    });
    bucket = [];
  };

  for (const r of reactions) {
    if (bucket.length === 0) {
      bucket.push(r);
      continue;
    }
    const first = bucket[0]!;
    if (r.timestampMs - first.timestampMs <= windowMs) {
      bucket.push(r);
    } else {
      flush();
      bucket.push(r);
    }
  }
  flush();
  return out;
}

async function postReaction(
  slug: string,
  emoji: string,
  timestampMs: number,
): Promise<ShareReaction> {
  const res = await fetch(`/api/r/reactions?slug=${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ emoji, timestampMs }),
  });
  if (!res.ok) {
    throw new Error(`Reaction failed: ${res.status}`);
  }
  const json = (await res.json()) as AddReactionResponse;
  return json.reaction;
}

// Approximate rendered width of a cluster bubble (emoji + count badge + gap).
const CLUSTER_VISUAL_WIDTH_PX = 32;

function ReactionMarkers({ clusters }: { clusters: ReactionCluster[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = (): void => setTrackWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const visible = useMemo(() => {
    if (clusters.length === 0) return clusters;
    const minFraction =
      trackWidth > 0 ? CLUSTER_VISUAL_WIDTH_PX / trackWidth : 0;
    if (minFraction <= 0) return clusters;
    const ranked = [...clusters]
      .map((c, idx) => ({ c, idx }))
      .sort((a, b) => {
        const dn = b.c.count - a.c.count;
        if (dn !== 0) return dn;
        return a.c.fraction - b.c.fraction;
      });
    const kept: typeof ranked = [];
    for (const item of ranked) {
      const tooClose = kept.some(
        (k) => Math.abs(k.c.fraction - item.c.fraction) < minFraction,
      );
      if (!tooClose) kept.push(item);
    }
    const keepIdx = new Set(kept.map((k) => k.idx));
    return clusters.filter((_, idx) => keepIdx.has(idx));
  }, [clusters, trackWidth]);

  if (clusters.length === 0) return null;
  return (
    <div className="pointer-events-none relative h-9 w-full" ref={trackRef}>
      {visible.map((c, idx) => (
        <div
          key={idx}
          className={`absolute flex items-end gap-0.5 ${
            c.isFresh ? "animate-reaction-rise" : ""
          }`}
          style={{
            left: `${c.fraction * 100}%`,
            bottom: 0,
            transform: `translateX(${-c.fraction * 100}%)`,
            transformOrigin: "bottom center",
          }}
        >
          <span
            className="text-[20px] leading-none"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
          >
            {c.emoji}
          </span>
          {c.count > 1 ? (
            <span
              className="text-[11px] font-semibold tabular-nums leading-none text-white"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.8))" }}
            >
              {c.count}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ReactionBar({
  onReact,
  pulseEmoji,
  counts,
}: {
  onReact: (emoji: string) => void;
  pulseEmoji: string | null;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-canvas-2 px-2 py-1.5 shadow-md ring-1 ring-line-strong">
      {DEFAULT_REACTIONS.map((r) => {
        const isPulsing = pulseEmoji === r.emoji;
        const count = counts[r.emoji] ?? 0;
        return (
          <div key={r.emoji} className="group relative">
            <button
              type="button"
              onClick={() => onReact(r.emoji)}
              aria-label={r.label}
              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl text-[28px] leading-none transition-transform duration-100 ease-out hover:-translate-y-2 active:translate-y-0 ${
                isPulsing ? "animate-share-icon-pop" : ""
              }`}
            >
              <span aria-hidden="true">{r.emoji}</span>
            </button>
            <div className="pointer-events-none absolute -top-11 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-inverse px-2.5 py-1.5 text-sm font-medium text-on-inverse opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100">
              <span>{r.label}</span>
              {count > 0 ? (
                <span className="rounded bg-overlay-strong px-1.5 py-0.5 tabular-nums text-xs text-on-inverse/85">
                  {count}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
