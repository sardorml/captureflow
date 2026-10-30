/*
 * Runs in every page before its own scripts. A headless screencast has no
 * pointer, so the recording would show clicks landing out of nowhere; this
 * draws one that follows the agent's mouse and ripples on each click.
 */
export const CURSOR_SCRIPT = `(() => {
  if (window.__cfCursor) return;
  window.__cfCursor = true;
  const mount = () => {
    const root = document.documentElement;
    if (!root) return requestAnimationFrame(mount);
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = '<style>' +
      '.p{position:fixed;left:0;top:0;width:22px;height:22px;transform:translate(-100px,-100px);transition:transform 40ms linear}' +
      '.p svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}' +
      '.r{position:fixed;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;background:rgba(37,99,235,.35);animation:r .5s ease-out forwards}' +
      '@keyframes r{from{transform:scale(.3);opacity:1}to{transform:scale(1.4);opacity:0}}' +
      '</style><div class="p"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l15 11.5-6.6.9 3.9 7.4-2.9 1.5-3.9-7.5L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg></div>';
    const pointer = shadow.querySelector(".p");
    addEventListener("mousemove", (e) => {
      pointer.style.transform = "translate(" + (e.clientX - 3) + "px," + (e.clientY - 2) + "px)";
    }, true);
    addEventListener("mousedown", (e) => {
      const ring = document.createElement("div");
      ring.className = "r";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      shadow.appendChild(ring);
      setTimeout(() => ring.remove(), 600);
    }, true);
    root.appendChild(host);
  };
  mount();
})();`;
