import { describe, expect, it } from "vitest";
import { RecordingApiHttpError } from "../lib/api/client";
import { friendlyUploadError, isAuthFailure } from "../lib/api/errors";

describe("friendlyUploadError", () => {
  it("maps quota codes to actionable copy", () => {
    const err = new RecordingApiHttpError(
      "/init: HTTP 429",
      429,
      "active_limit",
    );
    expect(friendlyUploadError(err)).toMatch(/Recording limit reached/);
  });

  it("maps a revoked token to a re-sign-in prompt", () => {
    const err = new RecordingApiHttpError(
      "/init: HTTP 401",
      401,
      "invalid_token",
    );
    expect(friendlyUploadError(err)).toMatch(/Sign in again/);
  });

  it("keeps the server message for unmapped codes", () => {
    const err = new RecordingApiHttpError("/init: teapot", 418, "teapot");
    expect(friendlyUploadError(err)).toBe("/init: teapot");
  });

  it("turns fetch-level failures into a connectivity hint", () => {
    expect(friendlyUploadError(new TypeError("Failed to fetch"))).toMatch(
      /connection/,
    );
  });
});

describe("isAuthFailure", () => {
  it("is true only for HTTP 401", () => {
    expect(
      isAuthFailure(new RecordingApiHttpError("x", 401, "invalid_token")),
    ).toBe(true);
    expect(isAuthFailure(new RecordingApiHttpError("x", 429))).toBe(false);
    expect(isAuthFailure(new Error("x"))).toBe(false);
  });
});
