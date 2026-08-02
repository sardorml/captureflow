// The server can't cap a live stream's length (no duration known at init), so
// the client enforces a hard ceiling. Standalone module: the control bar
// content script needs the number without pulling in the recorder bundle.
export const MAX_DURATION_MS = 30 * 60 * 1000;
