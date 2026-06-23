/*
 * Self-heals two browser stall modes (works in incognito but spins in a normal profile):
 * (1) bf-cache restore of a stale page; (2) ChunkLoadError when the cached HTML shell
 * points at chunks from an OLD_BUILD_ID deleted on deploy. Both recover via reload().
 *
 * Must inject via next/script strategy="beforeInteractive" so it runs BEFORE hydration —
 * a React-level guard can't fire when hydration itself is stuck. Exported as a raw STRING
 * because React 19 refuses to execute inline <script> rendered inside components.
 */
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
