// Self-heal script for two known browser-side stall modes that show
// up as "the tab keeps spinning forever in my regular profile but
// works in incognito":
//
//   1. bf-cache restore — the browser revived a stale page from
//      memory (back/forward navigation). Any state is from a previous
//      load and may reference resources the worker no longer serves.
//   2. ChunkLoadError — the cached HTML shell points at
//      `_next/static/<OLD_BUILD_ID>/…` chunks the worker deleted on
//      the latest deploy. React hydration stalls trying to fetch
//      them.
//
// Both recover by `window.location.reload()`, which respects the
// `no-store` cache headers the workers set and pulls a fresh shell +
// the current chunks together.
//
// Consumers render this via `next/script` with `strategy="beforeInteractive"`,
// which injects it into the document <head> server-side so it runs BEFORE
// React hydrates. A React-level guard wouldn't fire when hydration itself is
// the thing that's stuck — which is exactly the failure mode we recover from.
//
// We export the raw STRING (not a `<script>` element) so this package stays
// framework-agnostic and so React never client-renders an inline `<script>`,
// which in React 19 logs "scripts inside React components are never executed
// when rendering on the client." `next/script` injects the markup itself,
// outside React's element tree, so no such warning fires.

export const STALE_CHUNK_GUARD_SCRIPT = `
(function() {
  function isChunkError(s) {
    return s && (s.indexOf('ChunkLoadError') !== -1 ||
                 s.indexOf('Loading chunk') !== -1 ||
                 s.indexOf('Loading CSS chunk') !== -1 ||
                 s.indexOf('Failed to fetch dynamically imported module') !== -1);
  }
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) window.location.reload();
  });
  window.addEventListener('error', function(e) {
    var msg = (e && (e.message || (e.error && e.error.message))) || '';
    if (isChunkError(msg)) setTimeout(function() { window.location.reload(); }, 50);
  });
  window.addEventListener('unhandledrejection', function(e) {
    var r = e && e.reason;
    var msg = typeof r === 'string' ? r : (r && r.message) || '';
    if (isChunkError(msg)) setTimeout(function() { window.location.reload(); }, 50);
  });
})();`;
