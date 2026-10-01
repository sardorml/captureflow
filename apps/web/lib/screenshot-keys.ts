const PNG = ".png";

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

// Every R2 object a screenshot owns, for the delete action and retention sweep.
export function screenshotObjectKeysFor(storageKey: string): string[] {
  return [storageKey, sourceKeyFor(storageKey), stateKeyFor(storageKey)];
}
