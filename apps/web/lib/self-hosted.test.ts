import { readFileSync } from "node:fs";
import { isSelfHosted } from "@captureflow/quota";
import { describe, expect, it } from "vitest";

describe("isSelfHosted", () => {
  it("is off for the product and for a dev server that says so", () => {
    expect(isSelfHosted({ BETTER_AUTH_URL: "https://captureflow.dev" })).toBe(
      false,
    );
    expect(
      isSelfHosted({
        BETTER_AUTH_URL: "http://localhost:3032",
        CAPTUREFLOW_HOSTED: "true",
      }),
    ).toBe(false);
  });

  it("is on for any other address", () => {
    expect(isSelfHosted({ BETTER_AUTH_URL: "https://rec.acme.com" })).toBe(
      true,
    );
    expect(isSelfHosted({ BETTER_AUTH_URL: "http://localhost:3000" })).toBe(
      true,
    );
    expect(
      isSelfHosted({ BETTER_AUTH_URL: "https://captureflow.dev.evil.com" }),
    ).toBe(true);
  });

  it("stays off when there is no address to judge by", () => {
    expect(isSelfHosted({})).toBe(false);
    expect(isSelfHosted({ BETTER_AUTH_URL: "not a url" })).toBe(false);
    expect(isSelfHosted(null)).toBe(false);
  });

  // Merging to main deploys this file's vars; the product must never come up
  // self-hosted, which would send the landing page to /login.
  it("keeps the deployed worker in product mode", () => {
    const config = readFileSync(
      new URL("../wrangler.jsonc", import.meta.url),
      "utf8",
    );
    const url = /"BETTER_AUTH_URL":\s*"([^"]+)"/.exec(config)?.[1];
    expect(url).toBeDefined();
    expect(isSelfHosted({ BETTER_AUTH_URL: url })).toBe(false);
  });
});
