import { describe, expect, it } from "vitest";
import { isSelfHosted } from "@captureflow/quota";

describe("isSelfHosted", () => {
  it("is on only for the exact string true", () => {
    expect(isSelfHosted({ SELF_HOSTED: "true" })).toBe(true);
    expect(isSelfHosted({ SELF_HOSTED: "1" })).toBe(false);
    expect(isSelfHosted({})).toBe(false);
    expect(isSelfHosted(null)).toBe(false);
  });
});
