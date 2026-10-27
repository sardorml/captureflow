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
