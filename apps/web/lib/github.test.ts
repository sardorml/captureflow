import { afterEach, describe, expect, it, vi } from "vitest";
import { getRepoActivity, hydrateRepoActivity } from "./github";
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
      [5, "pr"],
    ]);
    expect(activity.shipped.map((i) => [i.number, i.kind])).toEqual([
      [2, "pr"],
    ]);
  });

  it("lists open and draft pull requests with open issues", () => {
    const activity = hydrateRepoActivity([
      issue(1),
      issue(2, { pull_request: { merged_at: null } }),
      issue(3, { draft: true, pull_request: { merged_at: null } }),
      issue(4, {
        draft: true,
        state: "closed",
        pull_request: { merged_at: null },
      }),
    ]);

    expect(activity.open.map((i) => [i.number, i.kind, i.state])).toEqual([
      [1, "issue", "open"],
      [2, "pr", "open"],
      [3, "pr", "draft"],
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

describe("getRepoActivity", () => {
  const NOW = Date.parse("2026-10-11T12:00:00Z");
  const merged = issue(7, {
    state: "closed",
    pull_request: { merged_at: "2026-10-10T00:00:00Z" },
  });
  const cachedActivity = {
    shipped: [
      {
        kind: "pr",
        number: 3,
        title: "Old",
        url: `${SOURCE_REPO_URL}/pull/3`,
        state: "merged",
        date: "2026-10-01T00:00:00Z",
      },
    ],
    open: [],
  };

  function stubCache(entry: unknown) {
    const store = new Map<string, Response>();
    if (entry) {
      store.set(
        "https://captureflow.dev/__cache/github-activity",
        new Response(JSON.stringify(entry)),
      );
    }
    vi.stubGlobal("caches", {
      default: {
        match: async (key: string) => store.get(key)?.clone(),
        put: async (key: string, res: Response) => void store.set(key, res),
      },
    });
    return store;
  }

  afterEach(() => vi.unstubAllGlobals());

  it("serves a fresh cache entry without calling GitHub", async () => {
    stubCache({ activity: cachedActivity, fetchedAt: NOW - 60_000 });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getRepoActivity(NOW)).toEqual(cachedActivity);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to a stale entry when GitHub rate-limits", async () => {
    stubCache({ activity: cachedActivity, fetchedAt: NOW - 3600_000 });
    vi.stubGlobal("fetch", async () => new Response("{}", { status: 403 }));

    expect(await getRepoActivity(NOW)).toEqual(cachedActivity);
  });

  it("refreshes a stale entry when GitHub answers", async () => {
    const store = stubCache({
      activity: cachedActivity,
      fetchedAt: NOW - 3600_000,
    });
    vi.stubGlobal("fetch", async () => Response.json([merged]));

    const activity = await getRepoActivity(NOW);
    expect(activity?.shipped.map((i) => i.number)).toEqual([7]);
    const saved = await store
      .get("https://captureflow.dev/__cache/github-activity")
      ?.json();
    expect(saved).toEqual({ activity, fetchedAt: NOW });
  });

  it("returns null with no cache and a failed call", async () => {
    stubCache(null);
    vi.stubGlobal("fetch", async () => new Response("{}", { status: 403 }));

    expect(await getRepoActivity(NOW)).toBeNull();
  });
});
