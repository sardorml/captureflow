"use client";

import { Pagination } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pageItems } from "@/lib/pagination";

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

  const go = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Pagination aria-label="Pages" className="mt-8 flex justify-center">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            aria-label="Previous page"
            isDisabled={page <= 1}
            onPress={() => go(page - 1)}
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>
        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <Pagination.Item key={`gap-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === page}
                aria-current={item === page ? "page" : undefined}
                onPress={() => go(item)}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next
            aria-label="Next page"
            isDisabled={page >= pageCount}
            onPress={() => go(page + 1)}
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
