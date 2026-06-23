// Derive the source + state-sidecar R2 keys from a snap's primary
// storage key. The primary key holds the baked PNG (bg + screenshot +
// annotations). The `.source.png` sidecar holds the pristine pre-edit
// screenshot so subsequent edits start from clean pixels (no compounding
// bg frames). The `.state.json` sidecar holds the background + annotation
// list so the editor can rehydrate across reloads and devices.
//
// We branch on the bare `.png` suffix because that's what every upload
// writes (`snaps/<id>.png`); other extensions fall back to appending so
// the helper still produces a unique key.

const PNG = '.png';

export function sourceKeyFor(storageKey: string): string {
  if (storageKey.endsWith(PNG)) {
    return `${storageKey.slice(0, -PNG.length)}.source.png`;
  }
  return `${storageKey}.source.png`;
}

export function stateKeyFor(storageKey: string): string {
  if (storageKey.endsWith(PNG)) {
    return `${storageKey.slice(0, -PNG.length)}.state.json`;
  }
  return `${storageKey}.state.json`;
}
