import {
  FREE_TIER,
  LIMIT_OVERRIDE_MAX,
  type LimitOverride,
} from "@captureflow/quota";
import { ADMIN_ROLES, type AdminRole } from "./roles";

export type Hydrated<T> = { ok: true; value: T } | { ok: false; error: string };

export function hydrateUserId(raw: unknown): string | null {
  const id = String(raw ?? "").trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

export function hydrateAdminId(raw: unknown): string | null {
  const id = String(raw ?? "").trim();
  return /^[A-Za-z0-9-]{1,64}$/.test(id) ? id : null;
}

// Lowercased so the UNIQUE constraint on admin_users.email is case-insensitive
// in practice — SQLite compares TEXT byte-wise.
export function hydrateEmail(raw: unknown): string | null {
  const email = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (email.length > 254) return null;
  return /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(email) ? email : null;
}

export const MIN_PASSWORD_LENGTH = 12;

export function hydratePassword(raw: unknown): string | null {
  const password = String(raw ?? "");
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= 200
    ? password
    : null;
}

export function hydrateRole(raw: unknown): AdminRole | null {
  const role = String(raw ?? "").trim();
  return ADMIN_ROLES.find((r) => r === role) ?? null;
}

export function hydrateInviteToken(raw: unknown): string | null {
  const token = String(raw ?? "").trim();
  return /^[A-Za-z0-9_-]{16,128}$/.test(token) ? token : null;
}

export function hydrateWorkspaceId(raw: unknown): string | null {
  const id = String(raw ?? "").trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

const FREE_MINUTES = FREE_TIER.maxRecordingMs / 60_000;

// Blank keeps the default. A number has to raise the limit, up to the ceiling.
function hydrateRaisedLimit(
  raw: unknown,
  label: string,
  above: number,
  max: number,
): Hydrated<number | null> {
  const text = String(raw ?? "").trim();
  if (text === "") return { ok: true, value: null };
  const value = Number(text);
  if (!/^\d+$/.test(text) || value <= above || value > max) {
    return {
      ok: false,
      error: `${label} must be a whole number from ${above + 1} to ${max.toLocaleString("en-US")}, or blank for the default.`,
    };
  }
  return { ok: true, value };
}

export function hydrateLimitOverride(raw: {
  recordings: unknown;
  minutes: unknown;
}): Hydrated<LimitOverride> {
  const recordings = hydrateRaisedLimit(
    raw.recordings,
    "Recordings",
    FREE_TIER.recordingsPerPerson,
    LIMIT_OVERRIDE_MAX.recordings,
  );
  if (!recordings.ok) return recordings;
  const minutes = hydrateRaisedLimit(
    raw.minutes,
    "Minutes",
    FREE_MINUTES,
    LIMIT_OVERRIDE_MAX.minutes,
  );
  if (!minutes.ok) return minutes;
  return {
    ok: true,
    value: {
      recordings: recordings.value,
      maxRecordingMs: minutes.value === null ? null : minutes.value * 60_000,
    },
  };
}
