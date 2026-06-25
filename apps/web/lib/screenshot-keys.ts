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
