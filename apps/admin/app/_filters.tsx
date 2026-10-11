"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListBox, Pagination, SearchField, Select, Tabs } from "@heroui/react";

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
        <SearchField
          aria-label="Search"
          value={query}
          onChange={setQuery}
          className="min-w-64 flex-1"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={search.placeholder} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      )}
      {selects.map((s) => (
        <Select
          key={s.param}
          aria-label={s.label}
          selectedKey={s.value}
          onSelectionChange={(key) => update({ [s.param]: String(key) })}
          className="w-52"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {s.options.map((o) => (
                <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
                  {o.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
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
    <Tabs selectedKey={selected} className="w-fit">
      <Tabs.ListContainer className="bg-transparent">
        <Tabs.List aria-label={label} className="gap-1 bg-transparent p-0">
          {items.map((item) => (
            <Tabs.Tab
              key={item.id}
              id={item.id}
              href={item.href}
              className="rounded-lg px-3.5 whitespace-nowrap"
            >
              {item.label}
              <Tabs.Indicator className="bg-tint-strong rounded-lg shadow-none" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
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
    <Tabs className="flex flex-col gap-5">
      <Tabs.ListContainer className="w-fit bg-transparent">
        <Tabs.List aria-label={label} className="gap-1 bg-transparent p-0">
          {items.map((item) => (
            <Tabs.Tab
              key={item.id}
              id={item.id}
              className="rounded-lg px-3.5 whitespace-nowrap"
            >
              {item.label}
              <Tabs.Indicator className="bg-tint-strong rounded-lg shadow-none" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {items.map((item) => (
        <Tabs.Panel key={item.id} id={item.id} className="p-0">
          {item.content}
        </Tabs.Panel>
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
        <Pagination size="sm">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={current <= 1}
                onPress={() => go(current - 1)}
              >
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <span className="px-2 tabular-nums">
                {current} / {pages}
              </span>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next
                isDisabled={current >= pages}
                onPress={() => go(current + 1)}
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}
