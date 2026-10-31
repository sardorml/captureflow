"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Option = { id: string; label: string };

// Filters live in the URL, so a filtered view can be shared and reloaded.
function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };
}

export function FilterBar({
  search,
  selects = [],
}: {
  search?: { placeholder: string; value: string };
  selects?: {
    param: string;
    label: string;
    value: string;
    options: Option[];
  }[];
}) {
  const update = useQueryUpdater();
  const [query, setQuery] = useState(search?.value ?? "");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => update({ q: query.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <InputGroup className="min-w-64 flex-1">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Search"
            placeholder={search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      )}
      {selects.map((s) => (
        <Select
          key={s.param}
          value={s.value}
          onValueChange={(value) => update({ [s.param]: value })}
        >
          <SelectTrigger aria-label={s.label} className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {s.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

export function LinkTabs({
  label,
  selected,
  items,
}: {
  label: string;
  selected: string;
  items: { id: string; label: string; href: string }[];
}) {
  return (
    <nav aria-label={label} className="flex w-fit gap-1">
      {items.map((item) => (
        <NextLink
          key={item.id}
          href={item.href}
          aria-current={item.id === selected ? "page" : undefined}
          className={cn(
            "text-muted-foreground hover:text-foreground rounded-lg px-3.5 py-1 text-sm font-medium whitespace-nowrap transition-colors",
            item.id === selected && "bg-tint-strong text-foreground",
          )}
        >
          {item.label}
        </NextLink>
      ))}
    </nav>
  );
}

export function PanelTabs({
  label,
  items,
}: {
  label: string;
  items: { id: string; label: string; content: ReactNode }[];
}) {
  return (
    <Tabs defaultValue={items[0]?.id} className="flex flex-col gap-5">
      <TabsList aria-label={label} className="gap-1 bg-transparent p-0">
        {items.map((item) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className="data-active:bg-tint-strong rounded-lg px-3.5 whitespace-nowrap data-active:shadow-none"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.id} value={item.id}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function Pager({
  page,
  total,
  pageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
}) {
  const update = useQueryUpdater();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const go = (p: number) => update({ page: p === 1 ? null : String(p) });
  return (
    <div className="text-fg-muted flex items-center justify-between gap-4 text-sm">
      <span className="tabular-nums">
        {total.toLocaleString()} {total === 1 ? "result" : "results"}
      </span>
      {pages > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous page"
                disabled={current <= 1}
                onClick={() => go(current - 1)}
              >
                <ChevronLeft />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 tabular-nums">
                {current} / {pages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next page"
                disabled={current >= pages}
                onClick={() => go(current + 1)}
              >
                <ChevronRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
