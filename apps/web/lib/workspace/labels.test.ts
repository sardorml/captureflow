import { describe, expect, it } from "vitest";
import { APP_MESSAGES } from "@/lib/i18n/app/messages";
import { assignableRoles } from "./labels";

const copy = APP_MESSAGES.members;

describe("assignableRoles", () => {
  it("says what each role costs on the hosted product", () => {
    expect(assignableRoles(false, copy).map((r) => r.hint)).toEqual([
      "Records into this workspace. A paid seat on Light and Pro.",
      "Watches and comments. Always free.",
    ]);
  });

  it("leaves plans and prices out when self-hosted", () => {
    expect(assignableRoles(true, copy).map((r) => r.hint)).toEqual([
      "Records into this workspace.",
      "Watches and comments.",
    ]);
  });
});
