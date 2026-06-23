import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// twMerge resolves conflicting Tailwind utilities (e.g. `p-2 p-4` → `p-4`)
// so caller overrides win over a component's defaults; clsx handles
// conditional class objects.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
