export const COUNTDOWN_OVERLAY_ID = "captureflow-countdown-overlay";

/*
 * Injected via chrome.scripting (serialized): a pre-roll countdown over the
 * page — big numeral flanked by cancel and skip controls. Args only — the
 * serialized body can't close over module scope.
 *
 * The overlay is display + input only; the service worker owns the clock and
 * starts capture on its own schedule. Buttons and Esc report through a raw
 * runtime message (the typed messaging layer ignores foreign shapes). The
 * last beat self-removes 150ms early so the overlay is off-screen before the
 * recorder's first frame.
 */
export function mountCountdownOverlay(seconds: number, rootId: string): void {
  document.getElementById(rootId)?.remove();

  const root = document.createElement("div");
  root.id = rootId;
  // Same backdrop as the recorder overlay's; inlined because the serialized
  // injection can't reach module scope.
  root.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;" +
    "justify-content:center;gap:40px;pointer-events:none;" +
    "background:rgba(10,11,14,.45);" +
    "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
    "font-family:system-ui,-apple-system,sans-serif;";

  const finish = (verdict: "cancel" | "skip" | null): void => {
    window.clearInterval(tick);
    window.removeEventListener("keydown", onKey, true);
    root.remove();
    if (verdict) {
      chrome.runtime.sendMessage({ captureflowCountdown: verdict });
    }
  };

  const sideButton = (label: string, svg: string): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.innerHTML = svg;
    b.style.cssText =
      "width:64px;height:64px;border-radius:50%;border:2px solid rgba(255,255,255,.9);" +
      "background:rgba(10,11,14,.35);color:#fff;cursor:pointer;pointer-events:auto;" +
      "display:flex;align-items:center;justify-content:center;padding:0;" +
      "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);";
    return b;
  };

  const cancelBtn = sideButton(
    "Cancel recording",
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  );
  cancelBtn.addEventListener("click", () => finish("cancel"));

  const circle = document.createElement("div");
  circle.style.cssText =
    "width:170px;height:170px;border-radius:50%;background:#2563eb;" +
    "box-shadow:0 0 0 10px rgba(37,99,235,.35),0 12px 40px rgba(0,0,0,.45);" +
    "display:flex;align-items:center;justify-content:center;";
  const numeral = document.createElement("div");
  numeral.style.cssText =
    "color:#fff;font-size:96px;font-weight:600;line-height:1;" +
    "font-variant-numeric:tabular-nums;";
  circle.appendChild(numeral);

  const skipBtn = sideButton(
    "Skip countdown",
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5l10 7-10 7V5z"/><path d="M19 5v14"/></svg>',
  );
  skipBtn.addEventListener("click", () => finish("skip"));

  const hint = document.createElement("div");
  hint.textContent = "Press Esc to cancel";
  hint.style.cssText =
    "position:fixed;left:50%;transform:translateX(-50%);bottom:18%;" +
    "color:#fff;background:rgba(10,11,14,.65);border-radius:8px;" +
    "padding:6px 12px;font-size:13px;";

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      finish("cancel");
    }
  };
  window.addEventListener("keydown", onKey, true);

  let remaining = seconds;
  const show = (n: number): void => {
    numeral.textContent = String(n);
    circle.animate(
      [
        { transform: "scale(.82)", opacity: 0.6 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 240, easing: "ease-out" },
    );
  };
  show(remaining);
  const tick = window.setInterval(() => {
    remaining -= 1;
    if (remaining >= 1) {
      show(remaining);
      if (remaining === 1) {
        // Clear the stage before the first recorded frame.
        window.setTimeout(() => finish(null), 850);
      }
    } else {
      finish(null);
    }
  }, 1000);
  if (seconds === 1) window.setTimeout(() => finish(null), 850);

  root.append(cancelBtn, circle, skipBtn, hint);
  document.documentElement.appendChild(root);
}

export function unmountCountdownOverlay(rootId: string): void {
  document.getElementById(rootId)?.remove();
}
