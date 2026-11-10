import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { skillDir } from "./skill";

describe("skillDir", () => {
  it("defaults to the user's Claude Code skills", () => {
    expect(skillDir([], "/repo")).toBe(
      join(homedir(), ".claude", "skills", "captureflow"),
    );
  });

  it("uses the project with --project", () => {
    expect(skillDir(["install-skill", "--project"], "/repo")).toBe(
      "/repo/.claude/skills/captureflow",
    );
  });

  it("takes another agent's skills folder with --dir", () => {
    expect(skillDir(["--dir", ".agents/skills"], "/repo")).toBe(
      "/repo/.agents/skills/captureflow",
    );
  });
});
