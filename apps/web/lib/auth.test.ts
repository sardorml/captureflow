import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));

const { claimableEmail } = await import("./auth");

// A Pro subscription bought without an account is attached to whoever signs up
// with its email, so that email has to be proven.
describe("claimableEmail", () => {
  it("claims for an address the sign-in provider verified", () => {
    expect(claimableEmail({ email: "a@b.co", emailVerified: true })).toBe(
      "a@b.co",
    );
  });

  it("refuses an unverified password sign-up", () => {
    expect(claimableEmail({ email: "a@b.co", emailVerified: false })).toBe(
      null,
    );
  });

  it("refuses when verification is missing", () => {
    expect(claimableEmail({ email: "a@b.co" })).toBe(null);
  });

  it("refuses a truthy non-boolean", () => {
    expect(claimableEmail({ email: "a@b.co", emailVerified: "true" })).toBe(
      null,
    );
  });
});
