/// <reference types="@cloudflare/workers-types" />

// A url() that is relative to the stylesheet's own address.
const RELATIVE_URL = /url\((["']?)(?![a-z][a-z\d+.-]*:|[/#])([^"')]+)\1\)/gi;

// Fonts are referenced relative to the stylesheet, so they are re-pointed
// before the text moves into a page at another address.
export function forInlining(css: string, address: URL): string {
  return css
    .replace(RELATIVE_URL, (_match, quote: string, ref: string) => {
      const { pathname, search, hash } = new URL(ref, address);
      return `url(${quote}${pathname}${search}${hash}${quote})`;
    })
    .replaceAll("</style", "<\\/style");
}

// Inlinable stylesheet text by path, read once per isolate from the assets.
const STYLESHEETS = new Map<string, Promise<string | null>>();

export function stylesheetText(
  assets: Fetcher,
  href: string,
  origin: string,
): Promise<string | null> {
  const cached = STYLESHEETS.get(href);
  if (cached) return cached;
  const address = new URL(href, origin);
  const text = assets
    .fetch(address)
    .then(async (res) =>
      res.ok ? forInlining(await res.text(), address) : null,
    )
    .catch(() => null);
  STYLESHEETS.set(href, text);
  void text.then((css) => {
    if (css === null) STYLESHEETS.delete(href);
  });
  return text;
}

// Names of the stylesheets a browser says it holds in its cache.
export const CACHED_STYLESHEETS_COOKIE = "captureflow_css";

export function stylesheetName(href: string): string {
  return href.slice(href.lastIndexOf("/") + 1).replace(/\.css$/, "");
}

export function cachedStylesheets(cookie: string | null): Set<string> {
  const saved = cookie
    ?.split(/;\s*/)
    .find((part) => part.startsWith(`${CACHED_STYLESHEETS_COOKIE}=`));
  const names = saved?.slice(CACHED_STYLESHEETS_COOKIE.length + 1) ?? "";
  return new Set(names.split(".").filter(Boolean));
}

/*
 * Runs in the page once it has loaded and keeps the cookie honest. A
 * stylesheet that came inline is downloaded, then asked for again: it is noted
 * only if that second request cost nothing, so a browser with caching off is
 * never trusted. One the server left as a link because of the cookie is
 * struck off if the browser had to download it after all.
 */
export const TRACK_CACHED_STYLESHEETS = `addEventListener("load",()=>{
const names=(document.cookie.match(/(?:^|; )${CACHED_STYLESHEETS_COOKIE}=([^;]*)/)?.[1]??"").split(".").filter(Boolean);
const save=()=>{document.cookie="${CACHED_STYLESHEETS_COOKIE}="+names.slice(-8).join(".")+"; path=/; max-age=31536000; samesite=lax"};
const cost=(href)=>performance.getEntriesByName(href).at(-1)?.transferSize;
const get=(href)=>fetch(href).then((res)=>res.blob()).then(()=>new Promise((done)=>setTimeout(done,200)));
for(const link of document.querySelectorAll('link[rel="stylesheet"][data-precedence]')){
const name=link.href.split("/").pop().replace(/\\.css$/,""),at=names.indexOf(name);
if(link.disabled){get(link.href).then(()=>get(link.href)).then(()=>{if(cost(link.href)===0&&!names.includes(name)){names.push(name);save()}}).catch(()=>{})}
else if(at>=0&&cost(link.href)>0){names.splice(at,1);save()}
}});`;
