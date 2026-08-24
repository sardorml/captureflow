import { ADMIN_ROLES, type AdminRole } from "./roles";

export type QuotaInput = {
  storageBytesOverride: number | null;
  activeRecordingsOverride: number | null;
  note: string | null;
};

const MAX_NOTE = 500;
// 1 PiB. An override is a support lever, not a way to disable accounting, and
// a fat-fingered value here silently turns the quota system off.
const MAX_STORAGE_BYTES = 1024 ** 5;
const MAX_ACTIVE_RECORDINGS = 1_000_000;

function hydrateCount(raw: unknown, max: number): number | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const n = Number(text);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > max) {
    return null;
  }
  return n;
}

/*
 * Server actions accept whatever the client posts, so the form values are
 * untrusted even behind the admin gate. A field that fails validation becomes
 * null (cleared) rather than throwing — null is the table's "no override".
 */
export function hydrateQuotaInput(form: {
  get(name: string): unknown;
}): QuotaInput {
  const note = String(form.get("note") ?? "").trim();
  return {
    storageBytesOverride: hydrateCount(
      form.get("storageBytesOverride"),
      MAX_STORAGE_BYTES,
    ),
    activeRecordingsOverride: hydrateCount(
      form.get("activeRecordingsOverride"),
      MAX_ACTIVE_RECORDINGS,
    ),
    note: note ? note.slice(0, MAX_NOTE) : null,
  };
}

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
