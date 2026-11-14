import { describe, expect, it } from "vitest";
import { respellForKokoro } from "./pronounce";

describe("respellForKokoro", () => {
  it("respells the verb when an object follows", () => {
    expect(respellForKokoro("The skill records a demo.")).toBe(
      "The skill rekords a demo.",
    );
    expect(respellForKokoro("Agents record your screen.")).toBe(
      "Agents rekord your screen.",
    );
    expect(respellForKokoro("Record the tab")).toBe("Rekord the tab");
  });

  it("splits the product name into two words", () => {
    expect(respellForKokoro("Type slash captureflow on a branch.")).toBe(
      "Type slash capture flow on a branch.",
    );
    expect(respellForKokoro("CaptureFlow records each step.")).toBe(
      "Capture Flow rekords each step.",
    );
  });

  it("leaves the noun and the other forms alone", () => {
    for (const text of [
      "The DNS records are set.",
      "It keeps a record of each run.",
      "The recording is saved, and recorded chapters stay.",
    ]) {
      expect(respellForKokoro(text)).toBe(text);
    }
  });
});
