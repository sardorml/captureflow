import { STORAGE_PLANS, type GrantedPlan } from "@captureflow/quota";
import { ADMIN_ROLES, type AdminRole } from "./roles";

export type QuotaInput = {
  storageBytesOverride: number | null;
  note: string | null;
};

export type Hydrated<T> = { ok: true; value: T } | { ok: false; error: string };

export const STORAGE_UNITS = {
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
} as const;

export type StorageUnit = keyof typeof STORAGE_UNITS;

const MAX_NOTE = 500;
// 1 PiB. An override is a support lever, not a way to disable accounting, and
// a fat-fingered value here silently turns the quota system off.
const MAX_STORAGE_BYTES = 1024 ** 5;
const DAY_MS = 24 * 3600 * 1000;

/*
 * Server actions accept whatever the client posts, so the form values are
 * untrusted even behind the admin gate. A blank amount clears the override; a
 * malformed one is an error rather than a silent clear, so a typo can't drop
 * someone back to the plan default.
 */
export function hydrateQuotaInput(form: {
  get(name: string): unknown;
}): Hydrated<QuotaInput> {
  const note = String(form.get("note") ?? "").trim();
  const amount = String(form.get("storageAmount") ?? "").trim();
  const unitRaw = String(form.get("storageUnit") ?? "GB");
  const unit = (Object.keys(STORAGE_UNITS) as StorageUnit[]).find(
    (u) => u === unitRaw,
  );
  if (!unit) return { ok: false, error: "Pick MB, GB or TB." };

  let storageBytesOverride: number | null = null;
  if (amount) {
    const n = Number(amount);
    const bytes = Math.round(n * STORAGE_UNITS[unit]);
    if (!/^\d+(\.\d+)?$/.test(amount) || !Number.isFinite(bytes)) {
      return { ok: false, error: "Enter the storage as a plain number." };
    }
    if (bytes > MAX_STORAGE_BYTES) {
      return { ok: false, error: "That is over the 1 PB ceiling." };
    }
    storageBytesOverride = bytes;
  }
  return {
    ok: true,
    value: {
      storageBytesOverride,
      note: note ? note.slice(0, MAX_NOTE) : null,
    },
  };
}

/*
 * "none" revokes the grant. An end date is a calendar day and the grant runs
 * through the end of it (UTC), so "until 2026-12-31" includes the 31st.
 */
export function hydrateGrantInput(
  form: { get(name: string): unknown },
  nowMs: number,
): Hydrated<GrantedPlan | null> {
  const plan = String(form.get("plan") ?? "").trim();
  if (plan === "none") return { ok: true, value: null };
  if (!STORAGE_PLANS.some((p) => p.variantId === plan)) {
    return { ok: false, error: "Pick a plan." };
  }
  const until = String(form.get("until") ?? "").trim();
  if (!until) return { ok: true, value: { variantId: plan, expiresAt: null } };
  const day = /^\d{4}-\d{2}-\d{2}$/.test(until)
    ? Date.parse(`${until}T00:00:00Z`)
    : NaN;
  if (!Number.isFinite(day))
    return { ok: false, error: "Enter a valid end date." };
  const expiresAt = day + DAY_MS;
  if (expiresAt <= nowMs) {
    return { ok: false, error: "The end date has already passed." };
  }
  return { ok: true, value: { variantId: plan, expiresAt } };
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
