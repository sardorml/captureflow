import { describe, expect, it } from "vitest";
import { hydrateRepoActivity } from "./github";
import { SOURCE_REPO_URL } from "./site";

const issue = (n: number, extra: Record<string, unknown> = {}) => ({
  number: n,
  title: `Item ${n}`,
  html_url: `${SOURCE_REPO_URL}/issues/${n}`,
  state: "open",
  updated_at: "2026-10-01T00:00:00Z",
  ...extra,
});

describe("hydrateRepoActivity", () => {
  it("splits merged pull requests from open issues", () => {
    const activity = hydrateRepoActivity([
      issue(1),
      issue(2, {
        state: "closed",
        pull_request: { merged_at: "2026-10-02T00:00:00Z" },
      }),
      issue(3, { state: "closed", pull_request: { merged_at: null } }),
      issue(4, { state: "closed" }),
      issue(5, { pull_request: { merged_at: null } }),
    ]);

    expect(activity.open.map((i) => [i.number, i.kind])).toEqual([
      [1, "issue"],
    ]);
    expect(activity.shipped.map((i) => [i.number, i.kind])).toEqual([
      [2, "pr"],
    ]);
  });

  it("drops malformed items and links outside the repo", () => {
    const activity = hydrateRepoActivity([
      { number: "5", title: "x" },
      issue(6, { html_url: "https://evil.example/issues/6" }),
      null,
    ]);

    expect(activity).toEqual({ shipped: [], open: [] });
  });

  it("returns empty lists for a non-array response", () => {
    expect(hydrateRepoActivity({ message: "rate limited" })).toEqual({
      shipped: [],
      open: [],
    });
  });
});
