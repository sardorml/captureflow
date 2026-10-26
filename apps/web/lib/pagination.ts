// Six rows of the widest dashboard grid.
export const PAGE_SIZE = 24;

export type PageItem = number | "gap";

// A page number from the URL: anything that is not a positive integer is
// the first page, and anything past the end is the last.
export function hydratePageNumber(raw: unknown, total: number): number {
  const n =
    typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
  const last = pageCount(total);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, last);
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function pageOffset(page: number): number {
  return (page - 1) * PAGE_SIZE;
}

/*
 * The pager's items: the first and last page, the current one with a
 * neighbour on each side, and a gap wherever pages are skipped. Seven pages
 * or fewer show in full.
 */
export function pageItems(page: number, count: number): PageItem[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const shown = new Set([1, count, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => shown.add(p));
  if (page >= count - 2)
    [count - 3, count - 2, count - 1].forEach((p) => shown.add(p));
  const pages = [...shown]
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];
  for (const [i, p] of pages.entries()) {
    if (i > 0 && p - pages[i - 1]! > 1) items.push("gap");
    items.push(p);
  }
  return items;
}
