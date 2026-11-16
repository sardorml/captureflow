import { describe, expect, it } from "vitest";
import { shouldLoadContestTracker } from "./contest-tracker";

describe("shouldLoadContestTracker", () => {
  it("loads on marketing pages of the hosted site", () => {
    expect(shouldLoadContestTracker("captureflow.dev", "/")).toBe(true);
    expect(shouldLoadContestTracker("captureflow.dev", "/pricing")).toBe(true);
    expect(shouldLoadContestTracker("captureflow.dev", "/de/pricing")).toBe(
      true,
    );
  });

  it("stays off share, invite and app pages", () => {
    expect(shouldLoadContestTracker("captureflow.dev", "/r/abc123")).toBe(
      false,
    );
    expect(shouldLoadContestTracker("captureflow.dev", "/s/abc123")).toBe(
      false,
    );
    expect(shouldLoadContestTracker("captureflow.dev", "/invite/token")).toBe(
      false,
    );
    expect(shouldLoadContestTracker("captureflow.dev", "/recordings")).toBe(
      false,
    );
  });

  it("stays off every other host", () => {
    expect(shouldLoadContestTracker("localhost", "/")).toBe(false);
    expect(shouldLoadContestTracker("videos.example.com", "/pricing")).toBe(
      false,
    );
  });
});
