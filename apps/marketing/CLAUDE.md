# Marketing studio (apps/marketing)

A local Next.js app (`pnpm dev` → http://localhost:3036, bound to 127.0.0.1, never deployed) for
marketing images, GIFs and videos. Everything is a HyperFrames composition in `hyperframes/`;
every render lands in the gitignored `library/`, which the app browses.

When asked to make an image, GIF or video: work in `hyperframes/` and follow
`hyperframes/CLAUDE.md`, then render it into the library with `pnpm make images/<name>.html`,
`pnpm make gifs/<name>.html` or `pnpm make video`. The app picks up new compositions and renders
on reload.

- `lib/media.ts` — kinds, library file naming (pure, tested)
- `lib/library.ts` — composition and library listing; `resolveLibraryFile` is the only way to a path in `library/`
- `lib/render.ts` — runs the pinned `hyperframes` binary; shared by the app's server actions and `scripts/make.ts`
- The HyperFrames Studio runs on :3037 and is embedded on the Video page.
