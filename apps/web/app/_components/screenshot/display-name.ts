export function displayName(
  name: string | null,
  email: string | null,
  someone: string,
): string {
  if (name && name.trim()) return name.trim();
  if (email && email.trim()) return email.trim().split("@")[0] || someone;
  return someone;
}

export function avatarInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
