"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { pageItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PagerProps = {
  page: number;
  pageCount: number;
};

// Page numbers live in the URL (?page=N), so a page survives reloads and
// the back button; the first page carries no parameter.
export function Pager({ page, pageCount }: PagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pageCount <= 1) return null;

  const hrefFor = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const linkTo = (next: number, disabled = false) => ({
    href: disabled ? undefined : hrefFor(next),
    "aria-disabled": disabled || undefined,
    className: cn(disabled && "pointer-events-none opacity-50"),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (!disabled) router.push(hrefFor(next));
    },
  });

  return (
    <Pagination aria-label="Pages" className="mt-8 flex justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            aria-label="Previous page"
            {...linkTo(page - 1, page <= 1)}
          >
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>
        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink isActive={item === page} {...linkTo(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationLink
            aria-label="Next page"
            {...linkTo(page + 1, page >= pageCount)}
          >
            <ChevronRight />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
