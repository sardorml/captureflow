export type CursorState = "scroll-down" | "scroll-up" | "type" | "key" | "";

/*
 * Runs in every page before its own scripts. A headless screencast has no
 * pointer, so the recording would show clicks landing out of nowhere; this
 * draws one that follows the agent's mouse, turns into a hand over links and
 * buttons, squashes on a click, and carries a small label for what the
 * agent is doing: scrolling, typing or pressing a key. The session sets
 * that label through window.__cfCursorState.
 */
export const CURSOR_SCRIPT = `(() => {
  if (window.__cfCursor) return;
  window.__cfCursor = true;
  const ARROW = '<svg class="arrow" viewBox="0 0 24 24"><path d="M5.5 3.2v17.6c0 .45.54.67.85.35l4.4-4.4h6.2c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.35z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const HAND = '<svg class="hand" viewBox="0 0 24 24"><path d="M8 13V5a1.5 1.5 0 0 1 3 0v6V7a1.5 1.5 0 0 1 3 0v4V9a1.5 1.5 0 0 1 3 0v2v-.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.5l-3.3-4.6a1.5 1.5 0 0 1 2.4-1.8L8 13z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const ICONS = {
    "scroll-down": '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "scroll-up": '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    type: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="11" rx="2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    key: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9 16h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    click: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#fff"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/></svg>',
  };
  const mount = () => {
    const root = document.documentElement;
    if (!root) return requestAnimationFrame(mount);
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = '<style>' +
      '.p{position:fixed;left:0;top:0;width:30px;height:30px;transform:translate(-100px,-100px);transition:transform 70ms cubic-bezier(.2,.7,.2,1);will-change:transform}' +
      '.p svg{position:absolute;inset:0;width:30px;height:30px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transition:transform 110ms ease,opacity 120ms ease;transform-origin:30% 20%}' +
      '.p .hand{opacity:0}.p.hand .hand{opacity:1}.p.hand .arrow{opacity:0}' +
      '.p.down svg{transform:scale(.86)}' +
      '.b{position:fixed;left:0;top:0;transform:translate(-100px,-100px);display:flex;align-items:center;gap:8px;height:36px;padding:0 15px 0 11px;border-radius:18px;background:rgba(17,17,17,.9);color:#fff;font:600 17px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;white-space:nowrap;opacity:0;transition:opacity 160ms ease,transform 70ms cubic-bezier(.2,.7,.2,1);box-shadow:0 6px 18px rgba(0,0,0,.28)}' +
      '.b.on{opacity:1}.b svg{width:20px;height:20px;display:block}' +
      '.b.scroll-down svg{animation:nd .7s ease-in-out infinite}.b.scroll-up svg{animation:nu .7s ease-in-out infinite}' +
      '@keyframes nd{50%{transform:translateY(4px)}}@keyframes nu{50%{transform:translateY(-4px)}}' +
      '.r{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid rgba(37,99,235,.9);animation:r .55s cubic-bezier(.2,.7,.2,1) forwards}' +
      '@keyframes r{from{transform:scale(.25);opacity:1}to{transform:scale(1.5);opacity:0}}' +
      '</style><div class="p">' + ARROW + HAND + '</div><div class="b"></div>';
    const pointer = shadow.querySelector(".p");
    const badge = shadow.querySelector(".b");
    let at = { x: -100, y: -100 };
    let pinned = "";
    let clickTimer = 0;
    const place = () => {
      pointer.style.transform = "translate(" + (at.x - 4) + "px," + (at.y - 3) + "px)";
      badge.style.transform = "translate(" + (at.x + 24) + "px," + (at.y + 30) + "px)";
    };
    const show = (kind, label) => {
      badge.className = kind ? "b on " + kind : "b";
      if (!kind) return;
      badge.innerHTML = (ICONS[kind] || "") + "<span></span>";
      badge.querySelector("span").textContent = label || "";
    };
    window.__cfCursorState = (kind, label) => {
      pinned = kind || "";
      clearTimeout(clickTimer);
      show(pinned, label);
    };
    window.__cfCursorHidden = (hidden) => {
      host.style.opacity = hidden ? "0" : "1";
    };
    addEventListener("mousemove", (e) => {
      at = { x: e.clientX, y: e.clientY };
      place();
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cursor = el ? getComputedStyle(el).cursor : "";
      pointer.classList.toggle("hand", cursor === "pointer");
    }, true);
    addEventListener("mousedown", (e) => {
      pointer.classList.add("down");
      const ring = document.createElement("div");
      ring.className = "r";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      shadow.appendChild(ring);
      setTimeout(() => ring.remove(), 600);
      if (pinned) return;
      show("click", "Click");
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => show("", ""), 900);
    }, true);
    addEventListener("mouseup", () => pointer.classList.remove("down"), true);
    root.appendChild(host);
  };
  mount();
})();`;
