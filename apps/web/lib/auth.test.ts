import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));

const { oauthErrorMessage, parseEmailDomains, signupAllowed } =
  await import("./auth");

// A Pro subscription bought without an account is attached to whoever signs up
// with its email, so that email has to be proven.
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

describe("oauthErrorMessage", () => {
  it("re-words a refused sign-up from the server's allowlist", () => {
    expect(
      oauthErrorMessage("Sign_up_with_a_Google_or_GitHub_account_on_@evil", [
        "acme.com",
      ]),
    ).toBe("Sign up with a Google or GitHub account on @acme.com.");
  });

  it("never echoes other error text", () => {
    expect(oauthErrorMessage("Call_this_number", ["acme.com"])).toBe(
      "Sign-in didn't finish. Please try again.",
    );
  });

  it("is null without an error", () => {
    expect(oauthErrorMessage(undefined, [])).toBe(null);
  });
});
