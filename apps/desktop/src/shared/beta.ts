// Beta-flow gate. Set at build time by electron.vite.config.ts from
// package.json#version (`-beta` suffix → true). Drop the suffix to flip
// every beta-only path off in one go.
declare const __IS_BETA__: boolean

export const IS_BETA: boolean = __IS_BETA__
