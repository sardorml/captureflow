import { PRODUCT_NAME, SOURCE_REPO_URL } from '@/lib/site';

/*
 * AGPL-3.0 §7(b) attribution notice + provenance canary. Two reasons it exists:
 *   1. Legal — §7(b) lets the author require this notice be preserved, so
 *      downstream operators must keep it.
 *   2. Detection — the visible text and the data-cf-attribution marker are
 *      searchable (Google / Shodan), so removing them both violates the
 *      licence and flags a deployment as an unauthorised fork.
 */
export function PoweredBy({ className = '' }: { className?: string }) {
  return (
    <a
      href={SOURCE_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cf-attribution="captureflow"
      className={`text-xs text-neutral-500 transition-colors hover:text-neutral-300 ${className}`}
    >
      Powered by {PRODUCT_NAME}
    </a>
  );
}
