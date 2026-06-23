'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { AtSign, MessageSquare, Smile, Sparkles, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type {
  AddCommentResponse,
  ShareComment,
  ShareReaction,
} from '@/lib/share/types';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@captureflow/ui';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
});

type ActivityEntry =
  | {
      kind: 'reaction';
      id: string;
      createdAt: number;
      reaction: ShareReaction;
    }
  | {
      kind: 'comment';
      id: string;
      createdAt: number;
      comment: ShareComment;
    };

type Props = {
  slug: string;
  initialReactions: ShareReaction[];
  initialComments: ShareComment[];
  viewerSignedIn: boolean;
  viewerName: string | null;
  viewerUserId: string | null;
  viewerImageUrl: string | null;
  isOwner: boolean;
  liveReactions: ShareReaction[];
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
  const [comments, setComments] = useState<ShareComment[]>(initialComments);
  const [draft, setDraft] = useState('');
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
      const res = await fetch(`/api/r/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
    } catch (err) {
      setComments(snapshot);
      setError(err instanceof Error ? err.message : 'Could not delete comment');
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
      kind: 'reaction' as const,
      id: `r-${r.id}`,
      createdAt: r.createdAt,
      reaction: r,
    })),
    ...comments.map<ActivityEntry>((c) => ({
      kind: 'comment' as const,
      id: `c-${c.id}`,
      createdAt: c.createdAt,
      comment: c,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

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

  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (!viewerSignedIn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'c' && e.key !== 'C') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const el = composerRef.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
    const optimistic: ShareComment = {
      id: optimisticId,
      slug,
      userId: 'pending',
      userName: viewerName ?? 'You',
      userImage: viewerImageUrl,
      body,
      createdAt: Date.now(),
      timestampMs,
    };
    setComments((prev) => [...prev, optimistic]);
    setDraft('');

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/r/comments?slug=${encodeURIComponent(slug)}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ body, timestampMs }),
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as AddCommentResponse;
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticId ? json.comment : c))
        );
      } catch (err) {
        setComments((prev) => prev.filter((c) => c.id !== optimisticId));
        setError(err instanceof Error ? err.message : 'Could not post comment');
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <aside className="flex w-full flex-col bg-canvas-2 lg:h-full lg:border-l lg:border-line">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-canvas-2/90 px-5 py-4 backdrop-blur-md lg:static lg:bg-canvas-2 lg:backdrop-blur-none">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-100">
          Activity
        </h2>
        <span className="text-xs text-neutral-500">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </header>

      <div className="flex-1 px-5 py-4 lg:min-h-0 lg:overflow-y-auto">
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
                {entry.kind === 'reaction' ? (
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
          <Button type="button" onClick={onSignIn} size="lg" className="w-full">
            <Sparkles className="h-4 w-4" />
            Sign in to react &amp; comment
          </Button>
        ) : (
          <form
            onSubmit={submitComment}
            className="relative rounded-2xl border border-line bg-neutral-900 p-3 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
          >
            <div className="flex items-start gap-2.5">
              <Avatar className="mt-0.5 h-7 w-7">
                {viewerImageUrl ? (
                  <AvatarImage src={viewerImageUrl} alt="" />
                ) : null}
                <AvatarFallback
                  className="text-[11px]"
                  seed={viewerUserId ?? undefined}
                >
                  {initials(viewerName ?? 'You')}
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
                placeholder="Leave a comment…"
                rows={1}
                className="block min-h-[1.5rem] w-full resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="relative flex items-center gap-0.5 text-neutral-500">
                <ComposerIconButton
                  label="Mention someone"
                  onClick={() => {
                    setEmojiOpen(false);
                    setMentionOpen((v) => !v);
                  }}
                  active={mentionOpen}
                >
                  <AtSign className="h-4 w-4" />
                </ComposerIconButton>
                <span aria-hidden className="h-4 w-px bg-overlay-strong" />
                <ComposerIconButton
                  label="Insert emoji"
                  onClick={() => {
                    setMentionOpen(false);
                    setEmojiOpen((v) => !v);
                  }}
                  active={emojiOpen}
                >
                  <Smile className="h-4 w-4" />
                </ComposerIconButton>

                {mentionOpen && (
                  <MentionPopover
                    participants={participants}
                    onClose={() => setMentionOpen(false)}
                    onPick={(name) => {
                      insertAtCaret(`@${name} `);
                      setMentionOpen(false);
                    }}
                  />
                )}
                {emojiOpen && (
                  <EmojiPopover
                    onClose={() => setEmojiOpen(false)}
                    onPick={(emoji) => {
                      insertAtCaret(emoji);
                      setEmojiOpen(false);
                    }}
                  />
                )}
              </div>
              <button
                type="submit"
                disabled={posting || !draft.trim()}
                className={
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ' +
                  (draft.trim() && !posting
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/20 hover:bg-blue-500'
                    : 'text-fg-subtle hover:bg-overlay disabled:opacity-60')
                }
              >
                {posting
                  ? 'Posting…'
                  : `Comment at ${formatTimestamp(previewMs)}`}
              </button>
            </div>
          </form>
        )}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </aside>
  );
}

function ComposerIconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        'rounded-md p-1.5 transition-colors ' +
        (active
          ? 'bg-overlay text-neutral-100'
          : 'text-neutral-500 hover:bg-overlay hover:text-neutral-200')
      }
    >
      {children}
    </button>
  );
}

function MentionPopover({
  participants,
  onClose,
  onPick,
}: {
  participants: { userId: string; userName: string }[];
  onClose: () => void;
  onPick: (name: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-lg border border-line bg-neutral-900 shadow-xl shadow-black/40"
    >
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        Mention
      </p>
      {participants.length === 0 ? (
        <p className="px-3 pb-3 text-xs text-neutral-500">
          No one has reacted or commented yet.
        </p>
      ) : (
        <ul className="max-h-60 overflow-y-auto py-1">
          {participants.map((p) => (
            <li key={p.userId}>
              <button
                type="button"
                onClick={() => onPick(p.userName)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-200 transition-colors hover:bg-overlay"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]" seed={p.userId}>
                    {initials(p.userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{p.userName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmojiPopover({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Watches <html> data-theme since ThemeToggle mutates it imperatively.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? 'light'
      : 'dark';
  });
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute('data-theme');
      setTheme(attr === 'light' ? 'light' : 'dark');
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-20 mb-2 overflow-hidden rounded-lg border border-line shadow-xl shadow-black/40"
    >
      <EmojiPicker
        theme={theme as never}
        emojiStyle={'native' as never}
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
  const firstName = (viewerName ?? '').trim().split(/\s+/)[0] || null;
  const focusComposer = () => {
    const el = commentInputRef?.current;
    if (el) {
      el.focus();
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-overlay text-fg-muted ring-1 ring-line-strong">
        <MessageSquare className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-semibold text-fg">
        {viewerSignedIn
          ? firstName
            ? `Be the first to comment, ${firstName}`
            : 'Be the first to comment'
          : 'No activity yet'}
      </p>
      {viewerSignedIn ? (
        <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
          Hit{' '}
          <button
            type="button"
            onClick={focusComposer}
            className="inline-flex items-center rounded border border-line-strong bg-overlay px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg transition-colors hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-300"
            title="Focus the comment box"
          >
            C
          </button>{' '}
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
  reaction: ShareReaction;
  onSeek: (ms: number) => void;
}) {
  const name = reaction.userName?.trim() || 'Anonymous';
  return (
    <div className="flex items-start gap-2.5">
      <Avatar className="h-7 w-7">
        {reaction.userImage ? (
          <AvatarImage src={reaction.userImage} alt="" />
        ) : null}
        <AvatarFallback className="text-[11px]" seed={reaction.userId ?? name}>
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-200">
          <span className="font-medium text-neutral-100">{name}</span>{' '}
          <span className="text-neutral-500">reacted</span>{' '}
          <span className="align-middle text-base">{reaction.emoji}</span>{' '}
          <span className="text-neutral-500">at</span>{' '}
          <TimestampChip
            ms={reaction.timestampMs}
            onClick={() => onSeek(reaction.timestampMs)}
          />
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
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
  comment: ShareComment;
  onSeek: (ms: number) => void;
  canDelete: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="group flex items-start gap-2.5">
      <Avatar className="h-7 w-7">
        {comment.userImage ? (
          <AvatarImage src={comment.userImage} alt="" />
        ) : null}
        <AvatarFallback
          className="text-[11px]"
          seed={comment.userId ?? comment.userName}
        >
          {initials(comment.userName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-neutral-100">
            {comment.userName}
          </span>
          {comment.timestampMs != null && (
            <TimestampChip
              ms={comment.timestampMs}
              onClick={() => onSeek(comment.timestampMs!)}
            />
          )}
          <span className="text-[11px] text-neutral-500">
            {formatRelative(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-neutral-200">
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
      className="rounded bg-overlay px-1.5 py-0.5 font-mono text-[11px] text-fg ring-1 ring-line-strong transition-colors hover:bg-blue-500/15 hover:text-blue-700 hover:ring-blue-500/30 dark:hover:text-blue-100"
    >
      {formatTimestamp(ms)}
    </button>
  );
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function mergeReactions(
  base: ShareReaction[],
  live: ShareReaction[]
): ShareReaction[] {
  if (live.length === 0) return base;
  const seen = new Set(base.map((r) => r.id));
  const extras = live.filter((r) => !seen.has(r.id));
  return extras.length ? [...base, ...extras] : base;
}

function formatTimestamp(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return 'just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}
