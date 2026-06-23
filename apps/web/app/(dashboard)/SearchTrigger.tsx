'use client';

import { useEffect, useState } from 'react';
import { Camera, Search, Video, X } from 'lucide-react';
import {
  SmoothDialog,
  SmoothDialogClose,
  SmoothDialogContent,
  SmoothDialogTitle,
} from '@captureflow/ui';
import type { SearchHit } from '@/app/api/search/route';

// Cmd-K search. The trigger renders as a wide pill in the topbar;
// clicking (or pressing ⌘K / Ctrl-K) opens a dialog that queries
// /api/search as the user types.

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  // Global cmd/ctrl-K opens the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounced fetch: fires 180ms after the last keystroke, only for
  // queries of 2+ chars. AbortController cancels inflight calls so a
  // fast typer's stale requests can't clobber the latest results.
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ctrl.signal }
        );
        const data = (await res.json()) as { hits: SearchHit[] };
        setResults(data.hits ?? []);
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  // Reset state on close so the next open is a fresh search.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-xl items-center gap-2.5 rounded-md border border-line bg-neutral-900/80 px-3 text-left text-sm text-neutral-500 transition-colors hover:border-line-strong hover:bg-neutral-900 sm:flex"
      >
        <Search className="h-4 w-4 text-neutral-500" />
        <span className="min-w-0 flex-1 truncate">
          Search your shares and snaps
        </span>
        <span className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-line-strong bg-neutral-950 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 md:inline-flex">
          ⌘K
        </span>
      </button>
      <SmoothDialog open={open} onOpenChange={setOpen}>
        <SmoothDialogContent className="sm:max-w-2xl" hideClose>
          <SmoothDialogTitle className="sr-only">Search</SmoothDialogTitle>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-line-strong bg-canvas-2 px-3 py-2.5 focus-within:border-accent-ring focus-within:ring-1 focus-within:ring-accent-ring">
              <Search className="h-4 w-4 shrink-0 text-fg-muted" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your shares and snaps"
                className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
              />
            </div>
            <SmoothDialogClose
              aria-label="Close"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-overlay text-fg-muted transition-colors hover:bg-overlay-strong hover:text-fg-strong focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-ring"
            >
              <X className="h-5 w-5" />
            </SmoothDialogClose>
          </div>
          {results.length === 0 && !loading ? (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 pb-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/30">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-neutral-100">
                {query.trim().length < 2
                  ? 'What do you want to find?'
                  : 'No matches'}
              </p>
              <p className="max-w-sm text-sm text-neutral-500">
                Search your screen recordings and screenshots by title.
              </p>
            </div>
          ) : (
            <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto pb-2">
              {results.map((hit) => (
                <li key={`${hit.kind}-${hit.id}`}>
                  <a
                    href={hit.href}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-overlay"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-overlay text-neutral-400">
                      {hit.kind === 'share' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-neutral-100">
                      {hit.title}
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-neutral-500">
                      {hit.kind}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SmoothDialogContent>
      </SmoothDialog>
    </>
  );
}
