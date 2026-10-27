import { describe, expect, it } from "vitest";
import { MODEL, validateModel } from "./index";

describe("orbit model", () => {
  it("has no dangling references or duplicate ids", () => {
    expect(validateModel(MODEL)).toEqual([]);
  });

  it("gives every capability at least one actor and one interface", () => {
    const bare = MODEL.capabilities
      .filter((c) => c.actors.length === 0 || c.interfaces.length === 0)
      .map((c) => c.id);
    expect(bare).toEqual([]);
  });

  it("touches every entity from at least one capability", () => {
    const touched = new Set(
      MODEL.capabilities.flatMap((c) => c.effects.map((e) => e.entity)),
    );
    const orphans = MODEL.entities
      .filter((e) => !touched.has(e.id))
      .map((e) => e.id);
    expect(orphans).toEqual([]);
  });
});
