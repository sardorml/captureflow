"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtSign, MessageSquare, Smile, Sparkles, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { withSplitLoaded } from "@/components/dev/split-loaded";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  initials,
  formatTimestamp,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import type {
  AddCommentResponse,
  RecordingComment,
  RecordingReaction,
} from "@/lib/recording/types";
import {
  groupReactionBursts,
  type ReactionBurst,
} from "@/lib/recording/reaction-bursts";
import { cn } from "@/lib/utils";
import { whenIdle } from "@/lib/when-idle";

const AVATAR_TONES = [
  "#2563eb",
  "#c026d3",
  "#059669",
  "#0284c7",
  "#f59e0b",
  "#e11d48",
] as const;

function toneFromSeed(seed: string | null | undefined): string | undefined {
  if (!seed) return undefined;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

/*
 * Shared by the dynamic component and the idle prefetch below, so both resolve
 * the same module and the prefetch actually warms what the popover renders.
 */
const loadEmojiPicker = () => import("emoji-picker-react");

const EmojiPicker = dynamic(
  () =>
    loadEmojiPicker().then((m) => withSplitLoaded("emoji-picker", m.default)),
  { ssr: false },
);

type ActivityEntry =
  | {
      kind: "reaction";
      id: string;
      createdAt: number;
      burst: ReactionBurst;
    }
  | {
      kind: "comment";
      id: string;
      createdAt: number;
      comment: RecordingComment;
    };

type Props = {
  slug: string;
  initialReactions: RecordingReaction[];
  initialComments: RecordingComment[];
  viewerSignedIn: boolean;
  viewerName: string | null;
  viewerUserId: string | null;
  viewerImageUrl: string | null;
  isOwner: boolean;
  liveReactions: RecordingReaction[];
  // Called once the server has dropped a reaction, so the player's dots
  // follow.
  onReactionDeleted: (id: number) => void;
  // Every change to the comment list, so the player's marks follow.
  onCommentsChange?: (comments: RecordingComment[]) => void;
  // The Transcript tab's content.
  transcript: ReactNode;
  // The owner's Edit tab; absent for everyone else.
  editPanel?: ReactNode;
  onSignIn: () => void;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
  commentInputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
};

type SidebarTab = "edit" | "activity" | "transcript";

const TAB_CLASS =
  "h-full flex-1 group-data-horizontal/tabs:after:bottom-[-1px]";

export function ActivitySidebar({
  slug,
  initialReactions,
  initialComments,
  viewerSignedIn,
  viewerName,
  viewerUserId,
  viewerImageUrl,
  isOwner,
  liveReactions,
  onReactionDeleted,
  onCommentsChange,
  transcript,
  editPanel,
  onSignIn,
  onSeek,
  getCurrentMs,
  commentInputRef,
}: Props) {
  const [tab, setTab] = useState<SidebarTab>("activity");
  const [comments, setComments] = useState<RecordingComment[]>(initialComments);
  useEffect(() => {
    onCommentsChange?.(comments);
  }, [comments, onCommentsChange]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingReactionId, setDeletingReactionId] = useState<number | null>(
    null,
  );
  const [removedReactionIds, setRemovedReactionIds] = useState<Set<number>>(
    () => new Set(),
  );

  const handleDeleteReactions = async (ids: number[]) => {
    if (deletingReactionId != null || ids.length === 0) return;
    const key = ids[0] ?? null;
    setDeletingReactionId(key);
    setError(null);
    setRemovedReactionIds((prev) => new Set([...prev, ...ids]));
    const failed: number[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/r/reactions/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Delete failed (${res.status})`);
        onReactionDeleted(id);
      } catch {
        failed.push(id);
      }
    }
    if (failed.length > 0) {
      setRemovedReactionIds((prev) => {
        const next = new Set(prev);
        for (const id of failed) next.delete(id);
        return next;
      });
      setError("Could not delete reaction");
    }
    setDeletingReactionId(null);
  };

  const handleDeleteComment = async (id: number) => {
    if (deletingId != null) return;
    setDeletingId(id);
    setError(null);
    const snapshot = comments;
    setComments((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/r/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
    } catch (err) {
      setComments(snapshot);
      setError(err instanceof Error ? err.message : "Could not delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const [previewMs, setPreviewMs] = useState(0);
  useEffect(() => {
    if (!viewerSignedIn) return;
    const tick = () => setPreviewMs(getCurrentMs());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [viewerSignedIn, getCurrentMs]);

  const reactions = mergeReactions(initialReactions, liveReactions).filter(
    (r) => !removedReactionIds.has(r.id),
  );

  const entries: ActivityEntry[] = [
    ...groupReactionBursts(reactions).map<ActivityEntry>((b) => ({
      kind: "reaction" as const,
      id: `r-${b.id}`,
      createdAt: b.createdAt,
      burst: b,
    })),
    ...comments.map<ActivityEntry>((c) => ({
      kind: "comment" as const,
      id: `c-${c.id}`,
      createdAt: c.createdAt,
      comment: c,
    })),
  ].sort((a, b) => a.createdAt - b.createdAt);

  // Chronological order puts the newest entry at the bottom (chat-style), so
  // keep the list pinned there as entries arrive — unless the reader has
  // scrolled up to read history.
  const listRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  // Fades the top edge once older entries sit above the fold.
  const [moreAbove, setMoreAbove] = useState(false);
  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 64;
    lastScrollTopRef.current = el.scrollTop;
    setMoreAbove(el.scrollTop > 8);
  };
  // Also on the tab, since the panel remounts each time it is shown and would
  // otherwise come back scrolled to the oldest entry.
  useEffect(() => {
    if (tab !== "activity") return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = stickToBottomRef.current
      ? el.scrollHeight
      : lastScrollTopRef.current;
    setMoreAbove(el.scrollTop > 8);
  }, [entries.length, tab]);

  // No useMemo: a manual memo over `reactions` (rebuilt every render via
  // mergeReactions) trips react-hooks/preserve-manual-memoization.
  const participants = ((): { userId: string; userName: string }[] => {
    const seen = new Set<string>();
    const out: { userId: string; userName: string }[] = [];
    const consider = (userId: string | null, userName: string | null) => {
      if (!userId || !userName) return;
      const key = `${userId}:${userName}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ userId, userName });
    };
    for (const r of reactions) consider(r.userId, r.userName);
    for (const c of comments) consider(c.userId, c.userName);
    return out;
  })();

  const mentionCandidates = participants.map((p) => ({
    key: p.userId,
    name: p.userName,
  }));

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  /*
   * The picker only renders inside the popover, so its chunk would not start
   * downloading until the first click. Warming it when the composer gets
   * focus or the pointer reaches the button keeps the click off the network
   * without spending the page's load on a picker most viewers never open.
   */
  const warmEmojiPicker = () => void loadEmojiPicker();

  // Its first render sets the library up, a few hundred ms even with the
  // chunk loaded, so a signed-in viewer gets one off-screen render at idle.
  const [primingEmoji, setPrimingEmoji] = useState(false);
  useEffect(
    () => (viewerSignedIn ? whenIdle(() => setPrimingEmoji(true)) : undefined),
    [viewerSignedIn],
  );

  // The composer lives in the Activity tab, so the shortcut switches to it.
  useEffect(() => {
    if (!viewerSignedIn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setTab("activity");
      requestAnimationFrame(() => {
        const el = composerRef.current;
        if (!el) return;
        el.focus();
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerSignedIn]);

  const insertAtCaret = (text: string) => {
    const el = composerRef.current;
    if (!el) {
      setDraft((prev) => prev + text);
      return;
    }
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? start;
    const next = draft.slice(0, start) + text + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      const pos = start + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const keepComposerFocus = (e: Event) => {
    if (document.activeElement === composerRef.current) e.preventDefault();
  };

  const submitComment = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!viewerSignedIn) {
      onSignIn();
      return;
    }
    const body = draft.trim();
    if (!body) return;
    setError(null);

    const timestampMs = getCurrentMs();
    const optimisticId = -Date.now();
    const optimistic: RecordingComment = {
      id: optimisticId,
      slug,
      userId: "pending",
      userName: viewerName ?? "You",
      userImage: viewerImageUrl,
      body,
      createdAt: Date.now(),
      timestampMs,
    };
    setComments((prev) => [...prev, optimistic]);
    setDraft("");

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/r/comments?slug=${encodeURIComponent(slug)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ body, timestampMs }),
          },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as AddCommentResponse;
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticId ? json.comment : c)),
        );
      } catch (err) {
        setComments((prev) => prev.filter((c) => c.id !== optimisticId));
        setError(err instanceof Error ? err.message : "Could not post comment");
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <aside className="flex w-full flex-col border-black/[0.06] bg-panel max-lg:border-t lg:h-full lg:w-auto lg:overflow-hidden lg:border-l dark:border-white/[0.07]">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as SidebarTab)}
        aria-label="Recording sidebar"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-stretch border-b border-line bg-panel/90 backdrop-blur-md lg:static lg:bg-transparent lg:backdrop-blur-none">
          <TabsList
            variant="line"
            className="w-full gap-0 p-0 group-data-horizontal/tabs:h-full"
          >
            <TabsTrigger value="activity" className={TAB_CLASS}>
              Activity
              <span className="rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                {entries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className={TAB_CLASS}>
              Transcript
            </TabsTrigger>
            {editPanel ? (
              <TabsTrigger value="edit" className={TAB_CLASS}>
                Edit
              </TabsTrigger>
            ) : null}
          </TabsList>
        </header>

        <TabsContent
          value="activity"
          className="flex min-h-0 flex-1 flex-col p-0"
        >
          <div
            ref={listRef}
            onScroll={onListScroll}
            className={cn(
              "flex-1 px-5 py-4 lg:min-h-0 lg:overflow-y-auto lg:px-6",
              moreAbove &&
                "[mask-image:linear-gradient(to_bottom,transparent,black_3rem)]",
            )}
          >
            {entries.length === 0 ? (
              <EmptyState
                viewerSignedIn={viewerSignedIn}
                viewerName={viewerName}
                commentInputRef={commentInputRef}
              />
            ) : (
              <ol className="space-y-2">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    {entry.kind === "reaction" ? (
                      <ReactionRow
                        burst={entry.burst}
                        onSeek={onSeek}
                        canDelete={
                          !!viewerUserId &&
                          (entry.burst.userId === viewerUserId || isOwner)
                        }
                        onDelete={() =>
                          handleDeleteReactions(entry.burst.reactionIds)
                        }
                        deleting={deletingReactionId === entry.burst.id}
                      />
                    ) : (
                      <CommentRow
                        comment={entry.comment}
                        onSeek={onSeek}
                        canDelete={
                          !!viewerUserId &&
                          (entry.comment.userId === viewerUserId || isOwner)
                        }
                        onDelete={() => handleDeleteComment(entry.comment.id)}
                        deleting={deletingId === entry.comment.id}
                      />
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="transcript"
          className="flex min-h-0 flex-1 flex-col px-5 py-4 lg:px-6"
        >
          {transcript}
        </TabsContent>

        {editPanel ? (
          <TabsContent
            value="edit"
            className="min-h-0 flex-1 px-5 py-4 lg:overflow-y-auto lg:px-6"
          >
            {editPanel}
          </TabsContent>
        ) : null}
      </Tabs>

      <div
        className={cn(
          "sticky bottom-0 z-10 bg-canvas-2 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-canvas-2/85 lg:bg-transparent lg:p-3 lg:backdrop-blur-none",
          tab !== "activity" && "hidden",
        )}
      >
        {!viewerSignedIn ? (
          <Button size="lg" className="w-full" onClick={onSignIn}>
            <Sparkles size={16} />
            Sign in to react &amp; comment
          </Button>
        ) : (
          <form
            onSubmit={submitComment}
            className="focus-within:ring-ring relative rounded-2xl border border-black/[0.15] bg-panel-2 p-3 focus-within:ring-2 dark:border-white/[0.16]"
          >
            <div className="flex items-start gap-2.5">
              <Avatar
                className="mt-0.5 size-7 shrink-0"
                style={{ backgroundColor: toneFromSeed(viewerUserId) }}
              >
                {viewerImageUrl && <AvatarImage src={viewerImageUrl} alt="" />}
                <AvatarFallback className="bg-transparent text-[11px] font-medium text-white">
                  {initials(viewerName ?? "You")}
                </AvatarFallback>
              </Avatar>
              <textarea
                ref={(el) => {
                  composerRef.current = el;
                  if (commentInputRef) commentInputRef.current = el;
                }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={warmEmojiPicker}
                placeholder="Leave a comment…"
                rows={1}
                className="block min-h-[1.5rem] w-full resize-none bg-transparent text-sm text-fg placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <DropdownMenu
                  open={mentionOpen}
                  onOpenChange={(o) => {
                    setMentionOpen(o);
                    if (o) setEmojiOpen(false);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mention someone"
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    onCloseAutoFocus={keepComposerFocus}
                  >
                    {mentionCandidates.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No one has reacted or commented yet
                      </DropdownMenuItem>
                    ) : (
                      mentionCandidates.map((c) => (
                        <DropdownMenuItem
                          key={c.key}
                          onSelect={() => {
                            const p = participants.find(
                              (x) => x.userId === c.key,
                            );
                            if (p) insertAtCaret(`@${p.userName} `);
                            setMentionOpen(false);
                          }}
                        >
                          {c.name}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Popover
                  open={emojiOpen}
                  onOpenChange={(o) => {
                    setEmojiOpen(o);
                    if (o) setMentionOpen(false);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Insert emoji"
                      onMouseEnter={warmEmojiPicker}
                      onFocus={warmEmojiPicker}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-auto p-0"
                    onCloseAutoFocus={keepComposerFocus}
                  >
                    <EmojiPickerThemed
                      onPick={(emoji) => {
                        insertAtCaret(emoji);
                        setEmojiOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="submit"
                variant={draft.trim() ? "default" : "ghost"}
                size="sm"
                disabled={posting || !draft.trim()}
              >
                {posting
                  ? "Posting…"
                  : `Comment at ${formatTimestamp(previewMs)}`}
              </Button>
            </div>
          </form>
        )}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
      {primingEmoji && (
        <EmojiPickerPrimer onDone={() => setPrimingEmoji(false)} />
      )}
    </aside>
  );
}

function EmojiPickerPrimer({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(onDone);
    return () => cancelAnimationFrame(id);
  }, [onDone]);
  return (
    <div
      aria-hidden
      inert
      className="pointer-events-none fixed top-0 left-0 opacity-0"
    >
      <EmojiPickerThemed onPick={() => {}} />
    </div>
  );
}

function EmojiPickerThemed({ onPick }: { onPick: (emoji: string) => void }) {
  // Watches <html> data-theme since ThemeToggle mutates it imperatively.
  const [emojiTheme, setEmojiTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  });
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      setEmojiTheme(attr === "light" ? "light" : "dark");
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div data-split="emoji-picker" className="contents">
      <EmojiPicker
        theme={emojiTheme as never}
        emojiStyle={"native" as never}
        lazyLoadEmojis
        searchPlaceholder="Search emoji"
        width={320}
        height={380}
        onEmojiClick={(data: { emoji: string }) => onPick(data.emoji)}
      />
    </div>
  );
}

function EmptyState({
  viewerSignedIn,
  viewerName,
  commentInputRef,
}: {
  viewerSignedIn: boolean;
  viewerName: string | null;
  commentInputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}) {
  const firstName = (viewerName ?? "").trim().split(/\s+/)[0] || null;
  const focusComposer = () => {
    const el = commentInputRef?.current;
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
        <MessageSquare className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-semibold text-fg">
        {viewerSignedIn
          ? firstName
            ? `Be the first to comment, ${firstName}`
            : "Be the first to comment"
          : "No activity yet"}
      </p>
      {viewerSignedIn ? (
        <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
          Hit{" "}
          <button
            type="button"
            onClick={focusComposer}
            className="inline-flex items-center rounded border border-line-strong bg-tint px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg transition-colors hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-300"
            title="Focus the comment box"
          >
            C
          </button>{" "}
          to reply or leave a comment at the bottom of this panel.
        </p>
      ) : (
        <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
          Reactions and comments from viewers will show up here as they happen.
        </p>
      )}
    </div>
  );
}

// A burst of taps reads as one row: the avatar wears the first emoji, and
// each emoji in the run follows the name with its count.
function ReactionRow({
  burst,
  onSeek,
  canDelete,
  onDelete,
  deleting,
}: {
  burst: ReactionBurst;
  onSeek: (ms: number) => void;
  canDelete: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const name = burst.userName?.trim() || "Anonymous";
  const total = burst.reactionIds.length;
  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-tint">
      <span className="relative shrink-0">
        <Avatar
          className="size-8"
          style={{ backgroundColor: toneFromSeed(burst.userId ?? name) }}
        >
          {burst.userImage && <AvatarImage src={burst.userImage} alt="" />}
          <AvatarFallback className="bg-transparent text-[11px] font-medium text-white">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-1.5 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-panel text-[12px] leading-none ring-2 ring-panel">
          {burst.emojis[0]?.emoji}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-fg">
        <span className="truncate font-semibold">{name}</span>
        {total > 1 && (
          <span
            className="flex shrink-0 items-center gap-1.5 text-xs text-fg-muted"
            aria-label={`${total} reactions`}
          >
            {burst.emojis.map(({ emoji, count }) => (
              <span key={emoji} className="inline-flex items-center gap-0.5">
                <span className="text-sm leading-none">{emoji}</span>
                {count > 1 && <span>×{count}</span>}
              </span>
            ))}
          </span>
        )}
        <TimestampChip
          ms={burst.timestampMs}
          onClick={() => onSeek(burst.timestampMs)}
        />
        <span className="shrink-0 text-xs">
          {formatRelative(burst.createdAt)}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            aria-label={
              total > 1 ? `Delete ${total} reactions` : "Delete reaction"
            }
            title={total > 1 ? `Delete ${total} reactions` : "Delete reaction"}
            className="ml-auto rounded-md p-1.5 text-fg-subtle opacity-0 transition-opacity transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:opacity-100 disabled:cursor-progress group-hover:opacity-100 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  onSeek,
  canDelete,
  onDelete,
  deleting,
}: {
  comment: RecordingComment;
  onSeek: (ms: number) => void;
  canDelete: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-tint">
      <Avatar
        className="size-8 shrink-0"
        style={{
          backgroundColor: toneFromSeed(comment.userId ?? comment.userName),
        }}
      >
        {comment.userImage && <AvatarImage src={comment.userImage} alt="" />}
        <AvatarFallback className="bg-transparent text-[11px] font-medium text-white">
          {initials(comment.userName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex h-8 items-center gap-2">
          <span className="truncate text-sm font-semibold text-fg">
            {comment.userName}
          </span>
          {comment.timestampMs != null && (
            <TimestampChip
              ms={comment.timestampMs}
              onClick={() => onSeek(comment.timestampMs!)}
            />
          )}
          <span className="shrink-0 text-xs text-fg">
            {formatRelative(comment.createdAt)}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete comment"
              title="Delete comment"
              className="ml-auto rounded-md p-1.5 text-fg-subtle opacity-0 transition-opacity transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:opacity-100 disabled:cursor-progress group-hover:opacity-100 dark:hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

function TimestampChip({ ms, onClick }: { ms: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Jump to this moment"
      className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-accent-strong tabular-nums transition-colors hover:bg-primary/15"
    >
      {formatTimestamp(ms)}
    </button>
  );
}

function mergeReactions(
  base: RecordingReaction[],
  live: RecordingReaction[],
): RecordingReaction[] {
  if (live.length === 0) return base;
  const seen = new Set(base.map((r) => r.id));
  const extras = live.filter((r) => !seen.has(r.id));
  return extras.length ? [...base, ...extras] : base;
}
