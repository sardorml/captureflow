// Share-specific constants. Account-scoped quotas (totalStorageBytes,
// activeArtifactsPerAccount, per-share size + duration) live in
// `@captureflow/quota`'s ACCOUNT_LIMITS — both the share and snap
// surfaces pull from there so the cap math is one source of truth.

export const ALLOWED_CONTENT_TYPES = new Set(['video/mp4', 'image/jpeg']);

export const ALLOWED_SOURCES = new Set(['instant', 'edited'] as const);
export const ALLOWED_PRESETS = new Set(['share'] as const);

export type ShareSource = 'instant' | 'edited';
export type SharePreset = 'share';
export type ShareState = 'pending' | 'ready' | 'failed';
