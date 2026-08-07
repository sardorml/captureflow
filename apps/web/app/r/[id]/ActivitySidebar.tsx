"use client";

import {
  Avatar,
  Button,
  Dropdown,
  Popover,
  buttonVariants,
} from "@heroui/react";
import { AtSign, MessageSquare, Smile, Sparkles, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
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

const EmojiPicker = dynamic(loadEmojiPicker, {
  ssr: false,
});

type ActivityEntry =
  | {
      kind: "reaction";
      id: string;
      createdAt: number;
      reaction: RecordingReaction;
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
  onSignIn: () => void;
  onSeek: (ms: number) => void;
  getCurrentMs: () => number;
  commentInputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
};

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
  onSignIn,
  onSeek,
  getCurrentMs,
  commentInputRef,
}: Props) {
  const [comments, setComments] = useState<RecordingComment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const reactions = mergeReactions(initialReactions, liveReactions);

  const entries: ActivityEntry[] = [
    ...reactions.map<ActivityEntry>((r) => ({
      kind: "reaction" as const,
      id: `r-${r.id}`,
      createdAt: r.createdAt,
      reaction: r,
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
  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 64;
  };
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

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
   * The picker only renders inside the popover, so without this its chunk does
   * not start downloading until the first click — which is the whole of that
   * first-open stutter. Warming it on idle keeps the click off the network
   * without competing with the page's own load.
   */
  useEffect(() => {
    if (!viewerSignedIn) return;
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => void loadEmojiPicker())
        : window.setTimeout(() => void loadEmojiPicker(), 1500);
    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
    };
  }, [viewerSignedIn]);

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
      const el = composerRef.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
    <aside className="flex w-full flex-col bg-canvas-2 lg:h-full lg:border-l lg:border-line">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-canvas-2/90 px-5 py-4 backdrop-blur-md lg:static lg:bg-canvas-2 lg:backdrop-blur-none">
        <h2 className="text-sm font-semibold tracking-tight text-fg">
          Activity
        </h2>
        <span className="text-xs text-fg-muted">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </header>

      <div
        ref={listRef}
        onScroll={onListScroll}
        className="flex-1 px-5 py-4 lg:min-h-0 lg:overflow-y-auto"
      >
        {entries.length === 0 ? (
          <EmptyState
            viewerSignedIn={viewerSignedIn}
            viewerName={viewerName}
            commentInputRef={commentInputRef}
          />
        ) : (
          <ol className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id}>
                {entry.kind === "reaction" ? (
                  <ReactionRow reaction={entry.reaction} onSeek={onSeek} />
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

      <div className="sticky bottom-0 z-10 border-t border-line bg-canvas-2 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-canvas-2/85">
        {!viewerSignedIn ? (
          <Button variant="primary" size="lg" fullWidth onPress={onSignIn}>
            <Sparkles size={16} />
            Sign in to react &amp; comment
          </Button>
        ) : (
          <form
            onSubmit={submitComment}
            className="focus-within:ring-focus relative rounded-2xl bg-field p-3 focus-within:ring-2"
          >
            <div className="flex items-start gap-2.5">
              <Avatar
                className="h-7 w-7 mt-0.5 shrink-0"
                style={{ backgroundColor: toneFromSeed(viewerUserId) }}
              >
                {viewerImageUrl && <Avatar.Image src={viewerImageUrl} alt="" />}
                <Avatar.Fallback className="text-[11px]">
                  {initials(viewerName ?? "You")}
                </Avatar.Fallback>
              </Avatar>
              <textarea
                ref={(el) => {
                  composerRef.current = el;
                  if (commentInputRef) commentInputRef.current = el;
                }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Leave a comment…"
                rows={1}
                className="block min-h-[1.5rem] w-full resize-none bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <Dropdown
                  isOpen={mentionOpen}
                  onOpenChange={(o) => {
                    setMentionOpen(o);
                    if (o) setEmojiOpen(false);
                  }}
                >
                  <Dropdown.Trigger
                    aria-label="Mention someone"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      isIconOnly: true,
                    })}
                  >
                    <AtSign className="h-4 w-4" />
                  </Dropdown.Trigger>
                  <Dropdown.Popover placement="top start">
                    <Dropdown.Menu
                      onAction={(key) => {
                        const p = participants.find((x) => x.userId === key);
                        if (p) insertAtCaret(`@${p.userName} `);
                        setMentionOpen(false);
                      }}
                    >
                      {mentionCandidates.length === 0 ? (
                        <Dropdown.Item id="none" isDisabled>
                          No one has reacted or commented yet
                        </Dropdown.Item>
                      ) : (
                        mentionCandidates.map((c) => (
                          <Dropdown.Item key={c.key} id={c.key}>
                            {c.name}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
                <Popover
                  isOpen={emojiOpen}
                  onOpenChange={(o) => {
                    setEmojiOpen(o);
                    if (o) setMentionOpen(false);
                  }}
                >
                  <Popover.Trigger className="inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      aria-label="Insert emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content placement="top start" className="p-0">
                    <EmojiPickerThemed
                      onPick={(emoji) => {
                        insertAtCaret(emoji);
                        setEmojiOpen(false);
                      }}
                    />
                  </Popover.Content>
                </Popover>
              </div>
              <Button
                type="submit"
                variant={draft.trim() ? "primary" : "ghost"}
                size="sm"
                isDisabled={posting || !draft.trim()}
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
    </aside>
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
    <EmojiPicker
      theme={emojiTheme as never}
      emojiStyle={"native" as never}
      lazyLoadEmojis
      searchPlaceholder="Search emoji"
      width={320}
      height={380}
      onEmojiClick={(data: { emoji: string }) => onPick(data.emoji)}
    />
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

function ReactionRow({
  reaction,
  onSeek,
}: {
  reaction: RecordingReaction;
  onSeek: (ms: number) => void;
}) {
  const name = reaction.userName?.trim() || "Anonymous";
  return (
    <div className="flex items-start gap-2.5">
      <Avatar
        className="h-7 w-7"
        style={{ backgroundColor: toneFromSeed(reaction.userId ?? name) }}
      >
        {reaction.userImage && <Avatar.Image src={reaction.userImage} alt="" />}
        <Avatar.Fallback className="text-[11px]">
          {initials(name)}
        </Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-fg">
          <span className="font-medium text-fg">{name}</span>{" "}
          <span className="text-fg-muted">reacted</span>{" "}
          <span className="align-middle text-base">{reaction.emoji}</span>{" "}
          <span className="text-fg-muted">at</span>{" "}
          <TimestampChip
            ms={reaction.timestampMs}
            onClick={() => onSeek(reaction.timestampMs)}
          />
        </p>
        <p className="mt-1 text-[11px] text-fg-muted">
          {formatRelative(reaction.createdAt)}
        </p>
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
    <div className="group flex items-start gap-2.5">
      <Avatar
        className="h-7 w-7"
        style={{
          backgroundColor: toneFromSeed(comment.userId ?? comment.userName),
        }}
      >
        {comment.userImage && <Avatar.Image src={comment.userImage} alt="" />}
        <Avatar.Fallback className="text-[11px]">
          {initials(comment.userName)}
        </Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-fg">
            {comment.userName}
          </span>
          {comment.timestampMs != null && (
            <TimestampChip
              ms={comment.timestampMs}
              onClick={() => onSeek(comment.timestampMs!)}
            />
          )}
          <span className="text-[11px] text-fg-muted">
            {formatRelative(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-fg">
          {comment.body}
        </p>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete comment"
          title="Delete comment"
          className="rounded-md p-1.5 text-fg-subtle opacity-0 transition-opacity transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:opacity-100 disabled:cursor-progress group-hover:opacity-100 dark:hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function TimestampChip({ ms, onClick }: { ms: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Jump to this moment"
      className="rounded bg-tint px-1.5 py-0.5 font-mono text-[11px] text-fg ring-1 ring-line-strong transition-colors hover:bg-blue-500/15 hover:text-blue-700 hover:ring-blue-500/30 dark:hover:text-blue-100"
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
