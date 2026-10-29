import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import {
  KIND_DIR,
  MEDIA_KINDS,
  kindFromFile,
  slugFromOutput,
  type MediaKind,
} from "./media.ts";
import { HYPERFRAMES_DIR, LIBRARY_DIR } from "./paths.ts";

export type Composition = {
  kind: MediaKind;
  slug: string;
  source: string;
};

export type LibraryItem = {
  kind: MediaKind;
  file: string;
  slug: string;
  size: number;
  createdAt: number;
};

// Images live in hyperframes/images, GIFs in hyperframes/gifs; the video is
// the root timeline in hyperframes/index.html, which mounts compositions/.
export async function listCompositions(
  kind: MediaKind,
): Promise<Composition[]> {
  if (kind === "video") {
    return [{ kind, slug: "promo", source: "index.html" }];
  }
  const dir = KIND_DIR[kind];
  const files = await readdir(path.join(HYPERFRAMES_DIR, dir)).catch(() => []);
  return files
    .filter((f) => f.endsWith(".html"))
    .sort()
    .map((f) => ({
      kind,
      slug: f.replace(/\.html$/, ""),
      source: `${dir}/${f}`,
    }));
}

export async function findComposition(
  kind: MediaKind,
  slug: string,
): Promise<Composition | null> {
  const all = await listCompositions(kind);
  return all.find((c) => c.slug === slug) ?? null;
}

export async function listLibrary(kind?: MediaKind): Promise<LibraryItem[]> {
  const kinds = kind ? [kind] : MEDIA_KINDS;
  const items = await Promise.all(
    kinds.map(async (k) => {
      const dir = KIND_DIR[k];
      const files = await readdir(path.join(LIBRARY_DIR, dir)).catch(() => []);
      return Promise.all(
        files
          .filter((f) => kindFromFile(f) === k)
          .map(async (f) => {
            const info = await stat(path.join(LIBRARY_DIR, dir, f));
            return {
              kind: k,
              file: `${dir}/${f}`,
              slug: slugFromOutput(f),
              size: info.size,
              createdAt: info.mtimeMs,
            };
          }),
      );
    }),
  );
  return items.flat().sort((a, b) => b.createdAt - a.createdAt);
}

// Resolves a library-relative path, refusing anything that escapes library/.
export function resolveLibraryFile(file: string): string | null {
  const abs = path.resolve(LIBRARY_DIR, file);
  if (!abs.startsWith(LIBRARY_DIR + path.sep)) return null;
  return kindFromFile(abs) ? abs : null;
}

export async function deleteLibraryFile(file: string): Promise<boolean> {
  const abs = resolveLibraryFile(file);
  if (!abs) return false;
  await unlink(abs);
  return true;
}
