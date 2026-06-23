// Account-scoped quotas live in `@captureflow/quota`'s ACCOUNT_LIMITS.

export const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "image/jpeg"]);

export const ALLOWED_SOURCES = new Set(["instant", "edited"] as const);
export const ALLOWED_PRESETS = new Set(["share"] as const);

export type ShareSource = "instant" | "edited";
export type SharePreset = "share";
export type ShareState = "pending" | "ready" | "failed";
