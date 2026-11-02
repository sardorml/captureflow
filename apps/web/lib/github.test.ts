import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hydrateRepoActivity,
  loadRepoStats,
  refreshRepoStats,
  serveRepoStats,
  type RepoStatsStore,
} from "./github";
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

const NOW = Date.parse("2026-10-11T12:00:00Z");
const MINUTE = 60_000;
const STATS_KEY = "site/github-stats.json";

const activity = {
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

function stubStore(saved?: unknown) {
  const objects = new Map<string, string>();
  if (saved) objects.set(STATS_KEY, JSON.stringify(saved));
  const store = {
    get: async (key: string) => {
      const body = objects.get(key);
      return body ? { json: async () => JSON.parse(body) } : null;
    },
    put: async (key: string, body: string) => void objects.set(key, body),
  } as unknown as RepoStatsStore;
  const read = () => JSON.parse(objects.get(STATS_KEY) ?? "null");
  return { store, read };
}

function stubGitHub(stars: number | "fail", issues: unknown[] | "fail" = []) {
  const fetchMock = vi.fn(async (url: string) => {
    const body = url.includes("/issues") ? issues : { stargazers_count: stars };
    return stars === "fail" && !url.includes("/issues")
      ? new Response("{}", { status: 403 })
      : issues === "fail" && url.includes("/issues")
        ? new Response("{}", { status: 403 })
        : Response.json(body);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loadRepoStats", () => {
  it("serves a fresh saved copy without calling GitHub", async () => {
    const { store } = stubStore({
      stars: 61,
      activity,
      fetchedAt: NOW - MINUTE,
    });
    const fetchMock = stubGitHub(99);
    const defer = vi.fn();

    expect(await loadRepoStats(store, undefined, defer, NOW)).toEqual({
      stars: "61",
      activity,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(defer).not.toHaveBeenCalled();
  });

  it("answers from a stale copy and refreshes it in the background", async () => {
    const { store, read } = stubStore({
      stars: 61,
      activity,
      fetchedAt: NOW - 60 * MINUTE,
    });
    stubGitHub(62);
    const work: Promise<unknown>[] = [];

    const stats = await loadRepoStats(
      store,
      undefined,
      (p) => work.push(p),
      NOW,
    );
    expect(stats.stars).toBe("61");

    await Promise.all(work);
    expect(read()).toMatchObject({ stars: 62, fetchedAt: NOW });
  });

  it("waits for GitHub only when nothing is saved yet", async () => {
    const { store, read } = stubStore();
    stubGitHub(61);

    const stats = await loadRepoStats(store, undefined, vi.fn(), NOW);
    expect(stats.stars).toBe("61");
    expect(read()).toMatchObject({ stars: 61, fetchedAt: NOW });
  });

  it("shows no count, not a made-up one, when GitHub never answered", async () => {
    const { store } = stubStore();
    stubGitHub("fail", "fail");

    expect(await loadRepoStats(store, undefined, vi.fn(), NOW)).toEqual({
      stars: null,
      activity: null,
    });
  });
});

describe("refreshRepoStats", () => {
  const saved = { stars: 61, activity, fetchedAt: NOW - 60 * MINUTE };

  it("keeps the saved copy when GitHub rate-limits", async () => {
    const { store, read } = stubStore(saved);
    stubGitHub("fail", "fail");

    await refreshRepoStats(store, undefined, NOW);
    expect(read()).toEqual(saved);
  });

  it("keeps the last count when only the stars call fails", async () => {
    const { store, read } = stubStore(saved);
    stubGitHub("fail", []);

    await refreshRepoStats(store, undefined, NOW);
    expect(read()).toEqual({
      stars: 61,
      activity: { shipped: [], open: [] },
      fetchedAt: NOW,
    });
  });

  it("retries without a token GitHub rejects", async () => {
    const { store, read } = stubStore();
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      const headers = init.headers as Record<string, string>;
      if (headers.Authorization) return new Response("{}", { status: 401 });
      return url.includes("/issues")
        ? Response.json([])
        : Response.json({ stargazers_count: 61 });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await refreshRepoStats(store, "revoked", NOW);
    expect(read()).toMatchObject({ stars: 61 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("sends the token when there is one", async () => {
    const { store } = stubStore();
    const fetchMock = stubGitHub(61);

    await refreshRepoStats(store, "secret", NOW);
    const init = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init[1].headers).toMatchObject({ Authorization: "Bearer secret" });
  });
});

describe("serveRepoStats", () => {
  const request = new Request("https://captureflow.dev/api/github");

  function stubEdgeCache() {
    const entries = new Map<string, Response>();
    vi.stubGlobal("caches", {
      default: {
        match: async (key: string) => entries.get(key)?.clone(),
        put: async (key: string, res: Response) => void entries.set(key, res),
      },
    });
    return entries;
  }

  it("answers a repeat visit from the edge without reading the store", async () => {
    const entries = stubEdgeCache();
    const { store } = stubStore({
      stars: 61,
      activity,
      fetchedAt: Date.now(),
    });
    const work: Promise<unknown>[] = [];

    const first = await serveRepoStats(request, store, undefined, (p) =>
      work.push(p),
    );
    expect(await first.json()).toMatchObject({ stars: "61" });
    await Promise.all(work);
    expect(entries.has("https://captureflow.dev/api/github")).toBe(true);

    const getSpy = vi.spyOn(store, "get");
    const second = await serveRepoStats(request, store, undefined, vi.fn());
    expect(await second.json()).toMatchObject({ stars: "61" });
    expect(getSpy).not.toHaveBeenCalled();
    expect(second.headers.get("cache-control")).toBe("public, max-age=60");
  });

  it("doesn't hold an empty answer at the edge", async () => {
    const entries = stubEdgeCache();
    const { store } = stubStore();
    stubGitHub("fail", "fail");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const work: Promise<unknown>[] = [];

    const response = await serveRepoStats(request, store, undefined, (p) =>
      work.push(p),
    );
    await Promise.all(work);
    expect(await response.json()).toEqual({ stars: null, activity: null });
    expect(entries.size).toBe(0);
  });
});
