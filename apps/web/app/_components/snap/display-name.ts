export function displayName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim();
  if (email && email.trim()) return email.trim().split("@")[0] || "Someone";
  return "Someone";
}

export function avatarInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
