import { describe, expect, it } from "vitest";
import {
  describeUserAgent,
  mergeTimeline,
  type AdminTimelineEvent,
} from "./timeline";

const CHROME_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const EDGE_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0";

describe("describeUserAgent", () => {
  it("names the browser and the system", () => {
    expect(describeUserAgent(CHROME_MAC)).toBe("Chrome on macOS");
    expect(describeUserAgent(SAFARI_IPHONE)).toBe("Safari on iOS");
    expect(describeUserAgent(EDGE_WINDOWS)).toBe("Edge on Windows");
  });

  it("gives what it can for a bare or unknown string", () => {
    expect(describeUserAgent("curl/8.4")).toBeNull();
    expect(describeUserAgent("Firefox/130.0")).toBe("Firefox");
    expect(describeUserAgent(null)).toBeNull();
  });
});

describe("mergeTimeline", () => {
  const event = (key: string, at: number): AdminTimelineEvent => ({
    key,
    kind: "signin",
    at,
    text: "signed in",
  });

  it("orders every source together, newest first, within the limit", () => {
    const merged = mergeTimeline(
      [[event("a", 30), event("b", 10)], [event("c", 20)], [event("d", 40)]],
      3,
    );
    expect(merged.map((e) => e.key)).toEqual(["d", "a", "c"]);
  });

  it("is empty when nothing happened", () => {
    expect(mergeTimeline([[], []])).toEqual([]);
  });
});
