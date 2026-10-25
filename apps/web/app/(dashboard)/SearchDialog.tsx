"use client";

import { useEffect, useState } from "react";
import { Camera, Video } from "lucide-react";
import {
  Chip,
  EmptyState,
  ListBox,
  Modal,
  SearchField,
  Spinner,
} from "@heroui/react";
import type { SearchHit } from "@/app/api/search/route";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

// The ⌘K dialog, loaded on first open.
export function SearchDialog({ isOpen, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [isOpen]);

  const trimmed = query.trim();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog data-split="search-dialog">
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
  );
}
