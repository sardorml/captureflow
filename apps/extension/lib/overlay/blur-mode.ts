export const BLUR_ATTR = "data-captureflow-blur";
export const BLUR_HOST_ID = "captureflow-blur";

type Node = { tagName: string; parentElement: Node | null };

const MEDIA_TAGS = new Set([
  "img",
  "video",
  "canvas",
  "picture",
  "svg",
  "iframe",
]);

const isRoot = (el: Node) => {
  const tag = el.tagName.toLowerCase();
  return tag === "html" || tag === "body";
};

const ancestors = <T extends Node>(el: T): T[] => {
  const chain: T[] = [];
  for (let at: T | null = el; at; at = at.parentElement as T | null) {
    chain.push(at);
  }
  return chain;
};

/*
 * What a click blurs, from everything under the pointer, topmost first.
 * Sites often lay an empty layer over a picture, so an image or video under
 * the pointer wins, grown to the outermost element with its box: X paints
 * the picture as a background and lays a transparent <img> copy over it. The
 * image only counts when that box holds the clicked element or matches it,
 * so an avatar over a banner doesn't reach the banner. A picture the pointer
 * can't hit (pointer-events: none, under a sibling layer) is found by looking
 * through the clicked element's nearest ancestors. Something already blurred
 * in the way is returned, so a second click clears it. The page root never
 * blurs, nor does anything the extension put on the page.
 */
export function blurTarget<T extends Node>(
  stack: T[],
  isBlurred: (el: T) => boolean,
  isOwn: (el: T) => boolean,
  hasBackgroundImage: (el: T) => boolean,
  sameBox: (a: T, b: T) => boolean,
  picturesUnder: (el: T) => T[],
): T | null {
  const top = stack[0];
  if (!top) return null;
  const topChain = ancestors(top);
  if (topChain.some(isOwn)) return null;
  const blurredOver = topChain.find(isBlurred);
  if (blurredOver) return blurredOver;

  for (const hit of stack) {
    if (isRoot(hit)) break;
    if (
      !MEDIA_TAGS.has(hit.tagName.toLowerCase()) &&
      !hasBackgroundImage(hit)
    ) {
      continue;
    }
    const picture = grow(hit, sameBox);
    const holdsTop =
      topChain.includes(picture) ||
      ancestors(hit).includes(top) ||
      sameBox(top, picture);
    if (!holdsTop) continue;
    return ancestors(picture).find(isBlurred) ?? picture;
  }

  for (const near of topChain.slice(0, NEAR_LEVELS)) {
    if (isRoot(near)) break;
    const [hidden] = picturesUnder(near);
    if (!hidden) continue;
    const picture = grow(hidden, sameBox);
    return ancestors(picture).find(isBlurred) ?? picture;
  }
  return isRoot(top) ? null : top;
}

const NEAR_LEVELS = 4;

function grow<T extends Node>(el: T, sameBox: (a: T, b: T) => boolean): T {
  let picture = el;
  for (
    let parent = picture.parentElement as T | null;
    parent && !isRoot(parent) && sameBox(parent, picture);
    parent = parent.parentElement as T | null
  ) {
    picture = parent;
  }
  return picture;
}

/*
 * The blur is an inline !important filter rather than a stylesheet rule: a
 * page's CSP can refuse a <style> the extension adds (X does), and an inline
 * important declaration outranks the page's own CSS. The attribute marks what
 * we blurred, holding any filter the element had before.
 */
function setBlurred(el: Element, on: boolean): void {
  const style = (el as HTMLElement).style;
  if (!style) return;
  if (on) {
    el.setAttribute(BLUR_ATTR, style.getPropertyValue("filter"));
    style.setProperty("filter", "blur(12px)", "important");
    return;
  }
  const before = el.getAttribute(BLUR_ATTR) ?? "";
  el.removeAttribute(BLUR_ATTR);
  if (before) style.setProperty("filter", before);
  else style.removeProperty("filter");
}

const TOOLBAR_CSS = `
  .toolbar {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 6px 6px 16px;
    border: 1px solid #3b3d42;
    border-radius: 999px;
    background: #292a2e;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    font: 500 13px/1 ui-sans-serif, system-ui, -apple-system, sans-serif;
    color: #f2f3f5;
    white-space: nowrap;
  }
  .hint { margin-right: 6px; color: #c9cbd1; }
  button {
    height: 32px;
    padding: 0 14px;
    border: 0;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
    background: #36373c;
    color: #f2f3f5;
  }
  button:hover { background: #404146; }
  button:disabled { color: #6a6b72; cursor: default; background: #36373c; }
  .done { background: #0485f7; color: #fff; }
  .done:hover { background: #0373d6; }
  .highlight {
    position: fixed;
    z-index: 2147483646;
    box-sizing: border-box;
    border: 2px solid #0485f7;
    border-radius: 6px;
    background: rgba(4, 133, 247, 0.12);
    pointer-events: none;
    display: none;
  }
  .mark {
    position: fixed;
    z-index: 2147483645;
    box-sizing: border-box;
    border: 2px dashed #0485f7;
    border-radius: 6px;
    pointer-events: none;
  }
  .highlight.clear { border-color: #ec5e3b; background: rgba(236, 94, 59, 0.12); }
`;

// Pointer events the page must not see while blurring, so a click blurs a
// link instead of following it.
const SWALLOWED = [
  "pointerdown",
  "pointerup",
  "mousedown",
  "mouseup",
  "click",
  "dblclick",
  "contextmenu",
] as const;

/*
 * Click-to-blur on the page itself. The blur is a CSS filter on the page's
 * own elements, so it's in the picture for a tab, window or screen recording
 * alike, and it stays after Done until cleared or the page reloads.
 */
export function startBlurMode(onDone: () => void, ownIds: string[]): void {
  if (document.getElementById(BLUR_HOST_ID)) return;

  const host = document.createElement("div");
  host.id = BLUR_HOST_ID;
  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = TOOLBAR_CSS;
  const highlight = document.createElement("div");
  highlight.className = "highlight";
  const marks = document.createElement("div");
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  const hint = document.createElement("span");
  hint.className = "hint";
  hint.textContent = "Click anything to blur it";
  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "Clear all";
  const done = document.createElement("button");
  done.type = "button";
  done.className = "done";
  done.textContent = "Done";
  toolbar.append(hint, clear, done);
  shadow.append(style, marks, highlight, toolbar);
  document.documentElement.appendChild(host);

  const own = new Set([BLUR_HOST_ID, ...ownIds]);
  const blurredCount = () => document.querySelectorAll(`[${BLUR_ATTR}]`).length;
  const syncClear = () => {
    clear.disabled = blurredCount() === 0;
  };
  syncClear();

  const hasBackgroundImage = (el: Element) =>
    getComputedStyle(el).backgroundImage.includes("url(");
  const isPicture = (el: Element) =>
    MEDIA_TAGS.has(el.tagName.toLowerCase()) || hasBackgroundImage(el);
  const area = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height;
  };
  const picturesAt = (root: Element, x: number, y: number) =>
    [...root.querySelectorAll("*")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          x >= r.left &&
          x <= r.right &&
          y >= r.top &&
          y <= r.bottom &&
          isPicture(el)
        );
      })
      .sort((a, b) => area(a) - area(b));

  const target = (x: number, y: number): Element | null =>
    blurTarget(
      document.elementsFromPoint(x, y),
      (el) => el.hasAttribute(BLUR_ATTR),
      (el) => own.has(el.id),
      hasBackgroundImage,
      (a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return (
          Math.abs(ra.left - rb.left) < 2 &&
          Math.abs(ra.top - rb.top) < 2 &&
          Math.abs(ra.width - rb.width) < 2 &&
          Math.abs(ra.height - rb.height) < 2
        );
      },
      (el) => picturesAt(el, x, y),
    );

  // Boxes around what's blurred, drawn every frame so they follow scrolling
  // and layout. They live in this layer, not on the page: an outline on the
  // element itself would be blurred along with it.
  let frame = 0;
  const drawMarks = () => {
    const blurred = document.querySelectorAll(`[${BLUR_ATTR}]`);
    while (marks.children.length < blurred.length) {
      const mark = document.createElement("div");
      mark.className = "mark";
      marks.appendChild(mark);
    }
    while (marks.children.length > blurred.length) marks.lastChild?.remove();
    blurred.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const mark = marks.children[i] as HTMLElement;
      mark.style.left = `${rect.left}px`;
      mark.style.top = `${rect.top}px`;
      mark.style.width = `${rect.width}px`;
      mark.style.height = `${rect.height}px`;
    });
    frame = requestAnimationFrame(drawMarks);
  };
  drawMarks();

  const fromToolbar = (event: Event) => event.composedPath().includes(host);

  const onMove = (event: PointerEvent) => {
    const el = fromToolbar(event) ? null : target(event.clientX, event.clientY);
    if (!el) {
      highlight.style.display = "none";
      return;
    }
    const rect = el.getBoundingClientRect();
    highlight.style.display = "block";
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.classList.toggle("clear", el.hasAttribute(BLUR_ATTR));
  };

  const onSwallow = (event: Event) => {
    if (fromToolbar(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type !== "click") return;
    const { clientX, clientY } = event as MouseEvent;
    const el = target(clientX, clientY);
    if (!el) return;
    setBlurred(el, !el.hasAttribute(BLUR_ATTR));
    highlight.classList.toggle("clear", el.hasAttribute(BLUR_ATTR));
    syncClear();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finish();
  };

  const onScroll = () => {
    highlight.style.display = "none";
  };

  function finish(): void {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onMove, true);
    for (const type of SWALLOWED) {
      window.removeEventListener(type, onSwallow, true);
    }
    window.removeEventListener("keydown", onKey, true);
    window.removeEventListener("scroll", onScroll, true);
    host.remove();
    onDone();
  }

  clear.addEventListener("click", () => {
    for (const el of document.querySelectorAll(`[${BLUR_ATTR}]`)) {
      setBlurred(el, false);
    }
    syncClear();
  });
  done.addEventListener("click", finish);

  window.addEventListener("pointermove", onMove, true);
  for (const type of SWALLOWED) {
    window.addEventListener(type, onSwallow, true);
  }
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("scroll", onScroll, true);
}
