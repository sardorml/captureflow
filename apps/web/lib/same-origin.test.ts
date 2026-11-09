import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./same-origin";

describe("isSameOriginRequest", () => {
  const url = "https://captureflow.dev/api/extension/token";

  it("accepts the site's own origin", () => {
    expect(isSameOriginRequest("https://captureflow.dev", url)).toBe(true);
  });

  it("refuses other origins, look-alikes and a missing header", () => {
    expect(isSameOriginRequest("https://evil.example", url)).toBe(false);
    expect(isSameOriginRequest("http://captureflow.dev", url)).toBe(false);
    expect(
      isSameOriginRequest("https://captureflow.dev.evil.example", url),
    ).toBe(false);
    expect(isSameOriginRequest(null, url)).toBe(false);
  });
});
