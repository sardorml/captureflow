export type EngineLogger = {
  info(scope: string, message: string): void;
  warn(scope: string, message: string): void;
  error(scope: string, message: string): void;
  // Verbatim pass-through for the sidecar's own stderr lines.
  raw?(text: string): void;
};

export const noopLogger: EngineLogger = {
  info() {},
  warn() {},
  error() {},
};
