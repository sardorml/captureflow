import { describe, expect, it } from "vitest";
import {
  accessParam,
  hydrateListFilters,
  isFiltered,
  orderBySql,
} from "./list-filters";

describe("hydrateListFilters", () => {
  it("defaults when nothing or nonsense is given", () => {
    expect(hydrateListFilters({})).toEqual({ access: "all", sort: "newest" });
    expect(hydrateListFilters({ access: "friends", sort: 3 })).toEqual({
      access: "all",
      sort: "newest",
    });
    expect(
      hydrateListFilters({ access: ["public"], sort: ["oldest"] }),
    ).toEqual({ access: "all", sort: "newest" });
  });

  it("keeps known values", () => {
    expect(hydrateListFilters({ access: "private", sort: "views" })).toEqual({
      access: "private",
      sort: "views",
    });
  });
});

describe("isFiltered", () => {
  it("is false only for the defaults", () => {
    expect(isFiltered({ access: "all", sort: "newest" })).toBe(false);
    expect(isFiltered({ access: "public", sort: "newest" })).toBe(true);
    expect(isFiltered({ access: "all", sort: "oldest" })).toBe(true);
  });
});

describe("sql pieces", () => {
  it("binds any access as the empty string", () => {
    expect(accessParam("all")).toBe("");
    expect(accessParam("workspace")).toBe("workspace");
  });

  it("orders by a fixed clause per sort", () => {
    expect(orderBySql("newest")).toBe("created_at DESC");
    expect(orderBySql("oldest")).toBe("created_at ASC");
    expect(orderBySql("views")).toMatch(/^view_count DESC/);
  });
});
