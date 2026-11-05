"use client";

import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fmt } from "@/lib/i18n/format";
import {
  ACCESS_FILTERS,
  DEFAULT_LIST_FILTERS,
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
  noun: "recording" | "screenshot";
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
  const selectAllId = useId();
  const m = useAppMessages();
  const copy = m.library.filters;

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
        <div className="flex items-center gap-2">
          <Checkbox
            id={selectAllId}
            className="size-[18px]"
            checked={
              selectAll.selected === selectAll.total
                ? true
                : selectAll.selected > 0
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(next) => selectAll.onChange(next === true)}
          />
          <Label htmlFor={selectAllId} className="text-sm font-normal text-fg">
            {m.library[noun].selectAll}
          </Label>
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <FilterMenu
          label={copy.access}
          value={filters.access}
          options={ACCESS_FILTERS}
          labels={copy.accessOptions}
          onPick={(value) => setFilter("access", value)}
        />
        <FilterMenu
          label={copy.sort}
          value={filters.sort}
          options={SORT_ORDERS}
          labels={copy.sortOptions}
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
  const copy = useAppMessages().library.filters;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={fmt(copy.current, { label, value: labels[value] })}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "gap-1.5 text-fg",
        )}
      >
        {labels[value]}
        <ChevronDown size={14} className="text-fg-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        aria-label={label}
        className="w-auto min-w-48"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            textValue={labels[option]}
            onSelect={() => onPick(option)}
          >
            <span className="flex-1">{labels[option]}</span>
            {option === value ? <Check size={14} className="text-fg" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
