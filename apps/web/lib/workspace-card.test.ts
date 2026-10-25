import { describe, expect, it } from "vitest";
import {
  parseWorkspaceCard,
  serializeWorkspaceCard,
  workspaceCardStyle,
} from "./workspace-card";

describe("workspace card background", () => {
  it("round-trips a preset and an image", () => {
    expect(parseWorkspaceCard("preset:mint")).toEqual({
      kind: "preset",
      key: "mint",
    });
    expect(parseWorkspaceCard("image:workspace-cards/abc.webp")).toEqual({
      kind: "image",
      key: "workspace-cards/abc.webp",
    });
    expect(
      serializeWorkspaceCard(parseWorkspaceCard("image:workspace-cards/a.png")),
    ).toBe("image:workspace-cards/a.png");
    expect(serializeWorkspaceCard(null)).toBe(null);
  });

  it("drops unknown presets, stray keys and junk", () => {
    for (const bad of [
      null,
      "",
      "preset:plaid",
      "image:videos/x.mp4",
      "image:../etc",
      "mint",
    ]) {
      expect(parseWorkspaceCard(bad)).toBe(null);
    }
  });

  it("paints a gradient for presets and a versioned image otherwise", () => {
    const preset = workspaceCardStyle({ kind: "preset", key: "ocean" }, 1);
    expect(preset.backgroundImage).toContain("linear-gradient");
    expect(preset.backgroundImage).toContain("feTurbulence");
    const image = workspaceCardStyle(
      { kind: "image", key: "workspace-cards/a.png" },
      42,
    );
    expect(image.backgroundImage).toContain("workspace-cards/a.png?v=42");
    expect(image.backgroundSize).toBe("cover");
    expect(workspaceCardStyle(null, 1)).toEqual({});
  });
});
