import { describe, expect, it } from "vitest";
import { splitLead } from "./split-lead";

describe("splitLead", () => {
  it("splits after the first sentence", () => {
    expect(splitLead("One thing. Then two. Then three.")).toEqual({
      lead: "One thing.",
      rest: "Then two. Then three.",
    });
  });

  it("keeps a single sentence whole", () => {
    expect(splitLead("Just the one.")).toEqual({
      lead: "Just the one.",
      rest: "",
    });
  });

  it("doesn't split on a dot inside a word", () => {
    expect(splitLead("Runs on captureflow.dev today")).toEqual({
      lead: "Runs on captureflow.dev today",
      rest: "",
    });
  });
});
