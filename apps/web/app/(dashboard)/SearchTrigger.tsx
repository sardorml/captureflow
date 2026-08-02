"use client";

import { useEffect, useState } from "react";
import { Camera, Search, Video } from "lucide-react";
import {
  Chip,
  EmptyState,
  Kbd,
  ListBox,
  Modal,
  SearchField,
  Spinner,
} from "@heroui/react";
import type { SearchHit } from "@/app/api/search/route";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          {
            signal: ctrl.signal,
          },
        );
        const data = (await res.json()) as { hits: SearchHit[] };
        setResults(data.hits ?? []);
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
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

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  const trimmed = query.trim();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xl cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-panel px-3 text-sm text-fg-subtle transition-colors hover:bg-tint"
      >
        <Search size={16} />
        <span className="flex-1 text-left">
          Search your recordings and screenshots
        </span>
        <Kbd>⌘K</Kbd>
      </button>

      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Search</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <SearchField
                  autoFocus
                  value={query}
                  onChange={setQuery}
                  aria-label="Search your recordings and screenshots"
                  fullWidth
                >
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search your recordings and screenshots" />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>

                <div className="mt-4 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-6 text-center">
                      <Spinner />
                    </div>
                  ) : results.length === 0 ? (
                    <EmptyState className="py-6 text-center text-sm text-fg-muted">
                      {trimmed.length < 2
                        ? "Search your recordings and screenshots by title."
                        : "No matches"}
                    </EmptyState>
                  ) : (
                    <ListBox aria-label="Search results">
                      {results.map((hit) => (
                        <ListBox.Item
                          key={hit.href}
                          id={hit.href}
                          href={hit.href}
                          textValue={hit.title}
                        >
                          {hit.kind === "recording" ? (
                            <Video size={16} />
                          ) : (
                            <Camera size={16} />
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {hit.title}
                          </span>
                          <Chip size="sm">{hit.kind}</Chip>
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  )}
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
