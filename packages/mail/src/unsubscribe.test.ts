import { describe, expect, it } from "vitest";
import {
  unsubscribeToken,
  unsubscribeUrl,
  verifyUnsubscribeToken,
} from "./unsubscribe";

describe("unsubscribe tokens", () => {
  it("verifies its own token, ignoring case and whitespace in the address", async () => {
    const token = await unsubscribeToken("secret", "Ada@Example.com ");
    expect(
      await verifyUnsubscribeToken("secret", "ada@example.com", token),
    ).toBe(true);
  });

  it("rejects another address, another secret and a tampered token", async () => {
    const token = await unsubscribeToken("secret", "ada@example.com");
    expect(
      await verifyUnsubscribeToken("secret", "bob@example.com", token),
    ).toBe(false);
    expect(
      await verifyUnsubscribeToken("other", "ada@example.com", token),
    ).toBe(false);
    expect(
      await verifyUnsubscribeToken("secret", "ada@example.com", `${token}x`),
    ).toBe(false);
  });

  it("builds a link carrying the normalized address and its token", async () => {
    const url = new URL(
      await unsubscribeUrl("https://mail.example.com", "s", "Ada@Example.com"),
    );
    expect(url.pathname).toBe("/unsubscribe");
    expect(url.searchParams.get("e")).toBe("ada@example.com");
    expect(url.searchParams.get("t")).toBe(
      await unsubscribeToken("s", "ada@example.com"),
    );
  });
});
