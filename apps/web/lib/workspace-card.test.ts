import { describe, expect, it } from "vitest";
import {
  WORKSPACE_CARD_PRESET_KEYS,
  parseWorkspaceCard,
  resolveWorkspaceCard,
  serializeWorkspaceCard,
  workspaceCardStyle,
} from "./workspace-card";

describe("workspace card background", () => {
  it("round-trips a preset name", () => {
    expect(parseWorkspaceCard("preset:mint")).toBe("mint");
    expect(serializeWorkspaceCard("mint")).toBe("preset:mint");
    expect(parseWorkspaceCard(serializeWorkspaceCard("ocean"))).toBe("ocean");
  });

  it("treats unknown presets, old image rows and junk as not chosen", () => {
    for (const bad of [
      null,
      "",
      "preset:plaid",
      "image:workspace-cards/a.png",
      "mint",
    ]) {
      expect(parseWorkspaceCard(bad)).toBe(null);
    }
  });

  it("gives every workspace a stable colour until one is picked", () => {
    const a = resolveWorkspaceCard(null, "ws_a");
    expect(a).toBe(resolveWorkspaceCard("", "ws_a"));
    expect(WORKSPACE_CARD_PRESET_KEYS).toContain(a);
    expect(resolveWorkspaceCard("preset:mint", "ws_a")).toBe("mint");
    const picked = new Set(
      ["ws_a", "ws_b", "ws_c", "ws_d", "ws_e", "ws_f"].map((id) =>
        resolveWorkspaceCard(null, id),
      ),
    );
    expect(picked.size).toBeGreaterThan(1);
  });

  it("paints a grained gradient for a preset", () => {
    const preset = workspaceCardStyle("ocean");
    expect(preset.backgroundImage).toContain("linear-gradient");
    expect(preset.backgroundImage).toContain("feTurbulence");
  });
});
