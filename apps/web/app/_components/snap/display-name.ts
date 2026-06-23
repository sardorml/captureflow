// Pick a human-friendly display name for the snap's owner. Both args
// are nullable because the LEFT JOIN that supplies them can miss when
// the user record is gone.
export function displayName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim();
  if (email && email.trim()) return email.trim().split('@')[0] || 'Someone';
  return 'Someone';
}

export function avatarInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
