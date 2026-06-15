import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger used by every shadcn primitive. clsx handles
// conditional class objects; twMerge resolves conflicting utility
// classes (e.g. `p-2 p-4` → `p-4`) so a caller's overrides actually
// win against the component's defaults.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
