// Self-heal script for two browser-side stall modes (tab spins forever
// in a normal profile but works in incognito):
//
//   1. bf-cache restore — back/forward revived a stale page from memory
//      whose state may reference resources the worker no longer serves.
//   2. ChunkLoadError — the cached HTML shell points at
//      `_next/static/<OLD_BUILD_ID>/…` chunks deleted on the latest
//      deploy, so React hydration stalls fetching them.
//
// Both recover via window.location.reload(), which respects the workers'
// `no-store` headers and pulls a fresh shell + current chunks together.
//
// Inject via `next/script` strategy="beforeInteractive" so it lands in
// <head> server-side and runs BEFORE hydration — a React-level guard
// couldn't fire when hydration itself is the thing that's stuck.
//
// Exported as a raw STRING (not a <script> element) to stay
// framework-agnostic and because React 19 refuses to execute inline
// <script> client-rendered inside components ("scripts inside React
// components are never executed..."). next/script injects the markup
// outside React's tree, so no warning fires.

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
