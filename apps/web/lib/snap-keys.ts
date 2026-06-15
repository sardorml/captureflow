// Derive the source + state-sidecar R2 keys from a snap's primary
// storage key. The editor saves a baked PNG (bg + screenshot +
// annotations) to the primary key so the public share link looks
// like what the user previewed. The `.source.png` sidecar holds the
// pristine pre-edit screenshot so subsequent edits start from clean
// pixels (no compounding bg frames). The `.state.json` sidecar holds
// the current background + annotation list so the editor can rehydrate
// across reloads and across devices.
//
// We branch on the bare `.png` suffix because that's what every
// upload writes (`snaps/<id>.png`). If a snap were ever stored under
// a different extension we'd fall back to appending so the helper
// still produces a unique key.

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
