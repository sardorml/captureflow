// The wordings browsers and bundlers use when a script the page asks for is gone, as after a deploy.
const CHUNK_MESSAGE =
  /loading chunk|failed to load chunk|loading css chunk|dynamically imported module|importing a module script failed|error loading dynamically imported/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "ChunkLoadError" || CHUNK_MESSAGE.test(error.message);
}

export const RELOAD_COOLDOWN_MS = 60_000;

// One reload per cooldown, so code that is truly missing shows the error instead of reloading forever.
export function shouldReload(
  lastReloadAt: number | null,
  now: number,
): boolean {
  return lastReloadAt === null || now - lastReloadAt > RELOAD_COOLDOWN_MS;
}
