export const ACCESS_FILTERS = [
  "all",
  "public",
  "workspace",
  "private",
] as const;
export type AccessFilter = (typeof ACCESS_FILTERS)[number];

export const SORT_ORDERS = ["newest", "oldest", "views"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export type ListFilters = { access: AccessFilter; sort: SortOrder };

export const DEFAULT_LIST_FILTERS: ListFilters = {
  access: "all",
  sort: "newest",
};

export const ACCESS_LABELS: Record<AccessFilter, string> = {
  all: "Any access",
  public: "Public",
  workspace: "Workspace",
  private: "Private",
};

export const SORT_LABELS: Record<SortOrder, string> = {
  newest: "Newest to oldest",
  oldest: "Oldest to newest",
  views: "Most viewed",
};

// The filters from the URL: anything unrecognised is the default, so a stale
// or hand-edited link still lists something.
export function hydrateListFilters(raw: {
  access?: unknown;
  sort?: unknown;
}): ListFilters {
  return {
    access: pick(ACCESS_FILTERS, raw.access, DEFAULT_LIST_FILTERS.access),
    sort: pick(SORT_ORDERS, raw.sort, DEFAULT_LIST_FILTERS.sort),
  };
}

function pick<T extends string>(
  allowed: readonly T[],
  raw: unknown,
  fallback: T,
): T {
  return typeof raw === "string" && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}

export function isFiltered(filters: ListFilters): boolean {
  return (
    filters.access !== DEFAULT_LIST_FILTERS.access ||
    filters.sort !== DEFAULT_LIST_FILTERS.sort
  );
}

// The visibility a query matches, or the empty string for any; bound as a
// parameter so the SQL itself never changes with the filter.
export function accessParam(access: AccessFilter): string {
  return access === "all" ? "" : access;
}

const ORDER_BY: Record<SortOrder, string> = {
  newest: "created_at DESC",
  oldest: "created_at ASC",
  views: "view_count DESC, created_at DESC",
};

// Only ever one of these fixed strings, so it can go into the SQL text.
export function orderBySql(sort: SortOrder): string {
  return ORDER_BY[sort];
}
