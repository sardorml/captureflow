"use client";

import {
  Fragment,
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
  RecordingPlayer as BaseRecordingPlayer,
  type ProgressOverlayInfo,
  type RecordingPlayerHandle,
} from "../../_components/recording";
import type { RecordingConfig } from "@/lib/recording-config";
import { DEFAULT_REACTIONS, reactionColor } from "@/lib/recording/reactions";
import { cn } from "@/lib/utils";
import type { RecordingChapter } from "@/lib/recording/summary-chapters";
import type {
  AddReactionResponse,
  RecordingComment,
  RecordingReaction,
} from "@/lib/recording/types";

type Props = {
  videoUrl: string;
  posterUrl?: string;
  webcamUrl?: string;
  slug: string;
  initialReactions: RecordingReaction[];
  serverDurationMs: number | null;
  serverWidth: number | null;
  serverHeight: number | null;
  config: RecordingConfig;
  viewerSignedIn?: boolean;
  onReactionAdded?: (reaction: RecordingReaction) => void;
  // Reactions deleted elsewhere on the page (the activity sidebar).
  removedReactionIds?: Set<number>;
  onSignInRequested?: () => void;
  handleRef?: Ref<RecordingPlayerHandle | null>;
  onCommentClick?: () => void;
  landscapeMaxHeightCss?: string;
  embedded?: boolean;
  captionsUrl?: string;
  captionsLang?: string;
  chapters?: RecordingChapter[];
  // Timestamped ones get a mark on the bar with their text on hover.
  comments?: RecordingComment[];
};

// Reactions within this fraction of the timeline collapse into one cluster.
const REACTION_CLUSTER_FRACTION = 0.03;

export function RecordingPlayer({
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
  removedReactionIds,
  onSignInRequested,
  handleRef,
  onCommentClick,
  // 19rem reserves nav + title header + padding + reaction bar; 34rem caps tall viewports.
  landscapeMaxHeightCss,
  // Framed elsewhere: reactions move into a compact control bar that stays open.
  embedded = false,
  captionsUrl,
  captionsLang,
  chapters,
  comments = [],
}: Props) {
  const playerRef = useRef<RecordingPlayerHandle | null>(null);

  const setHandle = useCallback(
    /* eslint-disable react-hooks/immutability */
    (handle: RecordingPlayerHandle | null) => {
      playerRef.current = handle;
      if (typeof handleRef === "function") {
        handleRef(handle);
      } else if (handleRef) {
        (handleRef as MutableRefObject<RecordingPlayerHandle | null>).current =
          handle;
      }
    },
    /* eslint-enable react-hooks/immutability */
    [handleRef],
  );

  const [ownReactions, setReactions] =
    useState<RecordingReaction[]>(initialReactions);
  const reactions = useMemo(
    () =>
      removedReactionIds && removedReactionIds.size > 0
        ? ownReactions.filter((r) => !removedReactionIds.has(r.id))
        : ownReactions,
    [ownReactions, removedReactionIds],
  );
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

    const optimistic: RecordingReaction = {
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
    <BaseRecordingPlayer
      ref={setHandle}
      videoUrl={videoUrl}
      posterUrl={posterUrl}
      webcamUrl={webcamUrl}
      serverDurationMs={serverDurationMs}
      serverWidth={serverWidth}
      serverHeight={serverHeight}
      config={config}
      captionsUrl={captionsUrl}
      captionsLang={captionsLang}
      chapters={chapters}
      landscapeMaxHeightCss={landscapeMaxHeightCss}
      progressOverlay={(info) => (
        <>
          <ReactionLayer
            kind="dots"
            reactions={reactions}
            freshIds={freshIds}
            info={info}
          />
          <CommentMarks comments={comments} info={info} />
        </>
      )}
      floatingOverlay={(info) => (
        <>
          <ReactionLayer
            kind="bursts"
            reactions={reactions}
            freshIds={freshIds}
            info={info}
          />
          <CommentBursts comments={comments} info={info} />
        </>
      )}
      controlsAlwaysVisible={embedded}
      compactControls={embedded}
      controlsExtra={
        embedded ? (
          <InlineReactions
            onReact={sendReaction}
            pulseEmoji={pulseEmoji}
            onCommentClick={onCommentClick}
          />
        ) : undefined
      }
      belowPlayer={
        embedded ? undefined : (
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
                className="flex h-[60px] items-center gap-2.5 rounded-full bg-panel px-6 text-base font-medium text-fg shadow-md backdrop-blur-xl transition-transform duration-100 ease-out hover:-translate-y-0.5"
                aria-label="Leave a comment"
              >
                <MessageSquare className="h-6 w-6" aria-hidden="true" />
                <span className="hidden sm:inline">Comment</span>
              </button>
            ) : null}
          </div>
        )
      }
    />
  );
}

// Both overlays cluster the same reactions on the slider's timeline; the
// dots live in the slider slot and the bursts over the whole player.
function ReactionLayer({
  kind,
  reactions,
  freshIds,
  info,
}: {
  kind: "dots" | "bursts";
  reactions: RecordingReaction[];
  freshIds: Set<number>;
  info: ProgressOverlayInfo;
}) {
  const { durationSeconds, currentSeconds, controlsVisible, toTimelineMs } =
    info;
  const clusters = useReactionClusters(
    reactions,
    freshIds,
    durationSeconds,
    toTimelineMs,
  );
  const Layer = kind === "dots" ? ReactionDots : ReactionBursts;
  return (
    <Layer
      clusters={clusters}
      currentSeconds={currentSeconds}
      durationSeconds={durationSeconds}
      controlsVisible={controlsVisible}
    />
  );
}

type ReactionCluster = {
  fraction: number;
  // Every reaction in the cluster, in time order.
  emojis: string[];
  isFresh: boolean;
};

type ReactionBurst = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delayMs: number;
};

function useReactionClusters(
  reactions: RecordingReaction[],
  freshIds: Set<number>,
  durationSeconds: number,
  toTimelineMs: (sourceMs: number) => number,
): ReactionCluster[] {
  return useMemo(
    () =>
      clusterReactions(
        reactions.map((r) => ({
          ...r,
          timestampMs: toTimelineMs(r.timestampMs),
        })),
        durationSeconds,
        freshIds,
      ),
    [reactions, durationSeconds, freshIds, toTimelineMs],
  );
}

function clusterReactions(
  reactions: RecordingReaction[],
  durationSeconds: number,
  freshIds: Set<number>,
): ReactionCluster[] {
  if (reactions.length === 0 || durationSeconds <= 0) return [];
  const totalMs = durationSeconds * 1000;
  const windowMs = totalMs * REACTION_CLUSTER_FRACTION;
  const out: ReactionCluster[] = [];
  let bucket: RecordingReaction[] = [];

  const flush = (): void => {
    if (bucket.length === 0) return;
    let sumMs = 0;
    let fresh = false;
    for (const r of bucket) {
      sumMs += r.timestampMs;
      if (freshIds.has(r.id)) fresh = true;
    }
    const meanMs = sumMs / bucket.length;
    out.push({
      fraction: Math.max(0, Math.min(1, meanMs / totalMs)),
      emojis: bucket.map((r) => r.emoji),
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
): Promise<RecordingReaction> {
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

// Marks closer than this merge, so their emoji rows never overlap.
const CLUSTER_VISUAL_WIDTH_PX = 36;
const MAX_STACKED_EMOJIS = 3;
// Must match the rise animation duration in globals.css.
const BURST_MS = 1600;
// Gap between the emojis of one cluster, played back to back.
const BURST_STAGGER_MS = 220;
// A bigger jump between two time samples is a seek, which passes marks
// silently.
const MAX_PLAYBACK_STEP_SECONDS = 1.5;

// One mark per cluster, cut into the time slider in the emoji's colour.
function ReactionDots({
  clusters,
}: {
  clusters: ReactionCluster[];
  currentSeconds: number;
  durationSeconds: number;
  controlsVisible: boolean;
}) {
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
        const dn = b.c.emojis.length - a.c.emojis.length;
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
    <div className="pointer-events-none absolute inset-0" ref={trackRef}>
      {visible.map((c, idx) => {
        const stack = rankedEmojis(c.emojis);
        const left = `${c.fraction * 100}%`;
        return (
          <Fragment key={idx}>
            <span
              data-reaction-dot
              className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-[1px] transition-[height] duration-media-slow ease-out group-hover/bar:h-1.75"
              style={{ left, backgroundColor: reactionColor(stack[0] ?? "") }}
            />
            <span
              data-reaction-stack
              className="absolute bottom-[calc(50%+5px)] flex -translate-x-1/2 items-end text-[16px] leading-none drop-shadow-[0_1px_1px_rgb(0_0_0/0.5)]"
              style={{ left }}
            >
              {stack.slice(0, MAX_STACKED_EMOJIS).map((emoji, i) => (
                <span key={i} className={cn(i > 0 && "-ml-1.5")}>
                  {emoji}
                </span>
              ))}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

// A mark per timestamped comment, with a speech bubble above it that shows
// the comment on hover.
function CommentMarks({
  comments,
  info,
}: {
  comments: RecordingComment[];
  info: ProgressOverlayInfo;
}) {
  const { durationSeconds, toTimelineMs } = info;
  if (durationSeconds <= 0) return null;
  const totalMs = durationSeconds * 1000;
  return (
    <div className="absolute inset-0">
      {comments.map((c) => {
        if (c.timestampMs == null) return null;
        const fraction = Math.max(
          0,
          Math.min(1, toTimelineMs(c.timestampMs) / totalMs),
        );
        const left = `${fraction * 100}%`;
        return (
          <Fragment key={c.id}>
            <span
              data-comment-mark
              className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-white transition-[height] duration-media-slow ease-out group-hover/bar:h-1.75"
              style={{ left }}
            />
            <span
              className="group/comment pointer-events-auto absolute bottom-[calc(50%+5px)] -translate-x-1/2"
              style={{ left }}
            >
              <MessageSquare
                className="size-4 text-media-controls-foreground drop-shadow-[0_1px_1px_rgb(0_0_0/0.5)]"
                aria-hidden="true"
              />
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute bottom-full mb-1.5 hidden w-max max-w-64 rounded-lg bg-[#171717] px-2.5 py-1.5 text-left text-xs text-white shadow-lg ring-1 ring-white/10 group-hover/comment:block",
                  fraction < 0.15
                    ? "left-0"
                    : fraction > 0.85
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2",
                )}
              >
                <span className="block font-semibold">{c.userName}</span>
                <span className="block whitespace-pre-line">{c.body}</span>
              </span>
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

// Distinct emojis, most frequent first.
function rankedEmojis(emojis: readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const e of emojis) counts.set(e, (counts.get(e) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([e]) => e);
}

/*
 * Emojis floating up the video. While the controls are hidden and playback
 * reaches a cluster's mark, its reactions take off one after another. With
 * the controls showing the emojis already sit on the bar, and seeking past
 * a mark stays quiet.
 */
function ReactionBursts({
  clusters,
  currentSeconds,
  durationSeconds,
  controlsVisible,
}: {
  clusters: ReactionCluster[];
  currentSeconds: number;
  durationSeconds: number;
  controlsVisible: boolean;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<ReactionBurst[]>([]);
  const burstIdRef = useRef(0);

  const timeOf = useCallback(
    (c: ReactionCluster) => c.fraction * durationSeconds,
    [durationSeconds],
  );

  const spawn = useCallback((hits: ReactionCluster[]) => {
    const layer = layerRef.current;
    if (!layer) return;
    const origin = takeoffOrigin(layer);
    const added: ReactionBurst[] = [];
    for (const c of hits) {
      if (c.isFresh) continue;
      c.emojis.forEach((emoji, i) => {
        added.push({
          id: ++burstIdRef.current,
          x: origin.left + c.fraction * origin.width,
          y: origin.y,
          emoji,
          delayMs: i * BURST_STAGGER_MS,
        });
      });
    }
    if (added.length === 0) return;
    setBursts((prev) => [...prev, ...added]);
    const ids = new Set(added.map((b) => b.id));
    const longest = Math.max(...added.map((b) => b.delayMs));
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => !ids.has(b.id)));
    }, BURST_MS + longest);
  }, []);

  usePassedMarks(clusters, timeOf, currentSeconds, !controlsVisible, spawn);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {bursts.map((b) => (
        <span
          key={b.id}
          data-reaction-burst
          className="animate-reaction-rise absolute text-[26px] leading-none"
          style={{
            left: b.x,
            top: b.y,
            animationDelay: `${b.delayMs}ms`,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
          }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}

// Calls onPass with the items playback just crossed while it advances with
// `enabled` set. A seek passes marks silently.
function usePassedMarks<T>(
  items: T[],
  timeOf: (item: T) => number,
  currentSeconds: number,
  enabled: boolean,
  onPass: (hits: T[]) => void,
): void {
  const prevSecondsRef = useRef(currentSeconds);
  useEffect(() => {
    const prev = prevSecondsRef.current;
    prevSecondsRef.current = currentSeconds;
    const step = currentSeconds - prev;
    if (!enabled || step <= 0 || step > MAX_PLAYBACK_STEP_SECONDS) return;
    const hits = items.filter((item) => {
      const at = timeOf(item);
      // A mark at the very start fires when playback leaves 0.
      const reached = at > prev || (at === 0 && prev === 0);
      return reached && at <= currentSeconds;
    });
    if (hits.length > 0) onPass(hits);
  }, [currentSeconds, items, timeOf, enabled, onPass]);
}

type CommentBurst = {
  id: number;
  x: number;
  y: number;
  comment: RecordingComment;
  delayMs: number;
};

const COMMENT_BURST_MS = 3200;
// Half the widest comment card, so it never leaves the player.
const COMMENT_BURST_HALF_WIDTH_PX = 140;

// Comments drifting up the video as playback passes their time, like the
// reactions, while the controls are hidden.
function CommentBursts({
  comments,
  info,
}: {
  comments: RecordingComment[];
  info: ProgressOverlayInfo;
}) {
  const { currentSeconds, durationSeconds, controlsVisible, toTimelineMs } =
    info;
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<CommentBurst[]>([]);
  const burstIdRef = useRef(0);
  const timed = useMemo(
    () => comments.filter((c) => c.timestampMs != null),
    [comments],
  );
  const timeOf = useCallback(
    (c: RecordingComment) => toTimelineMs(c.timestampMs ?? 0) / 1000,
    [toTimelineMs],
  );

  const spawn = useCallback(
    (hits: RecordingComment[]) => {
      const layer = layerRef.current;
      if (!layer || durationSeconds <= 0) return;
      const origin = takeoffOrigin(layer);
      const width = layer.clientWidth;
      const added = hits.map((comment, i) => {
        const x =
          origin.left + (timeOf(comment) / durationSeconds) * origin.width;
        return {
          id: ++burstIdRef.current,
          x: Math.min(
            Math.max(x, COMMENT_BURST_HALF_WIDTH_PX),
            width - COMMENT_BURST_HALF_WIDTH_PX,
          ),
          y: origin.y,
          comment,
          delayMs: i * BURST_STAGGER_MS,
        };
      });
      setBursts((prev) => [...prev, ...added]);
      const ids = new Set(added.map((b) => b.id));
      const longest = Math.max(...added.map((b) => b.delayMs));
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => !ids.has(b.id)));
      }, COMMENT_BURST_MS + longest);
    },
    [durationSeconds, timeOf],
  );

  usePassedMarks(timed, timeOf, currentSeconds, !controlsVisible, spawn);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0">
      {bursts.map((b) => (
        <span
          key={b.id}
          data-comment-burst
          className="animate-reaction-rise absolute flex w-max max-w-64 items-start gap-1.5 rounded-lg bg-[#171717] px-2.5 py-1.5 text-left text-xs text-white shadow-lg ring-1 ring-white/10"
          style={{
            left: b.x,
            top: b.y,
            animationDelay: `${b.delayMs}ms`,
            animationDuration: `${COMMENT_BURST_MS}ms`,
          }}
        >
          <MessageSquare
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block font-semibold">{b.comment.userName}</span>
            <span className="line-clamp-3 whitespace-pre-line">
              {b.comment.body}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

// Where emojis take off from: the time slider's span inside the player, so
// they rise from their dot, or the bottom edge when there is no slider.
function takeoffOrigin(layer: HTMLElement): {
  left: number;
  width: number;
  y: number;
} {
  const own = layer.getBoundingClientRect();
  const slider = layer.parentElement?.querySelector<HTMLElement>(
    '[role="slider"][aria-label="Seek"]',
  )?.parentElement;
  if (!slider) return { left: 0, width: own.width, y: own.height - 24 };
  const r = slider.getBoundingClientRect();
  return {
    left: r.left - own.left,
    width: r.width,
    y: r.top - own.top + r.height / 2,
  };
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
    <div className="flex items-center gap-1 rounded-full bg-panel px-2 py-1.5 shadow-md backdrop-blur-xl">
      {DEFAULT_REACTIONS.map((r) => {
        const isPulsing = pulseEmoji === r.emoji;
        const count = counts[r.emoji] ?? 0;
        return (
          <div key={r.emoji} className="group relative">
            <button
              type="button"
              onClick={() => onReact(r.emoji)}
              aria-label={r.label}
              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-[28px] leading-none transition-transform duration-100 ease-out hover:-translate-y-2 active:translate-y-0 ${
                isPulsing ? "animate-recording-icon-pop" : ""
              }`}
            >
              <span aria-hidden="true">{r.emoji}</span>
            </button>
            <div className="pointer-events-none absolute -top-11 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-panel px-2.5 py-1.5 text-sm font-medium text-fg opacity-0 shadow-lg ring-1 ring-line-strong transition-opacity duration-100 group-hover:opacity-100">
              <span>{r.label}</span>
              {count > 0 ? (
                <span className="rounded bg-tint-strong px-1.5 py-0.5 tabular-nums text-xs text-fg-muted">
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

function InlineReactions({
  onReact,
  pulseEmoji,
  onCommentClick,
}: {
  onReact: (emoji: string) => void;
  pulseEmoji: string | null;
  onCommentClick?: () => void;
}) {
  return (
    <div className="mx-auto flex items-center">
      {DEFAULT_REACTIONS.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onReact(r.emoji)}
          aria-label={r.label}
          title={r.label}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[22px] leading-none transition-transform duration-100 ease-out hover:-translate-y-0.5 motion-reduce:transition-none ${
            pulseEmoji === r.emoji ? "animate-recording-icon-pop" : ""
          }`}
        >
          <span aria-hidden="true">{r.emoji}</span>
        </button>
      ))}
      {onCommentClick ? (
        <button
          type="button"
          onClick={onCommentClick}
          aria-label="Leave a comment"
          title="Leave a comment"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-tint-strong hover:text-white"
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
