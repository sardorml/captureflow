import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type PostHogConfig,
  breakdownQuery,
  getWebAnalytics,
  hogString,
  isWebRange,
  overviewQuery,
  postHogConfig,
} from "./web-analytics";

const CONFIG: PostHogConfig = {
  apiHost: "https://us.posthog.com/",
  projectId: "42",
  apiKey: "phx_test",
  siteHost: "captureflow.dev",
};

afterEach(() => vi.unstubAllGlobals());

describe("hogString", () => {
  it("quotes and escapes", () => {
    expect(hogString("it's a\\b")).toBe("'it\\'s a\\\\b'");
  });
});

describe("isWebRange", () => {
  it("accepts only known ranges", () => {
    expect(isWebRange("7d")).toBe(true);
    expect(isWebRange("1y")).toBe(false);
    expect(isWebRange(undefined)).toBe(false);
  });
});

describe("queries", () => {
  it("scope to the site's pageviews over the range", () => {
    const sql = overviewQuery(CONFIG, "7d");
    expect(sql).toContain("properties.$host = 'captureflow.dev'");
    expect(sql).toContain("INTERVAL 14 DAY");
    expect(sql).toContain("event = '$pageview'");
    expect(breakdownQuery(CONFIG, "24h", "properties.$browser")).toContain(
      "INTERVAL 24 HOUR",
    );
  });
});

describe("getWebAnalytics", () => {
  it("runs every query with the key and maps the rows", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    let running = 0;
    let peak = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        running += 1;
        peak = Math.max(peak, running);
        await new Promise((r) => setTimeout(r, 1));
        running -= 1;
        const { name } = JSON.parse(String(init.body)) as { name: string };
        const results =
          name === "admin_web_overview"
            ? [[58, 69, 121, 294, 68, 88]]
            : name === "admin_web_sessions"
              ? [[258, 250, 0.18, 0.14]]
              : name === "admin_web_series"
                ? [["2026-10-30T00:00:00Z", 5, 3]]
                : [
                    ["/pricing", 12, 20],
                    [null, 1, 1],
                  ];
        return new Response(JSON.stringify({ results }));
      }),
    );
    const data = await getWebAnalytics(CONFIG, "7d");
    expect(calls).toHaveLength(11);
    expect(peak).toBeLessThanOrEqual(3);
    expect(calls[0]!.url).toBe("https://us.posthog.com/api/projects/42/query/");
    expect(
      (calls[0]!.init.headers as Record<string, string>).authorization,
    ).toBe("Bearer phx_test");
    expect(data.overview.visitors).toEqual({ current: 58, previous: 69 });
    expect(data.overview.bounceRate).toEqual({ current: 0.18, previous: 0.14 });
    expect(data.series).toEqual([
      { at: Date.parse("2026-10-30T00:00:00Z"), current: 5, previous: 3 },
    ]);
    expect(data.pages).toEqual([
      { key: "/pricing", visitors: 12, views: 20 },
      { key: "(none)", visitors: 1, views: 1 },
    ]);
  });

  it("surfaces PostHog errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("bad key", { status: 401 })),
    );
    await expect(getWebAnalytics(CONFIG, "24h")).rejects.toThrow(/401 bad key/);
  });
});

describe("postHogConfig", () => {
  const env = {
    APP_BASE_URL: "https://captureflow.dev",
    POSTHOG_API_HOST: "https://us.posthog.com",
    POSTHOG_PROJECT_ID: "42",
    POSTHOG_PERSONAL_API_KEY: "phx_test",
  };

  it("reads the hosted config and scopes to the app's host", () => {
    expect(postHogConfig(env)).toEqual({
      apiHost: "https://us.posthog.com",
      projectId: "42",
      apiKey: "phx_test",
      siteHost: "captureflow.dev",
    });
  });

  it("is off for self-hosted instances even when configured", () => {
    expect(postHogConfig({ ...env, SELF_HOSTED: "true" })).toBeNull();
  });

  it("is off when any part is missing", () => {
    expect(postHogConfig({ ...env, POSTHOG_PERSONAL_API_KEY: "" })).toBeNull();
    expect(postHogConfig({ ...env, APP_BASE_URL: undefined })).toBeNull();
  });
});
