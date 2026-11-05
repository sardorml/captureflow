import { describe, expect, it } from "vitest";
import { assignableRoles } from "./labels";

describe("assignableRoles", () => {
  it("says what each role costs on the hosted product", () => {
    expect(assignableRoles(false).map((r) => r.hint)).toEqual([
      "Records into this workspace. A paid seat on Light and Pro.",
      "Watches and comments. Always free.",
    ]);
  });

  it("leaves plans and prices out when self-hosted", () => {
    expect(assignableRoles(true).map((r) => r.hint)).toEqual([
      "Records into this workspace.",
      "Watches and comments.",
    ]);
  });
});
