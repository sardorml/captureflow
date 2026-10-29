// Renders a composition into library/: `pnpm make gifs/<name>.html`,
// `pnpm make images/<name>.html`, or `pnpm make video`.
import { findComposition } from "../lib/library.ts";
import type { MediaKind } from "../lib/media.ts";
import { renderComposition } from "../lib/render.ts";

const arg = process.argv[2];
const match = arg?.match(/^(images|gifs)\/([\w-]+)\.html$/);
const kind: MediaKind | null =
  arg === "video"
    ? "video"
    : match?.[1] === "images"
      ? "image"
      : match
        ? "gif"
        : null;
const slug = arg === "video" ? "promo" : match?.[2];

if (!kind || !slug) {
  console.error(
    "usage: pnpm make images/<name>.html | gifs/<name>.html | video",
  );
  process.exit(1);
}

const composition = await findComposition(kind, slug);
if (!composition) {
  console.error(`no composition at hyperframes/${arg}`);
  process.exit(1);
}

const result = await renderComposition(composition);
if (!result.ok) {
  console.error(result.error);
  process.exit(1);
}
console.log(`library/${result.file}`);
