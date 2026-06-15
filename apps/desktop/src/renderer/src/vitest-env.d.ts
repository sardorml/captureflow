// Ambient test types for the renderer (web) Vitest project. Referenced (not a
// `types` allowlist) so it adds Vitest globals + jest-dom matchers without
// dropping the default ambient @types the renderer build relies on.
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
