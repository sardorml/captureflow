import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));

const { claimableEmail, parseEmailDomains, signupAllowed } =
  await import("./auth");

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

describe("parseEmailDomains", () => {
  it("normalizes a comma-separated list", () => {
    expect(parseEmailDomains(" Acme.com, @acme.io ,, ")).toEqual([
      "acme.com",
      "acme.io",
    ]);
  });

  it("is empty when unset", () => {
    expect(parseEmailDomains(undefined)).toEqual([]);
  });
});

describe("signupAllowed", () => {
  const domains = ["acme.com"];

  it("leaves sign-up open without an allowlist", () => {
    expect(signupAllowed({ email: "a@else.com" }, [])).toBe(true);
  });

  it("allows a verified address on an allowed domain", () => {
    expect(
      signupAllowed({ email: "a@ACME.com", emailVerified: true }, domains),
    ).toBe(true);
  });

  it("refuses an unverified password sign-up on an allowed domain", () => {
    expect(
      signupAllowed({ email: "a@acme.com", emailVerified: false }, domains),
    ).toBe(false);
  });

  it("refuses a verified address on another domain", () => {
    expect(
      signupAllowed({ email: "a@evil.com", emailVerified: true }, domains),
    ).toBe(false);
  });

  it("refuses a lookalike subdomain", () => {
    expect(
      signupAllowed(
        { email: "a@acme.com.evil.io", emailVerified: true },
        domains,
      ),
    ).toBe(false);
  });
});
