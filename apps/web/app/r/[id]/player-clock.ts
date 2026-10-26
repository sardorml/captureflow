// The nav's share dialog renders outside the viewer tree, so the viewer hands
// it the player's clock through here instead of through props.
let read: (() => number) | null = null;

export function registerPlayerClock(fn: () => number): () => void {
  read = fn;
  return () => {
    if (read === fn) read = null;
  };
}

export function currentPlayerMs(): number {
  return read ? read() : 0;
}
