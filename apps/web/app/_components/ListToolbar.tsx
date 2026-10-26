"use client";

import { Checkbox, Dropdown, Label, buttonVariants } from "@heroui/react";
import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACCESS_FILTERS,
  ACCESS_LABELS,
  DEFAULT_LIST_FILTERS,
  SORT_LABELS,
  SORT_ORDERS,
  type ListFilters,
} from "@/lib/list-filters";
import { cn } from "@/lib/utils";

type SelectAll = {
  selected: number;
  total: number;
  onChange: (next: boolean) => void;
};

type Props = {
  noun: string;
  filters: ListFilters;
  // Absent when the viewer can manage nothing on the page.
  selectAll?: SelectAll;
};

// The row above a media grid: select-all on the left, the access filter and
// the sort on the right. Filters live in the URL so they survive reloads and
// pagination; changing one starts again from the first page.
export function ListToolbar({ noun, filters, selectAll }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (key: keyof ListFilters, value: string): void => {
    const params = new URLSearchParams(searchParams);
    if (value === DEFAULT_LIST_FILTERS[key]) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {selectAll && selectAll.total > 0 ? (
        <Checkbox
          isSelected={selectAll.selected === selectAll.total}
          isIndeterminate={
            selectAll.selected > 0 && selectAll.selected < selectAll.total
          }
          onChange={selectAll.onChange}
        >
          <Checkbox.Content>
            <Checkbox.Control className="size-[18px] border-black/[0.3] dark:border-white/[0.35]">
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label className="text-sm font-normal text-fg">
              Select all {noun}s
            </Label>
          </Checkbox.Content>
        </Checkbox>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <FilterMenu
          label="Access"
          value={filters.access}
          options={ACCESS_FILTERS}
          labels={ACCESS_LABELS}
          onPick={(value) => setFilter("access", value)}
        />
        <FilterMenu
          label="Sort"
          value={filters.sort}
          options={SORT_ORDERS}
          labels={SORT_LABELS}
          onPick={(value) => setFilter("sort", value)}
        />
      </div>
    </div>
  );
}

function FilterMenu<T extends string>({
  label,
  value,
  options,
  labels,
  onPick,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onPick: (value: T) => void;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`${label}: ${labels[value]}`}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "gap-1.5",
        )}
      >
        {labels[value]}
        <ChevronDown size={14} className="text-fg-muted" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-48">
        <Dropdown.Menu
          aria-label={label}
          onAction={(key) => onPick(String(key) as T)}
        >
          {options.map((option) => (
            <Dropdown.Item key={option} id={option} textValue={labels[option]}>
              <span className="flex-1">{labels[option]}</span>
              {option === value ? (
                <Check size={14} className="text-accent" />
              ) : null}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
