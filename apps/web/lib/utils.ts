import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Class-name combiner used across the marketing components: clsx for
// conditional joins, tailwind-merge to dedupe conflicting Tailwind utilities.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
