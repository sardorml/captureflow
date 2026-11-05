"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { Camera, Search, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useAppMessages } from "@/components/app-i18n-provider";
import type { SearchHit } from "@/lib/library-search";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

// The ⌘K dialog, loaded once the page is idle.
export function SearchDialog({ isOpen, onOpenChange }: Props) {
  const m = useAppMessages();
  const copy = m.shell.search;
  const router = useRouter();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-split="search-dialog"
        aria-describedby={undefined}
        showCloseButton={false}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>{m.common.search}</DialogTitle>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="overflow-visible rounded-none! bg-transparent p-0"
        >
          <InputGroup className="h-9 has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <CommandPrimitive.Input
              data-slot="input-group-control"
              autoFocus
              value={query}
              onValueChange={setQuery}
              aria-label={copy.prompt}
              placeholder={copy.prompt}
              className="h-full flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={copy.clear}
                  onClick={() => setQuery("")}
                >
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <CommandList aria-label={copy.results} className="mt-4 max-h-96">
            {loading ? (
              <div className="p-6 text-center">
                <Spinner className="inline-block size-5" />
              </div>
            ) : (
              <>
                <CommandEmpty className="text-fg-muted">
                  {trimmed.length < 2 ? copy.hint : copy.noMatches}
                </CommandEmpty>
                {results.map((hit) => (
                  <CommandItem
                    key={hit.href}
                    value={hit.href}
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(hit.href);
                    }}
                    className="gap-2.5"
                  >
                    {hit.kind === "recording" ? (
                      <Video size={16} />
                    ) : (
                      <Camera size={16} />
                    )}
                    <span className="min-w-0 flex-1 truncate">{hit.title}</span>
                    <Badge variant="secondary">{copy.kind[hit.kind]}</Badge>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
