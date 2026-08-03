import { describe, expect, it } from "vitest";
import {
  decideAuthSync,
  isDesynced,
  type AuthSyncVerdict,
} from "../lib/auth/sync";

const live = { kind: "ok", userId: "user_1" } as const;

describe("decideAuthSync", () => {
  it("stays in sync when the token and the browser are the same user", () => {
    expect(decideAuthSync(live, { kind: "signed-in", userId: "user_1" })).toBe(
      "in-sync",
    );
  });

  it("flags a browser signed in to another account", () => {
    expect(decideAuthSync(live, { kind: "signed-in", userId: "user_2" })).toBe(
      "other-user",
    );
  });

  it("flags a signed-out browser", () => {
    expect(decideAuthSync(live, { kind: "signed-out" })).toBe("signed-out");
  });

  it("flags a revoked token even when the browser agrees on the user", () => {
    expect(
      decideAuthSync({ kind: "invalid" }, { kind: "signed-in", userId: "u" }),
    ).toBe("revoked");
  });

  it("keeps the token when the auth probe is inconclusive", () => {
    expect(
      decideAuthSync({ kind: "unreachable" }, { kind: "signed-out" }),
    ).toBe("unknown");
  });
});

describe("isDesynced", () => {
  it("only drops the token on a definitive mismatch", () => {
    const drop: AuthSyncVerdict[] = ["revoked", "signed-out", "other-user"];
    const keep: AuthSyncVerdict[] = ["in-sync", "unknown"];
    expect(drop.map(isDesynced)).toEqual([true, true, true]);
    expect(keep.map(isDesynced)).toEqual([false, false]);
  });
});
